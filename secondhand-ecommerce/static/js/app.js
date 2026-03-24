// ==================== Flash Messages ====================
document.addEventListener('DOMContentLoaded', function() {
    // Auto-dismiss flash messages
    document.querySelectorAll('.flash').forEach(function(flash) {
        setTimeout(function() {
            flash.style.animation = 'flashIn 0.3s ease reverse';
            setTimeout(function() { flash.remove(); }, 300);
        }, 3000);
    });

    // Update unread message count
    updateUnreadCount();
    setInterval(updateUnreadCount, 15000);
});

function updateUnreadCount() {
    fetch('/api/unread_count')
        .then(function(r) { return r.ok ? r.json() : null; })
        .then(function(data) {
            if (!data) return;
            var badge = document.getElementById('msg-badge');
            if (badge) {
                if (data.count > 0) {
                    badge.textContent = data.count > 99 ? '99+' : data.count;
                    badge.style.display = 'flex';
                } else {
                    badge.style.display = 'none';
                }
            }
        })
        .catch(function() {});
}

// ==================== Image Upload Preview ====================
function setupImageUpload(inputId, previewId) {
    var input = document.getElementById(inputId);
    var preview = document.getElementById(previewId);
    if (!input || !preview) return;

    var uploadArea = input.closest('.upload-area');
    if (uploadArea) {
        uploadArea.addEventListener('click', function() { input.click(); });
        uploadArea.addEventListener('dragover', function(e) {
            e.preventDefault();
            uploadArea.style.borderColor = 'var(--primary)';
        });
        uploadArea.addEventListener('dragleave', function() {
            uploadArea.style.borderColor = 'var(--gray-300)';
        });
        uploadArea.addEventListener('drop', function(e) {
            e.preventDefault();
            uploadArea.style.borderColor = 'var(--gray-300)';
            input.files = e.dataTransfer.files;
            showPreviews(input.files, preview);
        });
    }

    input.addEventListener('change', function() {
        showPreviews(this.files, preview);
    });
}

function showPreviews(files, previewContainer) {
    previewContainer.innerHTML = '';
    Array.from(files).forEach(function(file) {
        if (!file.type.startsWith('image/')) return;
        var reader = new FileReader();
        reader.onload = function(e) {
            var div = document.createElement('div');
            div.className = 'upload-preview-item';
            div.innerHTML = '<img src="' + e.target.result + '" alt="preview">';
            previewContainer.appendChild(div);
        };
        reader.readAsDataURL(file);
    });
}

// ==================== Favorite Toggle ====================
function toggleFavorite(itemId, btn) {
    fetch('/api/favorite/' + itemId, { method: 'POST' })
        .then(function(r) { return r.json(); })
        .then(function(data) {
            if (data.status === 'added') {
                btn.classList.add('active');
                btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg> 已收藏';
            } else {
                btn.classList.remove('active');
                btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg> 收藏';
            }
        })
        .catch(function() { alert('请先登录'); });
}

// ==================== Gallery ====================
function switchImage(src, thumb) {
    var mainImg = document.getElementById('gallery-main-img');
    if (mainImg) {
        mainImg.src = src;
        document.querySelectorAll('.item-gallery-thumbs img').forEach(function(t) {
            t.classList.remove('active');
        });
        thumb.classList.add('active');
    }
}

// ==================== Chat ====================
var chatPollInterval = null;

function initChat(otherUserId, currentUserId) {
    var input = document.getElementById('chat-input');
    var sendBtn = document.getElementById('chat-send');
    var container = document.getElementById('chat-messages');
    var lastMsgId = 0;

    // Find last message ID
    var msgs = container.querySelectorAll('.message');
    if (msgs.length > 0) {
        var lastMsg = msgs[msgs.length - 1];
        lastMsgId = parseInt(lastMsg.dataset.id) || 0;
    }

    // Scroll to bottom
    container.scrollTop = container.scrollHeight;

    function sendMessage() {
        var text = input.value.trim();
        if (!text) return;

        var itemId = document.getElementById('chat-item-id');
        var body = {
            receiver_id: otherUserId,
            content: text,
            item_id: itemId ? parseInt(itemId.value) : null
        };

        fetch('/api/send_message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        })
        .then(function(r) { return r.json(); })
        .then(function(data) {
            if (data.id) {
                appendMessage(data, currentUserId);
                lastMsgId = data.id;
                input.value = '';
            }
        })
        .catch(function() { alert('发送失败'); });
    }

    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') sendMessage();
    });

    function pollMessages() {
        fetch('/api/messages/' + otherUserId + '?after=' + lastMsgId)
            .then(function(r) { return r.json(); })
            .then(function(messages) {
                messages.forEach(function(msg) {
                    if (msg.id > lastMsgId) {
                        appendMessage(msg, currentUserId);
                        lastMsgId = msg.id;
                    }
                });
            })
            .catch(function() {});
    }

    chatPollInterval = setInterval(pollMessages, 3000);

    function appendMessage(msg, currentUserId) {
        var div = document.createElement('div');
        div.className = 'message ' + (msg.sender_id === currentUserId ? 'sent' : 'received');
        div.dataset.id = msg.id;
        div.innerHTML =
            '<div>' +
                '<div class="message-bubble">' + escapeHtml(msg.content) + '</div>' +
                '<div class="message-time">' + msg.created_at + '</div>' +
            '</div>';
        container.appendChild(div);
        container.scrollTop = container.scrollHeight;
    }
}

function escapeHtml(text) {
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
