(cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF'
diff --git a/js/admin.js b/js/admin.js
--- a/js/admin.js
+++ b/js/admin.js
@@ -0,0 +1,743 @@
+// Admin panel functionality for bultimore.com
+document.addEventListener('DOMContentLoaded', function() {
+    initializeAdmin();
+    loadDashboard();
+    checkAuthStatus();
+});
+
+let currentSection = 'dashboard';
+
+function initializeAdmin() {
+    // Initialize all admin features
+    setupSectionNavigation();
+    loadAllSections();
+    initializeNotifications();
+    setupQuickActions();
+}
+
+function checkAuthStatus() {
+    // Simple auth check - in a real app, this would verify with backend
+    const isAuthenticated = localStorage.getItem('bultimore_admin_auth') === 'true';
+    
+    if (!isAuthenticated) {
+        showLoginForm();
+    }
+}
+
+function showLoginForm() {
+    const loginModal = document.createElement('div');
+    loginModal.className = 'modal';
+    loginModal.style.display = 'block';
+    loginModal.innerHTML = `
+        <div class="modal-content">
+            <h2>Admin Login</h2>
+            <form onsubmit="adminLogin(event)">
+                <div class="form-group">
+                    <label class="form-label">Username</label>
+                    <input type="text" name="username" required class="form-input" value="admin">
+                </div>
+                <div class="form-group">
+                    <label class="form-label">Password</label>
+                    <input type="password" name="password" required class="form-input" value="admin123">
+                </div>
+                <button type="submit" class="btn btn-primary">Login</button>
+            </form>
+            <small style="color: #666; margin-top: 1rem; display: block;">
+                Demo credentials: admin / admin123
+            </small>
+        </div>
+    `;
+    
+    document.body.appendChild(loginModal);
+}
+
+function adminLogin(event) {
+    event.preventDefault();
+    
+    const formData = new FormData(event.target);
+    const username = formData.get('username');
+    const password = formData.get('password');
+    
+    // Simple demo authentication
+    if (username === 'admin' && password === 'admin123') {
+        localStorage.setItem('bultimore_admin_auth', 'true');
+        document.querySelector('.modal').remove();
+        showMessage('Welcome to the admin dashboard!', 'success');
+    } else {
+        showMessage('Invalid credentials', 'error');
+    }
+}
+
+function logout() {
+    localStorage.removeItem('bultimore_admin_auth');
+    window.location.reload();
+}
+
+function setupSectionNavigation() {
+    document.querySelectorAll('.admin-menu-item').forEach(item => {
+        item.addEventListener('click', (e) => {
+            e.preventDefault();
+            const section = item.getAttribute('href').substring(1);
+            showSection(section);
+        });
+    });
+}
+
+function showSection(sectionName) {
+    // Hide all sections
+    document.querySelectorAll('.admin-section').forEach(section => {
+        section.classList.remove('active');
+    });
+    
+    // Show target section
+    const targetSection = document.getElementById(sectionName);
+    if (targetSection) {
+        targetSection.classList.add('active');
+    }
+    
+    // Update menu
+    document.querySelectorAll('.admin-menu-item').forEach(item => {
+        item.classList.remove('active');
+    });
+    
+    const activeMenuItem = document.querySelector(`[href="#${sectionName}"]`);
+    if (activeMenuItem) {
+        activeMenuItem.classList.add('active');
+    }
+    
+    currentSection = sectionName;
+    
+    // Load section-specific data
+    loadSectionData(sectionName);
+}
+
+function loadSectionData(section) {
+    switch(section) {
+        case 'dashboard':
+            loadDashboard();
+            break;
+        case 'products':
+            loadProductsAdmin();
+            break;
+        case 'blog':
+            loadBlogAdmin();
+            break;
+        case 'gallery':
+            loadGalleryAdmin();
+            break;
+        case 'music':
+            loadMusicAdmin();
+            break;
+        case 'videos':
+            loadVideosAdmin();
+            break;
+        case 'donations':
+            loadDonationsAdmin();
+            break;
+        case 'analytics':
+            loadAnalytics();
+            break;
+        case 'settings':
+            loadSettings();
+            break;
+    }
+}
+
+function loadAllSections() {
+    loadDashboard();
+    loadProductsAdmin();
+    loadBlogAdmin();
+    loadGalleryAdmin();
+    loadDonationsAdmin();
+}
+
+function loadDashboard() {
+    // Load quick stats
+    const products = window.contentManager.getProducts();
+    const posts = window.contentManager.getBlogPosts();
+    const donations = JSON.parse(localStorage.getItem('bultimore_donations')) || [];
+    const completedDonations = donations.filter(d => d.status === 'completed');
+    const totalDonations = completedDonations.reduce((sum, d) => sum + d.amount, 0);
+    const totalPhotos = window.contentManager.getGalleryAlbums().reduce((sum, album) => sum + album.images.length, 0);
+    
+    document.getElementById('total-products').textContent = products.length;
+    document.getElementById('total-posts').textContent = posts.length;
+    document.getElementById('total-donations').textContent = formatCurrency(totalDonations);
+    document.getElementById('total-photos').textContent = totalPhotos;
+    
+    // Load recent activity
+    loadRecentOrders();
+    loadRecentDonationsAdmin();
+    loadRecentCommentsAdmin();
+}
+
+function loadRecentOrders() {
+    const orders = JSON.parse(localStorage.getItem('bultimore_orders')) || [];
+    const recentOrders = orders.slice(-5).reverse();
+    
+    const container = document.getElementById('recent-orders');
+    if (!container) return;
+
+    if (recentOrders.length === 0) {
+        container.innerHTML = '<div class="empty-state"><p>No recent orders</p></div>';
+        return;
+    }
+
+    container.innerHTML = recentOrders.map(order => `
+        <div class="activity-item">
+            <div class="activity-icon">
+                <i class="fas fa-shopping-cart"></i>
+            </div>
+            <div class="activity-content">
+                <div class="activity-title">Order #${order.id.substring(0, 8)}</div>
+                <div class="activity-meta">
+                    ${order.fullName} • ${formatCurrency(order.total)} • ${getTimeAgo(new Date(order.date))}
+                </div>
+            </div>
+        </div>
+    `).join('');
+}
+
+function loadRecentDonationsAdmin() {
+    const donations = JSON.parse(localStorage.getItem('bultimore_donations')) || [];
+    const recentDonations = donations
+        .filter(d => d.status === 'completed')
+        .slice(-5)
+        .reverse();
+    
+    const container = document.getElementById('recent-donations-admin');
+    if (!container) return;
+
+    if (recentDonations.length === 0) {
+        container.innerHTML = '<div class="empty-state"><p>No recent donations</p></div>';
+        return;
+    }
+
+    container.innerHTML = recentDonations.map(donation => `
+        <div class="activity-item">
+            <div class="activity-icon">
+                <i class="fas fa-heart"></i>
+            </div>
+            <div class="activity-content">
+                <div class="activity-title">${donation.anonymous ? 'Anonymous' : donation.fullName}</div>
+                <div class="activity-meta">
+                    ${formatCurrency(donation.amount)} • ${getTimeAgo(new Date(donation.date))}
+                </div>
+            </div>
+        </div>
+    `).join('');
+}
+
+function loadRecentCommentsAdmin() {
+    const posts = window.contentManager.getBlogPosts();
+    const allComments = [];
+    
+    posts.forEach(post => {
+        if (post.comments) {
+            post.comments.forEach(comment => {
+                allComments.push({
+                    ...comment,
+                    postTitle: post.title
+                });
+            });
+        }
+    });
+    
+    const recentComments = allComments
+        .sort((a, b) => new Date(b.date) - new Date(a.date))
+        .slice(0, 5);
+    
+    const container = document.getElementById('recent-comments-admin');
+    if (!container) return;
+
+    if (recentComments.length === 0) {
+        container.innerHTML = '<div class="empty-state"><p>No recent comments</p></div>';
+        return;
+    }
+
+    container.innerHTML = recentComments.map(comment => `
+        <div class="activity-item">
+            <div class="activity-icon">
+                <i class="fas fa-comment"></i>
+            </div>
+            <div class="activity-content">
+                <div class="activity-title">${comment.author}</div>
+                <div class="activity-meta">
+                    on "${comment.postTitle}" • ${getTimeAgo(new Date(comment.date))}
+                </div>
+            </div>
+        </div>
+    `).join('');
+}
+
+function loadProductsAdmin() {
+    const products = window.contentManager.getProducts();
+    const tbody = document.getElementById('products-table-body');
+    
+    if (!tbody) return;
+
+    tbody.innerHTML = products.map(product => `
+        <tr>
+            <td>
+                <img src="${product.image}" alt="${product.title}" class="table-image" onerror="handleImageError(this)">
+            </td>
+            <td>${product.title}</td>
+            <td><span class="status-badge">${product.category}</span></td>
+            <td>${formatCurrency(product.price)}</td>
+            <td>
+                <div class="toggle-switch">
+                    <input type="checkbox" ${product.featured ? 'checked' : ''} 
+                           onchange="toggleProductFeatured(${product.id}, this.checked)">
+                    <span class="toggle-slider"></span>
+                </div>
+            </td>
+            <td>
+                <div class="table-actions">
+                    <button class="table-btn" onclick="editProduct(${product.id})" title="Edit">
+                        <i class="fas fa-edit"></i>
+                    </button>
+                    <button class="table-btn danger" onclick="deleteProduct(${product.id})" title="Delete">
+                        <i class="fas fa-trash"></i>
+                    </button>
+                </div>
+            </td>
+        </tr>
+    `).join('');
+}
+
+function loadBlogAdmin() {
+    const posts = window.contentManager.getBlogPosts();
+    const tbody = document.getElementById('posts-table-body');
+    
+    if (!tbody) return;
+
+    tbody.innerHTML = posts.map(post => `
+        <tr>
+            <td>${post.title}</td>
+            <td>${formatDate(post.datePublished)}</td>
+            <td>${post.likes || 0}</td>
+            <td>${(post.comments || []).length}</td>
+            <td>
+                <div class="table-actions">
+                    <button class="table-btn" onclick="editPost(${post.id})" title="Edit">
+                        <i class="fas fa-edit"></i>
+                    </button>
+                    <button class="table-btn" onclick="viewPost(${post.id})" title="View">
+                        <i class="fas fa-eye"></i>
+                    </button>
+                    <button class="table-btn danger" onclick="deletePost(${post.id})" title="Delete">
+                        <i class="fas fa-trash"></i>
+                    </button>
+                </div>
+            </td>
+        </tr>
+    `).join('');
+}
+
+function loadGalleryAdmin() {
+    const albums = window.contentManager.getGalleryAlbums();
+    const container = document.getElementById('albums-admin-grid');
+    
+    if (!container) return;
+
+    container.innerHTML = albums.map(album => `
+        <div class="album-admin-card">
+            <div class="album-admin-header">
+                <h3>${album.title}</h3>
+                <div class="album-admin-actions">
+                    <button class="table-btn" onclick="editAlbum(${album.id})" title="Edit">
+                        <i class="fas fa-edit"></i>
+                    </button>
+                    <button class="table-btn danger" onclick="deleteAlbum(${album.id})" title="Delete">
+                        <i class="fas fa-trash"></i>
+                    </button>
+                </div>
+            </div>
+            <p>${album.description}</p>
+            <div class="album-stats">
+                <span>${album.images.length} photos</span>
+                <span>Created ${formatDate(album.created || new Date())}</span>
+            </div>
+            <div class="album-preview">
+                ${album.images.slice(0, 4).map(image => `
+                    <img src="${image.src}" alt="${image.caption}" class="preview-thumb" onerror="handleImageError(this)">
+                `).join('')}
+            </div>
+        </div>
+    `).join('');
+}
+
+function loadDonationsAdmin() {
+    const donations = JSON.parse(localStorage.getItem('bultimore_donations')) || [];
+    const tbody = document.getElementById('donations-table-body');
+    
+    if (!tbody) return;
+
+    // Update summary
+    const completedDonations = donations.filter(d => d.status === 'completed');
+    const totalRaised = completedDonations.reduce((sum, d) => sum + d.amount, 0);
+    
+    const thisMonth = new Date();
+    const monthStart = new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 1);
+    const monthDonations = completedDonations.filter(d => new Date(d.date) >= monthStart);
+    const monthTotal = monthDonations.reduce((sum, d) => sum + d.amount, 0);
+    
+    document.getElementById('total-raised').textContent = formatCurrency(totalRaised);
+    document.getElementById('month-raised').textContent = formatCurrency(monthTotal);
+
+    tbody.innerHTML = donations.slice(-20).reverse().map(donation => `
+        <tr>
+            <td>${formatDate(donation.date)}</td>
+            <td>${donation.anonymous ? 'Anonymous' : donation.fullName}</td>
+            <td>${formatCurrency(donation.amount)}</td>
+            <td><span class="status-badge">${donation.paymentMethod}</span></td>
+            <td><span class="status-badge ${donation.status}">${donation.status}</span></td>
+            <td>
+                <div class="table-actions">
+                    <button class="table-btn" onclick="viewDonation('${donation.id}')" title="View Details">
+                        <i class="fas fa-eye"></i>
+                    </button>
+                </div>
+            </td>
+        </tr>
+    `).join('');
+}
+
+// Content Management Functions
+function showAddProductForm() {
+    openModal('add-product-modal');
+}
+
+function addProduct(event) {
+    event.preventDefault();
+    
+    const formData = new FormData(event.target);
+    const product = {
+        title: formData.get('title'),
+        description: formData.get('description'),
+        price: parseFloat(formData.get('price')),
+        category: formData.get('category'),
+        image: formData.get('image'),
+        featured: formData.get('featured') === 'on'
+    };
+    
+    window.contentManager.addProduct(product);
+    loadProductsAdmin();
+    closeModal('add-product-modal');
+    event.target.reset();
+    
+    showMessage('Product added successfully!', 'success');
+}
+
+function toggleProductFeatured(productId, featured) {
+    window.contentManager.updateProduct(productId, { featured: featured });
+    showMessage(`Product ${featured ? 'featured' : 'unfeatured'}`, 'success');
+}
+
+function deleteProduct(productId) {
+    if (!confirm('Are you sure you want to delete this product?')) return;
+    
+    window.contentManager.deleteProduct(productId);
+    loadProductsAdmin();
+    showMessage('Product deleted successfully', 'success');
+}
+
+function showAddPostForm() {
+    openModal('add-post-modal');
+}
+
+function addPost(event) {
+    event.preventDefault();
+    
+    const formData = new FormData(event.target);
+    const post = {
+        title: formData.get('title'),
+        excerpt: formData.get('excerpt'),
+        content: formData.get('content'),
+        author: 'Admin',
+        tags: formData.get('tags') ? formData.get('tags').split(',').map(tag => tag.trim()) : []
+    };
+    
+    window.contentManager.addBlogPost(post);
+    loadBlogAdmin();
+    closeModal('add-post-modal');
+    event.target.reset();
+    
+    showMessage('Post published successfully!', 'success');
+}
+
+function deletePost(postId) {
+    if (!confirm('Are you sure you want to delete this post?')) return;
+    
+    window.contentManager.deleteBlogPost(postId);
+    loadBlogAdmin();
+    showMessage('Post deleted successfully', 'success');
+}
+
+function showAddAlbumForm() {
+    openModal('add-album-modal');
+}
+
+function addAlbum(event) {
+    event.preventDefault();
+    
+    const formData = new FormData(event.target);
+    const photosText = formData.get('photos');
+    
+    const images = photosText ? photosText.split('\n').map(line => {
+        const [src, caption] = line.split('|');
+        return {
+            src: src.trim(),
+            caption: (caption || 'Untitled').trim()
+        };
+    }).filter(img => img.src) : [];
+    
+    const album = {
+        title: formData.get('title'),
+        description: formData.get('description'),
+        images: images
+    };
+    
+    // Add to content manager
+    const albums = window.contentManager.getGalleryAlbums();
+    album.id = Date.now();
+    albums.push(album);
+    window.contentManager.data.gallery = albums;
+    window.contentManager.saveData();
+    
+    loadGalleryAdmin();
+    closeModal('add-album-modal');
+    event.target.reset();
+    
+    showMessage('Album created successfully!', 'success');
+}
+
+function loadAnalytics() {
+    const contentAnalytics = document.getElementById('content-analytics');
+    const engagementAnalytics = document.getElementById('engagement-analytics');
+    
+    if (contentAnalytics) {
+        const products = window.contentManager.getProducts();
+        const posts = window.contentManager.getBlogPosts();
+        
+        contentAnalytics.innerHTML = `
+            <div class="metric-row">
+                <span class="metric-label">Total Products</span>
+                <span class="metric-value">${products.length}</span>
+            </div>
+            <div class="metric-row">
+                <span class="metric-label">Featured Products</span>
+                <span class="metric-value">${products.filter(p => p.featured).length}</span>
+            </div>
+            <div class="metric-row">
+                <span class="metric-label">Total Blog Posts</span>
+                <span class="metric-value">${posts.length}</span>
+            </div>
+            <div class="metric-row">
+                <span class="metric-label">Total Albums</span>
+                <span class="metric-value">${window.contentManager.getGalleryAlbums().length}</span>
+            </div>
+        `;
+    }
+    
+    if (engagementAnalytics) {
+        const totalLikes = posts.reduce((sum, post) => sum + (post.likes || 0), 0);
+        const totalComments = posts.reduce((sum, post) => sum + (post.comments || []).length, 0);
+        
+        engagementAnalytics.innerHTML = `
+            <div class="metric-row">
+                <span class="metric-label">Total Likes</span>
+                <span class="metric-value">${totalLikes}</span>
+            </div>
+            <div class="metric-row">
+                <span class="metric-label">Total Comments</span>
+                <span class="metric-value">${totalComments}</span>
+            </div>
+            <div class="metric-row">
+                <span class="metric-label">Avg. Engagement</span>
+                <span class="metric-value">${posts.length > 0 ? ((totalLikes + totalComments) / posts.length).toFixed(1) : 0}</span>
+            </div>
+        `;
+    }
+}
+
+function initializeNotifications() {
+    // Simple notification system
+    const notifications = [
+        { title: 'New Comment', text: 'Someone commented on "The Power of Community Art"', time: '2 hours ago' },
+        { title: 'New Donation', text: 'Anonymous donated $50', time: '5 hours ago' },
+        { title: 'New Order', text: 'Order #12345 needs processing', time: '1 day ago' }
+    ];
+    
+    // Update notification count
+    const notificationCount = document.querySelector('.notification-count');
+    if (notificationCount) {
+        notificationCount.textContent = notifications.length;
+    }
+}
+
+function setupQuickActions() {
+    // Add quick action buttons
+    const quickActions = document.createElement('div');
+    quickActions.className = 'quick-actions';
+    quickActions.innerHTML = `
+        <button class="quick-action-btn primary" onclick="showAddPostForm()" title="Quick Post">
+            <i class="fas fa-plus"></i>
+        </button>
+        <button class="quick-action-btn secondary" onclick="exportData()" title="Export Data">
+            <i class="fas fa-download"></i>
+        </button>
+        <button class="quick-action-btn success" onclick="backupData()" title="Backup">
+            <i class="fas fa-save"></i>
+        </button>
+    `;
+    
+    document.body.appendChild(quickActions);
+}
+
+// Data Management
+function exportData() {
+    const data = {
+        products: window.contentManager.getProducts(),
+        posts: window.contentManager.getBlogPosts(),
+        gallery: window.contentManager.getGalleryAlbums(),
+        music: window.contentManager.getMusic(),
+        videos: window.contentManager.getVideos(),
+        donations: JSON.parse(localStorage.getItem('bultimore_donations')) || [],
+        orders: JSON.parse(localStorage.getItem('bultimore_orders')) || [],
+        exportDate: new Date().toISOString()
+    };
+    
+    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
+    const url = URL.createObjectURL(blob);
+    
+    const link = document.createElement('a');
+    link.href = url;
+    link.download = `bultimore-backup-${new Date().toISOString().split('T')[0]}.json`;
+    document.body.appendChild(link);
+    link.click();
+    document.body.removeChild(link);
+    
+    URL.revokeObjectURL(url);
+    showMessage('Data exported successfully!', 'success');
+}
+
+function backupData() {
+    const backup = {
+        content: window.contentManager.data,
+        donations: localStorage.getItem('bultimore_donations'),
+        orders: localStorage.getItem('bultimore_orders'),
+        cart: localStorage.getItem('bultimore_cart'),
+        settings: localStorage.getItem('bultimore_settings'),
+        timestamp: new Date().toISOString()
+    };
+    
+    localStorage.setItem('bultimore_backup', JSON.stringify(backup));
+    showMessage('Data backed up to local storage!', 'success');
+}
+
+function restoreData() {
+    const backup = localStorage.getItem('bultimore_backup');
+    if (!backup) {
+        showMessage('No backup found', 'error');
+        return;
+    }
+    
+    if (!confirm('This will overwrite all current data. Are you sure?')) return;
+    
+    try {
+        const data = JSON.parse(backup);
+        
+        // Restore content
+        window.contentManager.data = data.content;
+        window.contentManager.saveData();
+        
+        // Restore other data
+        if (data.donations) localStorage.setItem('bultimore_donations', data.donations);
+        if (data.orders) localStorage.setItem('bultimore_orders', data.orders);
+        if (data.settings) localStorage.setItem('bultimore_settings', data.settings);
+        
+        // Reload all sections
+        loadAllSections();
+        showMessage('Data restored successfully!', 'success');
+    } catch (error) {
+        showMessage('Error restoring data', 'error');
+        console.error('Restore error:', error);
+    }
+}
+
+// Utility Functions
+function getTimeAgo(date) {
+    const now = new Date();
+    const diffInMs = now - date;
+    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
+    const diffInDays = Math.floor(diffInHours / 24);
+    
+    if (diffInHours < 1) {
+        return 'Just now';
+    } else if (diffInHours < 24) {
+        return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
+    } else if (diffInDays < 7) {
+        return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
+    } else {
+        return date.toLocaleDateString();
+    }
+}
+
+function formatDate(dateString) {
+    const date = new Date(dateString);
+    return date.toLocaleDateString('en-US', {
+        year: 'numeric',
+        month: 'short',
+        day: 'numeric'
+    });
+}
+
+// Admin-specific message system
+function showMessage(message, type = 'success') {
+    const messageDiv = document.createElement('div');
+    messageDiv.className = `admin-message ${type}`;
+    messageDiv.innerHTML = `
+        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
+        <span>${message}</span>
+    `;
+    
+    document.body.appendChild(messageDiv);
+    
+    setTimeout(() => {
+        if (messageDiv.parentNode) {
+            messageDiv.parentNode.removeChild(messageDiv);
+        }
+    }, 4000);
+}
+
+// Mobile responsive admin
+function toggleMobileMenu() {
+    const sidebar = document.querySelector('.admin-sidebar');
+    sidebar.classList.toggle('mobile-open');
+}
+
+// Initialize mobile menu toggle
+document.addEventListener('DOMContentLoaded', function() {
+    const header = document.querySelector('.admin-nav');
+    const toggleBtn = document.createElement('button');
+    toggleBtn.className = 'mobile-menu-toggle';
+    toggleBtn.innerHTML = '<i class="fas fa-bars"></i>';
+    toggleBtn.onclick = toggleMobileMenu;
+    
+    header.insertBefore(toggleBtn, header.firstChild);
+});
+
+// Export admin functions
+window.adminManager = {
+    loadDashboard,
+    loadProductsAdmin,
+    loadBlogAdmin,
+    loadGalleryAdmin,
+    loadDonationsAdmin,
+    loadAnalytics,
+    exportData,
+    backupData,
+    restoreData,
+    showSection
+};
EOF
)