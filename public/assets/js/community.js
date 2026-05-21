/**
 * SOCIAL HUB ENGINE - DMA
 * Professional community logic with likes, search and notifications.
 */

const COMMUNITY_DB_KEY = 'dma_community_posts';
const NOTIFS_KEY = 'dma_notifs';

const CommunityCore = {
    init() {
        const user = AuthCore.getCurrentUser();
        if (!user) {
            window.location.href = 'login.html';
            return;
        }

        this.currentUser = user;
        
        // One-time cleanup of old seed data
        let posts = JSON.parse(localStorage.getItem(COMMUNITY_DB_KEY)) || [];
        const cleanPosts = posts.filter(p => !p.id.startsWith('seed_'));
        if (posts.length !== cleanPosts.length) {
            localStorage.setItem(COMMUNITY_DB_KEY, JSON.stringify(cleanPosts));
        }

        this.updateUI();
        this.loadPosts();
        this.setupEventListeners();
        this.checkNotifications();
    },

    updateUI() {
        const avatar = this.currentUser.photo || 'assets/images/default-avatar.png';
        document.getElementById('nav-avatar').src = avatar;
        document.getElementById('form-avatar').src = avatar;
        document.getElementById('nav-username').textContent = this.currentUser.name.split(' ')[0];
    },

    getPosts() {
        return JSON.parse(localStorage.getItem(COMMUNITY_DB_KEY)) || [];
    },

    savePosts(posts) {
        localStorage.setItem(COMMUNITY_DB_KEY, JSON.stringify(posts));
    },

    loadPosts(filter = 'all', searchQuery = '') {
        const container = document.getElementById('posts-feed');
        container.innerHTML = '';
        
        let posts = this.getPosts();

        // Search filter
        if (searchQuery) {
            posts = posts.filter(p => 
                (p.text || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                (p.userName || "").toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Category filter
        if (filter !== 'all') {
            posts = posts.filter(p => p.category === filter);
        }

        // Sort by date
        posts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        posts.forEach(post => {
            const card = this.renderPost(post);
            container.appendChild(card);
        });
    },

    renderPost(post) {
        const div = document.createElement('div');
        div.className = 'social-card';
        
        // Fetch LATEST user info from DB to ensure photo is always up to date
        const allUsers = AuthCore.getUsers();
        const postAuthor = allUsers.find(u => u.name === post.userName) || {};
        const authorPhoto = postAuthor.photo || 'assets/images/default-avatar.png';

        const dateStr = this.formatDate(post.timestamp);
        const reactions = post.reactions || { like: 0, clap: 0, fire: 0, rocket: 0 };
        const userReactions = post.userReactions || {};
        const myReaction = userReactions[this.currentUser.email] || null;

        div.innerHTML = `
            <div class="card-header">
                <div class="user-meta">
                    <img src="${authorPhoto}" class="user-circle" style="width: 45px; height: 45px; object-fit: cover; cursor: pointer;" onclick="CommunityCore.showProfile('${post.userName}')">
                    <div>
                        <span class="user-name" style="cursor: pointer;" onclick="CommunityCore.showProfile('${post.userName}')">${post.userName} ${post.isOfficial ? '✅' : ''}</span>
                        <span class="post-date">${dateStr}</span>
                    </div>
                </div>
                <span class="category-pill">${post.category.toUpperCase()}</span>
            </div>
            <div class="post-body">
                <p style="margin-bottom: 1rem;" class="post-text-content"></p>
                ${post.media ? this.renderMedia(post.media) : ''}
            </div>
            
            <!-- Multi-Reactions Bar -->
            <div class="post-stats">
                <div class="reactions-container" style="display: flex; gap: 1rem;">
                    <div class="stat-item ${myReaction === 'like' ? 'liked' : ''}" onclick="CommunityCore.react('${post.id}', 'like')">
                        ❤️ <span class="count">${reactions.like || 0}</span>
                    </div>
                    <div class="stat-item ${myReaction === 'clap' ? 'liked' : ''}" onclick="CommunityCore.react('${post.id}', 'clap')">
                        👏 <span class="count">${reactions.clap || 0}</span>
                    </div>
                    <div class="stat-item ${myReaction === 'fire' ? 'liked' : ''}" onclick="CommunityCore.react('${post.id}', 'fire')">
                        🔥 <span class="count">${reactions.fire || 0}</span>
                    </div>
                    <div class="stat-item ${myReaction === 'rocket' ? 'liked' : ''}" onclick="CommunityCore.react('${post.id}', 'rocket')">
                        🚀 <span class="count">${reactions.rocket || 0}</span>
                    </div>
                </div>
                <div class="stat-item" onclick="CommunityCore.toggleComments('${post.id}')">
                    💬 ${post.comments.length}
                </div>
            </div>

            <div class="comments-area" id="comments-${post.id}" style="display: none; margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid var(--social-border);">
                <div class="comments-list">
                    ${post.comments.map(c => {
                        const commenter = allUsers.find(u => u.name === c.userName) || {};
                        const cPhoto = commenter.photo || 'assets/images/default-avatar.png';
                        return `
                            <div style="display: flex; gap: 0.8rem; margin-bottom: 1rem; align-items: flex-start;">
                                <img src="${cPhoto}" style="width: 30px; height: 30px; border-radius: 50%; object-fit: cover; cursor: pointer;" onclick="CommunityCore.showProfile('${c.userName}')">
                                <div style="background: #1a1a1a; padding: 0.6rem 1rem; border-radius: 12px; font-size: 0.85rem;">
                                    <strong style="color: var(--social-accent); display: block; margin-bottom: 2px; cursor: pointer;" onclick="CommunityCore.showProfile('${c.userName}')">${c.userName}</strong>
                                    ${c.text}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
                <div style="display: flex; gap: 1rem; margin-top: 1rem;">
                    <input type="text" placeholder="Répondre..." id="input-${post.id}" style="flex:1; background: #1a1a1a; border: 1px solid var(--social-border); border-radius: 8px; padding: 0.6rem; color: white;">
                    <button class="btn btn-primary" onclick="CommunityCore.addComment('${post.id}')" style="padding: 0.5rem 1rem; font-size: 0.8rem;">Envoyer</button>
                </div>
            </div>
        `;
        div.querySelector('.post-text-content').textContent = post.text || "";
        if (!post.text) div.querySelector('.post-text-content').style.display = 'none';
        return div;
    },

    react(postId, type) {
        const posts = this.getPosts();
        const post = posts.find(p => p.id === postId);
        if (!post) return;

        if (!post.reactions) post.reactions = { like: 0, clap: 0, fire: 0, rocket: 0 };
        if (!post.userReactions) post.userReactions = {};

        const userEmail = this.currentUser.email;
        const currentReaction = post.userReactions[userEmail];

        // If clicking same reaction, remove it
        if (currentReaction === type) {
            post.reactions[type]--;
            delete post.userReactions[userEmail];
        } else {
            // If had another reaction, remove old one
            if (currentReaction) {
                post.reactions[currentReaction]--;
            }
            // Add new reaction
            post.reactions[type]++;
            post.userReactions[userEmail] = type;
            
            this.addNotification(`${this.currentUser.name} a réagi avec ${type} !`);
        }

        this.savePosts(posts);
        this.loadPosts();
    },

    toggleComments(postId) {
        const el = document.getElementById(`comments-${postId}`);
        el.style.display = el.style.display === 'none' ? 'block' : 'none';
    },

    addComment(postId) {
        const input = document.getElementById(`input-${postId}`);
        const text = input.value.trim();
        if (!text) return;

        const posts = this.getPosts();
        const post = posts.find(p => p.id === postId);
        if (post) {
            post.comments.push({
                userName: this.currentUser.name,
                text: text,
                timestamp: new Date().toISOString()
            });
            this.savePosts(posts);
            this.loadPosts();
            document.getElementById(`comments-${postId}`).style.display = 'block';
            
            // If someone else's post, add notif
            if (post.userName !== this.currentUser.name) {
                this.addNotification(`${this.currentUser.name} a commenté votre publication.`);
            }
        }
    },

    renderMedia(media) {
        const src = media.data || '';
        if (!src) return '';

        if (media.type.startsWith('image')) {
            return `
                <div style="position: relative; cursor: pointer;" onclick="CommunityCore.openMediaViewer(this.querySelector('img').src, 'image')">
                    <img src="${src}" style="width: 100%; border-radius: 12px; border: 1px solid var(--social-border); margin-top: 0.5rem; max-height: 500px; object-fit: cover;" loading="lazy">
                    <div style="position: absolute; top: 12px; right: 12px; background: rgba(0,0,0,0.6); padding: 0.3rem 0.6rem; border-radius: 6px; font-size: 0.7rem; color: #ccc;">🔍 Agrandir</div>
                </div>`;
        } else if (media.type.startsWith('video')) {
            return `
                <video src="${src}" controls playsinline preload="metadata" style="width: 100%; border-radius: 12px; border: 1px solid var(--social-border); margin-top: 0.5rem; max-height: 400px; background: #000;"></video>
                <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.3rem;">🎬 Vidéo partagée par l'étudiant</div>`;
        }
        return '';
    },

    /**
     * Compress an image using Canvas API.
     * Returns a Promise that resolves to a base64 string.
     */
    compressImage(file, maxWidth = 1200, quality = 0.7) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    // Scale down if wider than maxWidth
                    if (width > maxWidth) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    const compressed = canvas.toDataURL('image/jpeg', quality);
                    resolve(compressed);
                };
                img.onerror = () => reject(new Error('Image invalide'));
                img.src = e.target.result;
            };
            reader.onerror = () => reject(new Error('Erreur de lecture du fichier'));
            reader.readAsDataURL(file);
        });
    },

    /**
     * Open full-screen media viewer.
     */
    openMediaViewer(src, type) {
        let viewer = document.getElementById('media-viewer');
        if (!viewer) {
            viewer = document.createElement('div');
            viewer.id = 'media-viewer';
            viewer.style.cssText = `
                position: fixed; inset: 0; background: rgba(0,0,0,0.95); z-index: 20000;
                display: flex; align-items: center; justify-content: center; padding: 2rem;
                cursor: zoom-out; animation: fadeIn 0.2s ease;
            `;
            viewer.onclick = () => { viewer.style.display = 'none'; viewer.innerHTML = ''; };
            document.body.appendChild(viewer);
        }
        if (type === 'image') {
            viewer.innerHTML = `<img src="${src}" style="max-width: 95vw; max-height: 90vh; border-radius: 12px; box-shadow: 0 0 60px rgba(214,163,47,0.2);">`;
        }
        viewer.style.display = 'flex';
    },

    async publishPost() {
        const text = document.getElementById('post-text').value.trim();
        const category = document.getElementById('post-category').value;
        if (!text && !this.pendingMedia) {
            document.getElementById('post-text').style.borderBottom = '2px solid #ef4444';
            setTimeout(() => document.getElementById('post-text').style.borderBottom = '', 1500);
            return;
        }

        const publishBtn = document.getElementById('publish-btn');
        publishBtn.disabled = true;
        publishBtn.textContent = '⏳ Publication...';

        let mediaData = null;

        // Save media using base64 compression
        if (this.pendingMedia) {
            publishBtn.textContent = '☁️ Traitement...';
            this.showUploadProgress(50);
            
            // For full front-end simulation, videos are tough to store in localStorage because of size limits.
            // We will save the base64 data directly if it's compressed image, or video.
            // Be mindful of localStorage quotas (5MB)
            mediaData = {
                type: this.pendingMedia.type,
                data: this.pendingMedia.data // Must be pre-converted base64
            };
            
            this.hideUploadProgress();
        }

        const newPost = {
            id: 'post_' + Date.now(),
            userName: this.currentUser.name,
            text: text,
            category: category,
            timestamp: new Date().toISOString(),
            media: mediaData,
            comments: [],
            reactions: { like: 0, clap: 0, fire: 0, rocket: 0 },
            userReactions: {}
        };

        const posts = this.getPosts();
        posts.unshift(newPost);
        this.savePosts(posts);

        document.getElementById('post-text').value = '';
        document.getElementById('char-counter').textContent = '0 / 1000';
        document.getElementById('char-counter').className = 'char-counter';

        // Reset category pills
        document.querySelectorAll('.cat-pill').forEach(p => p.classList.remove('active'));
        const firstPill = document.querySelector('.cat-pill[data-value="partage"]');
        if (firstPill) firstPill.classList.add('active');
        document.getElementById('post-category').value = 'partage';

        this.clearMediaPreview();

        setTimeout(() => {
            publishBtn.disabled = false;
            publishBtn.textContent = 'Publier 🚀';
        }, 500);

        this.loadPosts();
        this.showToast('✅ Publication en ligne !');
    },

    showUploadProgress(percent) {
        let bar = document.getElementById('upload-progress-bar');
        if (!bar) {
            bar = document.createElement('div');
            bar.id = 'upload-progress-bar';
            bar.style.cssText = `
                position: fixed; top: 0; left: 0; height: 4px; z-index: 99999;
                background: var(--gold-gradient); transition: width 0.2s ease;
                box-shadow: 0 0 10px rgba(214,163,47,0.5);
            `;
            document.body.appendChild(bar);
        }
        bar.style.width = percent + '%';
        bar.style.display = 'block';
    },

    hideUploadProgress() {
        const bar = document.getElementById('upload-progress-bar');
        if (bar) {
            bar.style.width = '100%';
            setTimeout(() => { bar.style.display = 'none'; bar.style.width = '0%'; }, 500);
        }
    },

    clearMediaPreview() {
        this.pendingMedia = null;
        document.getElementById('media-preview-container').style.display = 'none';
        document.getElementById('media-preview-content').innerHTML = '';
        document.getElementById('media-input').value = '';
    },

    setupEventListeners() {
        document.getElementById('publish-btn').onclick = () => this.publishPost();

        // Character counter
        const postText = document.getElementById('post-text');
        const charCounter = document.getElementById('char-counter');
        if (postText && charCounter) {
            postText.addEventListener('input', () => {
                const len = postText.value.length;
                charCounter.textContent = `${len} / 1000`;
                charCounter.className = 'char-counter' + (len > 900 ? ' danger' : len > 750 ? ' warn' : '');
            });
            // Ctrl+Enter shortcut
            postText.addEventListener('keydown', (e) => {
                if (e.ctrlKey && e.key === 'Enter') this.publishPost();
            });
        }

        // Category pill logic
        document.querySelectorAll('.cat-pill').forEach(pill => {
            pill.addEventListener('click', () => {
                document.querySelectorAll('.cat-pill').forEach(p => p.classList.remove('active'));
                pill.classList.add('active');
                document.getElementById('post-category').value = pill.dataset.value;
            });
        });

        // Media Upload Logic
        const mediaInput = document.getElementById('media-input');
        const previewContainer = document.getElementById('media-preview-container');
        const previewContent = document.getElementById('media-preview-content');
        const removeMediaBtn = document.getElementById('remove-media');

        mediaInput.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            // Allowed types
            const allowedImages = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            const allowedVideos = ['video/mp4', 'video/webm', 'video/quicktime'];
            const isImage = allowedImages.includes(file.type);
            const isVideo = allowedVideos.includes(file.type);

            if (!isImage && !isVideo) {
                this.showToast('Format non supporté. Utilisez JPG, PNG, GIF, WebP, MP4 ou WebM.', 'error');
                mediaInput.value = '';
                return;
            }

            // Size limits (Firebase Cloud Storage in production = up to 50MB)
            // Local simulation limit set to 1.5MB to prevent QuotaExceededError crashes.
            const maxImageSize = 10 * 1024 * 1024; // 10 MB
            const maxVideoSize = 1.5 * 1024 * 1024; // 1.5 MB

            if (isVideo && file.size > maxVideoSize) {
                this.showToast('Vidéo limitée à 1.5 Mo en simulation locale (Firebase requis pour la production).', 'error');
                mediaInput.value = '';
                return;
            }

            if (isImage && file.size > maxImageSize) {
                this.showToast('Image trop volumineuse (max 20 Mo).', 'error');
                mediaInput.value = '';
                return;
            }

            // Show loading state
            previewContainer.style.display = 'block';
            previewContent.innerHTML = `
                <div style="padding: 2rem; text-align: center; color: var(--text-muted);">
                    <div style="font-size: 2rem; margin-bottom: 0.5rem;">⏳</div>
                    <p style="margin: 0;">Traitement en cours...</p>
                </div>
            `;

            try {
                const sizeKB = Math.round(file.size / 1024);
                const sizeLabel = sizeKB < 1024 ? sizeKB + ' Ko' : (sizeKB / 1024).toFixed(1) + ' Mo';
                const nameLabel = file.name.length > 25 ? file.name.substring(0, 22) + '...' : file.name;

                if (isImage) {
                    // Compress image for preview + upload
                    const compressed = await this.compressImage(file, 1600, 0.8);
                    const compressedSizeKB = Math.round((compressed.length * 3) / 4 / 1024);
                    const compressedLabel = compressedSizeKB < 1024 ? compressedSizeKB + ' Ko' : (compressedSizeKB / 1024).toFixed(1) + ' Mo';

                    this.pendingMedia = { type: file.type, data: compressed };
                    previewContent.innerHTML = `
                        <img src="${compressed}" style="width: 100%; max-height: 250px; object-fit: cover;">
                        <div style="padding: 0.5rem 0.8rem; font-size: 0.75rem; color: var(--text-muted); display: flex; justify-content: space-between; align-items: center;">
                            <span>📷 ${nameLabel}</span>
                            <span style="color: #22c55e;">${compressedLabel} (compressé de ${sizeLabel})</span>
                        </div>
                    `;
                    this.showToast('Image prête ✨');
                } else {
                    // Video: store base64 (Note: large videos will crash local storage)
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        this.pendingMedia = { type: file.type, data: e.target.result };
                        const objectURL = URL.createObjectURL(file);
                        previewContent.innerHTML = `
                            <video src="${objectURL}" style="width: 100%; max-height: 200px; object-fit: cover;" muted></video>
                            <div style="padding: 0.5rem 0.8rem; font-size: 0.75rem; color: var(--text-muted); display: flex; justify-content: space-between; align-items: center;">
                                <span>🎬 ${nameLabel}</span>
                                <span>${sizeLabel} (Local)</span>
                            </div>
                        `;
                        this.showToast('Vidéo prête 🎬');
                    };
                    reader.readAsDataURL(file);
                }
            } catch (err) {
                this.showToast('Erreur lors du traitement du fichier.', 'error');
                this.clearMediaPreview();
            }
        };

        removeMediaBtn.onclick = () => this.clearMediaPreview();
        
        // Navigation filters
        document.querySelectorAll('.nav-item[data-filter]').forEach(item => {
            item.onclick = (e) => {
                e.preventDefault();
                document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                this.loadPosts(item.dataset.filter);
            };
        });

        // Search input
        document.getElementById('search-posts').oninput = (e) => {
            this.loadPosts('all', e.target.value);
        };
        
        // Notifications toggle
        document.getElementById('notif-bell').onclick = (e) => {
            e.stopPropagation();
            this.toggleNotifsDropdown();
        };
        
        // Close notifs on body click
        document.body.onclick = (e) => {
            if (document.getElementById('notifs-dropdown') && !e.target.closest('#notif-bell') && !e.target.closest('#notifs-dropdown')) {
                document.getElementById('notifs-dropdown').style.display = 'none';
            }
        };
    },

    formatDate(isoString) {
        const date = new Date(isoString);
        const now = new Date();
        const diff = (now - date) / 1000;

        if (diff < 60) return "À l'instant";
        if (diff < 3600) return `Il y a ${Math.floor(diff/60)} min`;
        if (diff < 86400) return `Il y a ${Math.floor(diff/3600)} h`;
        return date.toLocaleDateString('fr-FR');
    },

    addNotification(msg) {
        const notifs = JSON.parse(localStorage.getItem(NOTIFS_KEY)) || [];
        notifs.push({ text: msg, read: false, time: new Date() });
        localStorage.setItem(NOTIFS_KEY, JSON.stringify(notifs));
        this.checkNotifications();
    },

    checkNotifications() {
        const notifs = JSON.parse(localStorage.getItem(NOTIFS_KEY)) || [];
        const unread = notifs.filter(n => !n.read).length;
        const badge = document.getElementById('notif-count');
        if (unread > 0) {
            badge.textContent = unread;
            badge.style.display = 'block';
        } else {
            badge.style.display = 'none';
        }
    },

    showToast(msg, type = 'success') {
        if (window.DMAToast) {
            window.DMAToast.show(msg, type);
        } else {
            const colors = { success: 'var(--social-accent)', error: '#ef4444', info: '#3b82f6' };
            const icons = { success: '✅', error: '❌', info: 'ℹ️' };
            const toast = document.createElement('div');
            toast.style.cssText = `
                position: fixed; top: 110px; right: 20px;
                background: ${colors[type] || colors.success};
                color: ${type === 'success' ? 'black' : 'white'};
                padding: 0.9rem 1.8rem; border-radius: 50px;
                font-weight: 800; font-size: 0.9rem;
                z-index: 10000;
                box-shadow: 0 8px 30px rgba(0,0,0,0.4);
                animation: fadeIn 0.3s forwards;
                display: flex; align-items: center; gap: 0.5rem;
            `;
            toast.innerHTML = `<span>${icons[type] || icons.success}</span> ${msg}`;
            document.body.appendChild(toast);
            setTimeout(() => {
                toast.style.animation = 'fadeOut 0.3s forwards';
                setTimeout(() => toast.remove(), 300);
            }, 2700);
        }
    },

    toggleNotifsDropdown() {
        let dropdown = document.getElementById('notifs-dropdown');
        if (!dropdown) {
            dropdown = document.createElement('div');
            dropdown.id = 'notifs-dropdown';
            dropdown.style.cssText = `
                position: absolute; top: 40px; right: -10px; background: var(--social-card);
                border: 1px solid var(--social-border); border-radius: 12px; width: 300px;
                max-height: 400px; overflow-y: auto; z-index: 9999; box-shadow: var(--shadow-dark);
                display: none; padding: 1rem;
            `;
            document.getElementById('notif-bell').appendChild(dropdown);
        }

        if (dropdown.style.display === 'block') {
            dropdown.style.display = 'none';
            return;
        }

        const notifs = JSON.parse(localStorage.getItem(NOTIFS_KEY)) || [];
        if (notifs.length === 0) {
            dropdown.innerHTML = '<p style="color: var(--text-muted); text-align: center; margin: 0;">Aucune notification</p>';
        } else {
            dropdown.innerHTML = '<h4 style="margin-top: 0; margin-bottom: 1rem; border-bottom: 1px solid var(--social-border); padding-bottom: 0.5rem;">Notifications</h4>';
            notifs.slice().reverse().forEach((n, idx) => {
                dropdown.innerHTML += `
                    <div style="margin-bottom: 0.8rem; padding-bottom: 0.8rem; border-bottom: 1px solid rgba(255,255,255,0.05); ${!n.read ? 'color: white; font-weight: bold;' : 'color: var(--text-muted);'}">
                        ${n.text}
                    </div>
                `;
                // Mark as read
                notifs[notifs.length - 1 - idx].read = true;
            });
            localStorage.setItem(NOTIFS_KEY, JSON.stringify(notifs));
            this.checkNotifications();
        }
        dropdown.style.display = 'block';
    },

    showProfile(userName) {
        const allUsers = AuthCore.getUsers();
        const user = allUsers.find(u => u.name === userName);
        
        let profileModal = document.getElementById('profile-modal');
        if (!profileModal) {
            profileModal = document.createElement('div');
            profileModal.id = 'profile-modal';
            profileModal.style.cssText = `
                position: fixed; inset: 0; background: rgba(0,0,0,0.9); z-index: 10000;
                display: flex; align-items: center; justify-content: center; padding: 2rem;
            `;
            document.body.appendChild(profileModal);
        }

        if (!user) {
            profileModal.innerHTML = `
                <div style="background: var(--social-card); padding: 2rem; border-radius: 16px; border: 1px solid var(--social-border); position: relative; max-width: 400px; width: 100%; text-align: center;">
                    <button onclick="document.getElementById('profile-modal').style.display='none'" style="position: absolute; top: 10px; right: 10px; background: none; border: none; color: white; cursor: pointer; font-size: 1.5rem;">✕</button>
                    <h3>Profil non trouvé</h3>
                    <p style="color: var(--text-muted);">Cet utilisateur semble inactif.</p>
                </div>
            `;
        } else {
            const avatar = user.photo || 'assets/images/default-avatar.png';
            const level = user.level === 'pro' ? 'Professionnel' : (user.level === 'inter' ? 'Intermédiaire' : 'Débutant');
            const coursesCount = user.enrolledCourses ? user.enrolledCourses.length : 0;
            
            profileModal.innerHTML = `
                <div style="background: var(--social-card); padding: 2rem; border-radius: 16px; border: 1px solid var(--social-border); position: relative; max-width: 400px; width: 100%; text-align: center;">
                    <button onclick="document.getElementById('profile-modal').style.display='none'" style="position: absolute; top: 10px; right: 10px; background: none; border: none; color: white; cursor: pointer; font-size: 1.5rem;">✕</button>
                    <img src="${avatar}" style="width: 100px; height: 100px; border-radius: 50%; object-fit: cover; margin: 0 auto 1rem; border: 2px solid var(--social-accent);">
                    <h2 style="margin-bottom: 0.2rem;">${user.name}</h2>
                    <p style="color: var(--gold-primary); font-weight: bold; font-size: 0.9rem; margin-bottom: 1.5rem;">${level}</p>
                    
                    <div style="display: flex; justify-content: center; gap: 2rem; margin-bottom: 1.5rem;">
                        <div>
                            <h3 style="margin: 0; color: white;">${coursesCount}</h3>
                            <p style="font-size: 0.8rem; color: var(--text-muted); margin: 0;">Cours actifs</p>
                        </div>
                    </div>
                    
                    <button class="btn btn-outline" style="width: 100%;" onclick="alert('Message envoyé à ${user.name} ! (Simulation)')">Envoyer un message</button>
                </div>
            `;
        }
        profileModal.style.display = 'flex';
    }
};

document.addEventListener('DOMContentLoaded', () => CommunityCore.init());
