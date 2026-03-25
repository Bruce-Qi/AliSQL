import os
import uuid
from datetime import datetime
from functools import wraps

from flask import (
    Flask, render_template, request, redirect, url_for,
    flash, jsonify, send_from_directory, session
)
from flask_sqlalchemy import SQLAlchemy
from flask_login import (
    LoginManager, UserMixin, login_user, logout_user,
    login_required, current_user
)
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///secondhand.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['UPLOAD_FOLDER'] = os.path.join(os.path.dirname(__file__), 'static', 'uploads')
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max upload

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

db = SQLAlchemy(app)
login_manager = LoginManager(app)
login_manager.login_view = 'login'

os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)


# ==================== Models ====================

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    avatar = db.Column(db.String(256), default='default_avatar.png')
    bio = db.Column(db.String(500), default='')
    location = db.Column(db.String(100), default='')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    items = db.relationship('Item', backref='seller', lazy='dynamic')
    sent_messages = db.relationship('Message', foreign_keys='Message.sender_id', backref='sender', lazy='dynamic')
    received_messages = db.relationship('Message', foreign_keys='Message.receiver_id', backref='receiver', lazy='dynamic')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)


class Category(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)
    icon = db.Column(db.String(50), default='tag')
    items = db.relationship('Item', backref='category', lazy='dynamic')


class Item(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    price = db.Column(db.Float, nullable=False)
    original_price = db.Column(db.Float, default=0)
    condition = db.Column(db.String(20), default='good')  # new, like_new, good, fair, poor
    status = db.Column(db.String(20), default='available')  # available, reserved, sold
    views = db.Column(db.Integer, default=0)
    likes = db.Column(db.Integer, default=0)
    location = db.Column(db.String(100), default='')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    seller_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('category.id'))
    images = db.relationship('ItemImage', backref='item', lazy='dynamic', cascade='all, delete-orphan')
    favorites = db.relationship('Favorite', backref='item', lazy='dynamic', cascade='all, delete-orphan')


class ItemImage(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(256), nullable=False)
    is_primary = db.Column(db.Boolean, default=False)
    item_id = db.Column(db.Integer, db.ForeignKey('item.id'), nullable=False)


class Favorite(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    item_id = db.Column(db.Integer, db.ForeignKey('item.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    __table_args__ = (db.UniqueConstraint('user_id', 'item_id'),)


class Message(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    sender_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    receiver_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    item_id = db.Column(db.Integer, db.ForeignKey('item.id'))


class Order(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    order_no = db.Column(db.String(64), unique=True, nullable=False)
    price = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(20), default='pending')  # pending, paid, shipped, completed, cancelled
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    buyer_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    seller_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    item_id = db.Column(db.Integer, db.ForeignKey('item.id'), nullable=False)
    buyer = db.relationship('User', foreign_keys=[buyer_id])
    seller_rel = db.relationship('User', foreign_keys=[seller_id])
    item = db.relationship('Item')


@login_manager.user_loader
def load_user(user_id):
    return db.session.get(User, int(user_id))


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def save_upload(file):
    if file and allowed_file(file.filename):
        ext = file.filename.rsplit('.', 1)[1].lower()
        filename = f"{uuid.uuid4().hex}.{ext}"
        file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
        return filename
    return None


# ==================== Routes ====================

@app.route('/')
def index():
    page = request.args.get('page', 1, type=int)
    category_id = request.args.get('category', type=int)
    search = request.args.get('q', '')

    query = Item.query.filter_by(status='available')
    if category_id:
        query = query.filter_by(category_id=category_id)
    if search:
        query = query.filter(
            db.or_(
                Item.title.contains(search),
                Item.description.contains(search)
            )
        )
    items = query.order_by(Item.created_at.desc()).paginate(page=page, per_page=20, error_out=False)
    categories = Category.query.all()
    return render_template('index.html', items=items, categories=categories,
                           current_category=category_id, search=search)


@app.route('/register', methods=['GET', 'POST'])
def register():
    if current_user.is_authenticated:
        return redirect(url_for('index'))
    if request.method == 'POST':
        username = request.form.get('username', '').strip()
        email = request.form.get('email', '').strip()
        password = request.form.get('password', '')
        if not username or not email or not password:
            flash('请填写所有必填字段', 'error')
            return render_template('register.html')
        if len(password) < 6:
            flash('密码至少需要6个字符', 'error')
            return render_template('register.html')
        if User.query.filter_by(username=username).first():
            flash('用户名已存在', 'error')
            return render_template('register.html')
        if User.query.filter_by(email=email).first():
            flash('邮箱已被注册', 'error')
            return render_template('register.html')
        user = User(username=username, email=email)
        user.set_password(password)
        db.session.add(user)
        db.session.commit()
        login_user(user)
        flash('注册成功！', 'success')
        return redirect(url_for('index'))
    return render_template('register.html')


@app.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('index'))
    if request.method == 'POST':
        username = request.form.get('username', '').strip()
        password = request.form.get('password', '')
        user = User.query.filter_by(username=username).first()
        if user and user.check_password(password):
            login_user(user, remember=True)
            next_page = request.args.get('next')
            flash('登录成功！', 'success')
            return redirect(next_page or url_for('index'))
        flash('用户名或密码错误', 'error')
    return render_template('login.html')


@app.route('/logout')
@login_required
def logout():
    logout_user()
    flash('已退出登录', 'success')
    return redirect(url_for('index'))


@app.route('/publish', methods=['GET', 'POST'])
@login_required
def publish():
    if request.method == 'POST':
        title = request.form.get('title', '').strip()
        description = request.form.get('description', '').strip()
        price = request.form.get('price', type=float)
        original_price = request.form.get('original_price', 0, type=float)
        condition = request.form.get('condition', 'good')
        category_id = request.form.get('category_id', type=int)
        location = request.form.get('location', '').strip()

        if not title or not description or price is None:
            flash('请填写必填字段', 'error')
            return render_template('publish.html', categories=Category.query.all())

        item = Item(
            title=title, description=description, price=price,
            original_price=original_price, condition=condition,
            category_id=category_id, location=location,
            seller_id=current_user.id
        )
        db.session.add(item)
        db.session.flush()

        files = request.files.getlist('images')
        for i, file in enumerate(files):
            filename = save_upload(file)
            if filename:
                img = ItemImage(filename=filename, is_primary=(i == 0), item_id=item.id)
                db.session.add(img)

        db.session.commit()
        flash('发布成功！', 'success')
        return redirect(url_for('item_detail', item_id=item.id))

    categories = Category.query.all()
    return render_template('publish.html', categories=categories)


@app.route('/item/<int:item_id>')
def item_detail(item_id):
    item = db.session.get(Item, item_id)
    if not item:
        flash('商品不存在', 'error')
        return redirect(url_for('index'))
    item.views += 1
    db.session.commit()
    is_favorited = False
    if current_user.is_authenticated:
        is_favorited = Favorite.query.filter_by(
            user_id=current_user.id, item_id=item.id
        ).first() is not None
    seller_items = Item.query.filter(
        Item.seller_id == item.seller_id,
        Item.id != item.id,
        Item.status == 'available'
    ).limit(4).all()
    return render_template('item_detail.html', item=item,
                           is_favorited=is_favorited, seller_items=seller_items)


@app.route('/item/<int:item_id>/edit', methods=['GET', 'POST'])
@login_required
def edit_item(item_id):
    item = db.session.get(Item, item_id)
    if not item or item.seller_id != current_user.id:
        flash('无权编辑该商品', 'error')
        return redirect(url_for('index'))
    if request.method == 'POST':
        item.title = request.form.get('title', '').strip()
        item.description = request.form.get('description', '').strip()
        item.price = request.form.get('price', type=float)
        item.original_price = request.form.get('original_price', 0, type=float)
        item.condition = request.form.get('condition', 'good')
        item.category_id = request.form.get('category_id', type=int)
        item.location = request.form.get('location', '').strip()
        item.status = request.form.get('status', 'available')

        files = request.files.getlist('images')
        for i, file in enumerate(files):
            filename = save_upload(file)
            if filename:
                img = ItemImage(filename=filename, is_primary=False, item_id=item.id)
                db.session.add(img)

        db.session.commit()
        flash('更新成功！', 'success')
        return redirect(url_for('item_detail', item_id=item.id))
    categories = Category.query.all()
    return render_template('edit_item.html', item=item, categories=categories)


@app.route('/item/<int:item_id>/delete', methods=['POST'])
@login_required
def delete_item(item_id):
    item = db.session.get(Item, item_id)
    if not item or item.seller_id != current_user.id:
        flash('无权删除该商品', 'error')
        return redirect(url_for('index'))
    db.session.delete(item)
    db.session.commit()
    flash('商品已删除', 'success')
    return redirect(url_for('profile', user_id=current_user.id))


# ==================== Favorites ====================

@app.route('/api/favorite/<int:item_id>', methods=['POST'])
@login_required
def toggle_favorite(item_id):
    fav = Favorite.query.filter_by(user_id=current_user.id, item_id=item_id).first()
    if fav:
        db.session.delete(fav)
        item = db.session.get(Item, item_id)
        if item:
            item.likes = max(0, item.likes - 1)
        db.session.commit()
        return jsonify({'status': 'removed'})
    else:
        fav = Favorite(user_id=current_user.id, item_id=item_id)
        db.session.add(fav)
        item = db.session.get(Item, item_id)
        if item:
            item.likes += 1
        db.session.commit()
        return jsonify({'status': 'added'})


@app.route('/favorites')
@login_required
def favorites():
    favs = Favorite.query.filter_by(user_id=current_user.id)\
        .order_by(Favorite.created_at.desc()).all()
    items = [db.session.get(Item, f.item_id) for f in favs]
    items = [i for i in items if i]
    return render_template('favorites.html', items=items)


# ==================== Messages ====================

@app.route('/messages')
@login_required
def messages():
    # Get unique conversations
    conversations = db.session.query(
        db.func.max(Message.id).label('last_msg_id'),
        db.case(
            (Message.sender_id == current_user.id, Message.receiver_id),
            else_=Message.sender_id
        ).label('other_user_id')
    ).filter(
        db.or_(
            Message.sender_id == current_user.id,
            Message.receiver_id == current_user.id
        )
    ).group_by('other_user_id').subquery()

    conv_list = []
    for row in db.session.query(conversations).all():
        msg = db.session.get(Message, row.last_msg_id)
        other_user = db.session.get(User, row.other_user_id)
        if msg and other_user:
            unread = Message.query.filter_by(
                sender_id=other_user.id,
                receiver_id=current_user.id,
                is_read=False
            ).count()
            conv_list.append({
                'user': other_user,
                'last_message': msg,
                'unread': unread
            })
    conv_list.sort(key=lambda x: x['last_message'].created_at, reverse=True)
    return render_template('messages.html', conversations=conv_list)


@app.route('/chat/<int:user_id>')
@login_required
def chat(user_id):
    if user_id == current_user.id:
        return redirect(url_for('messages'))
    other_user = db.session.get(User, user_id)
    if not other_user:
        flash('用户不存在', 'error')
        return redirect(url_for('messages'))

    # Mark messages as read
    Message.query.filter_by(
        sender_id=user_id, receiver_id=current_user.id, is_read=False
    ).update({'is_read': True})
    db.session.commit()

    msgs = Message.query.filter(
        db.or_(
            db.and_(Message.sender_id == current_user.id, Message.receiver_id == user_id),
            db.and_(Message.sender_id == user_id, Message.receiver_id == current_user.id)
        )
    ).order_by(Message.created_at.asc()).all()

    item_id = request.args.get('item_id', type=int)
    item = db.session.get(Item, item_id) if item_id else None
    return render_template('chat.html', other_user=other_user, messages=msgs, item=item)


@app.route('/api/send_message', methods=['POST'])
@login_required
def send_message():
    data = request.get_json()
    receiver_id = data.get('receiver_id')
    content = data.get('content', '').strip()
    item_id = data.get('item_id')

    if not receiver_id or not content:
        return jsonify({'error': '参数不完整'}), 400

    msg = Message(
        content=content,
        sender_id=current_user.id,
        receiver_id=receiver_id,
        item_id=item_id
    )
    db.session.add(msg)
    db.session.commit()
    return jsonify({
        'id': msg.id,
        'content': msg.content,
        'created_at': msg.created_at.strftime('%Y-%m-%d %H:%M'),
        'sender_id': msg.sender_id
    })


@app.route('/api/messages/<int:user_id>')
@login_required
def get_messages(user_id):
    after_id = request.args.get('after', 0, type=int)
    msgs = Message.query.filter(
        Message.id > after_id,
        db.or_(
            db.and_(Message.sender_id == current_user.id, Message.receiver_id == user_id),
            db.and_(Message.sender_id == user_id, Message.receiver_id == current_user.id)
        )
    ).order_by(Message.created_at.asc()).all()

    # Mark as read
    for m in msgs:
        if m.receiver_id == current_user.id:
            m.is_read = True
    db.session.commit()

    return jsonify([{
        'id': m.id,
        'content': m.content,
        'created_at': m.created_at.strftime('%Y-%m-%d %H:%M'),
        'sender_id': m.sender_id
    } for m in msgs])


@app.route('/api/unread_count')
@login_required
def unread_count():
    count = Message.query.filter_by(receiver_id=current_user.id, is_read=False).count()
    return jsonify({'count': count})


# ==================== Orders ====================

@app.route('/buy/<int:item_id>', methods=['POST'])
@login_required
def buy_item(item_id):
    item = db.session.get(Item, item_id)
    if not item or item.status != 'available':
        flash('商品不可购买', 'error')
        return redirect(url_for('index'))
    if item.seller_id == current_user.id:
        flash('不能购买自己的商品', 'error')
        return redirect(url_for('item_detail', item_id=item_id))

    order = Order(
        order_no=f"ORD{datetime.utcnow().strftime('%Y%m%d%H%M%S')}{uuid.uuid4().hex[:6].upper()}",
        price=item.price,
        buyer_id=current_user.id,
        seller_id=item.seller_id,
        item_id=item.id
    )
    item.status = 'reserved'
    db.session.add(order)
    db.session.commit()
    flash('下单成功！请联系卖家完成交易', 'success')
    return redirect(url_for('order_detail', order_id=order.id))


@app.route('/order/<int:order_id>')
@login_required
def order_detail(order_id):
    order = db.session.get(Order, order_id)
    if not order or (order.buyer_id != current_user.id and order.seller_id != current_user.id):
        flash('订单不存在', 'error')
        return redirect(url_for('my_orders'))
    return render_template('order_detail.html', order=order)


@app.route('/order/<int:order_id>/update', methods=['POST'])
@login_required
def update_order(order_id):
    order = db.session.get(Order, order_id)
    if not order:
        flash('订单不存在', 'error')
        return redirect(url_for('my_orders'))

    action = request.form.get('action')
    if action == 'cancel':
        if order.buyer_id == current_user.id and order.status == 'pending':
            order.status = 'cancelled'
            order.item.status = 'available'
    elif action == 'pay':
        if order.buyer_id == current_user.id and order.status == 'pending':
            order.status = 'paid'
    elif action == 'ship':
        if order.seller_id == current_user.id and order.status == 'paid':
            order.status = 'shipped'
    elif action == 'confirm':
        if order.buyer_id == current_user.id and order.status == 'shipped':
            order.status = 'completed'
            order.item.status = 'sold'

    db.session.commit()
    flash('订单状态已更新', 'success')
    return redirect(url_for('order_detail', order_id=order.id))


@app.route('/my/orders')
@login_required
def my_orders():
    tab = request.args.get('tab', 'buy')
    if tab == 'buy':
        orders = Order.query.filter_by(buyer_id=current_user.id)\
            .order_by(Order.created_at.desc()).all()
    else:
        orders = Order.query.filter_by(seller_id=current_user.id)\
            .order_by(Order.created_at.desc()).all()
    return render_template('orders.html', orders=orders, tab=tab)


# ==================== Profile ====================

@app.route('/user/<int:user_id>')
def profile(user_id):
    user = db.session.get(User, user_id)
    if not user:
        flash('用户不存在', 'error')
        return redirect(url_for('index'))
    items = Item.query.filter_by(seller_id=user_id)\
        .order_by(Item.created_at.desc()).all()
    return render_template('profile.html', user=user, items=items)


@app.route('/settings', methods=['GET', 'POST'])
@login_required
def settings():
    if request.method == 'POST':
        current_user.bio = request.form.get('bio', '').strip()
        current_user.location = request.form.get('location', '').strip()
        avatar = request.files.get('avatar')
        if avatar:
            filename = save_upload(avatar)
            if filename:
                current_user.avatar = filename
        db.session.commit()
        flash('设置已保存', 'success')
        return redirect(url_for('profile', user_id=current_user.id))
    return render_template('settings.html')


# ==================== Init DB ====================

def init_db():
    with app.app_context():
        db.create_all()
        if not Category.query.first():
            categories = [
                Category(name='手机数码', icon='smartphone'),
                Category(name='电脑办公', icon='laptop'),
                Category(name='家用电器', icon='tv'),
                Category(name='服饰鞋包', icon='shirt'),
                Category(name='美妆护肤', icon='sparkles'),
                Category(name='图书教材', icon='book-open'),
                Category(name='运动户外', icon='dumbbell'),
                Category(name='母婴用品', icon='baby'),
                Category(name='家居家装', icon='sofa'),
                Category(name='游戏装备', icon='gamepad-2'),
                Category(name='乐器', icon='music'),
                Category(name='其他', icon='package'),
            ]
            db.session.add_all(categories)
            db.session.commit()


if __name__ == '__main__':
    init_db()
    app.run(debug=True, host='0.0.0.0', port=5000)
