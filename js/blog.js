(cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF'
diff --git a/js/blog.js b/js/blog.js
--- a/js/blog.js
+++ b/js/blog.js
@@ -0,0 +1,613 @@
+// Blog functionality for bultimore.com
+document.addEventListener('DOMContentLoaded', function() {
+    loadBlogPosts();
+    loadSidebar();
+    initializeBlogFeatures();
+});
+
+let currentPosts = [];
+let filteredPosts = [];
+let currentPostId = null;
+
+function loadBlogPosts() {
+    showLoading(true);
+    
+    setTimeout(() => {
+        currentPosts = window.contentManager.getBlogPosts();
+        filteredPosts = [...currentPosts];
+        displayPosts(filteredPosts);
+        showLoading(false);
+    }, 500);
+}
+
+function displayPosts(posts) {
+    const container = document.getElementById('posts-container');
+    const noResults = document.getElementById('no-results');
+    
+    if (!container) return;
+
+    if (posts.length === 0) {
+        container.innerHTML = '';
+        if (noResults) noResults.style.display = 'block';
+        return;
+    }
+
+    if (noResults) noResults.style.display = 'none';
+
+    container.innerHTML = posts.map(post => `
+        <article class="post-card" onclick="viewPost(${post.id})">
+            <div class="post-header">
+                <div class="post-meta">
+                    <span class="post-author">
+                        <i class="fas fa-user"></i> ${post.author}
+                    </span>
+                    <span class="post-date">
+                        <i class="fas fa-calendar"></i> ${formatDate(post.datePublished)}
+                    </span>
+                </div>
+                <h2 class="post-title">${post.title}</h2>
+                <p class="post-excerpt">${post.excerpt}</p>
+                <div class="post-tags">
+                    ${post.tags ? post.tags.map(tag => `<span class="tag" onclick="event.stopPropagation(); filterByTag('${tag}')">#${tag}</span>`).join('') : ''}
+                </div>
+            </div>
+            <div class="post-actions">
+                <div class="post-engagement">
+                    <button class="engagement-btn like-btn" onclick="event.stopPropagation(); likePost(${post.id})">
+                        <i class="fas fa-thumbs-up"></i> ${post.likes || 0}
+                    </button>
+                    <button class="engagement-btn dislike-btn" onclick="event.stopPropagation(); dislikePost(${post.id})">
+                        <i class="fas fa-thumbs-down"></i> ${post.dislikes || 0}
+                    </button>
+                    <button class="engagement-btn comment-btn" onclick="event.stopPropagation(); viewPost(${post.id})">
+                        <i class="fas fa-comment"></i> ${(post.comments || []).length}
+                    </button>
+                </div>
+                <a href="#" class="read-more-btn" onclick="event.preventDefault(); event.stopPropagation(); viewPost(${post.id})">
+                    Read More <i class="fas fa-arrow-right"></i>
+                </a>
+            </div>
+        </article>
+    `).join('');
+}
+
+function viewPost(postId) {
+    const post = window.contentManager.getBlogPost(postId);
+    if (!post) return;
+
+    currentPostId = postId;
+    
+    const postDetail = document.getElementById('post-detail');
+    postDetail.innerHTML = `
+        <div class="post-detail-header">
+            <h1 class="post-detail-title">${post.title}</h1>
+            <div class="post-detail-meta">
+                <span><i class="fas fa-user"></i> ${post.author}</span>
+                <span><i class="fas fa-calendar"></i> ${formatDate(post.datePublished)}</span>
+                <span><i class="fas fa-clock"></i> ${estimateReadingTime(post.content)} min read</span>
+            </div>
+            <div class="post-tags">
+                ${post.tags ? post.tags.map(tag => `<span class="tag">#${tag}</span>`).join('') : ''}
+            </div>
+        </div>
+        
+        <div class="post-detail-content">
+            ${formatPostContent(post.content)}
+        </div>
+        
+        <div class="post-detail-actions">
+            <div class="post-detail-engagement">
+                <button class="engagement-btn like-btn large" onclick="likePost(${post.id}); updatePostModal(${post.id})">
+                    <i class="fas fa-thumbs-up"></i> ${post.likes || 0}
+                </button>
+                <button class="engagement-btn dislike-btn large" onclick="dislikePost(${post.id}); updatePostModal(${post.id})">
+                    <i class="fas fa-thumbs-down"></i> ${post.dislikes || 0}
+                </button>
+                <button class="engagement-btn comment-btn large" onclick="openCommentModal(${post.id})">
+                    <i class="fas fa-comment"></i> Add Comment
+                </button>
+            </div>
+            <button class="engagement-btn share-btn large" onclick="sharePost(${post.id})">
+                <i class="fas fa-share"></i> Share
+            </button>
+        </div>
+        
+        <div class="comments-section">
+            <div class="comments-header">
+                <h3>Comments (${(post.comments || []).length})</h3>
+            </div>
+            <div class="comments-list" id="comments-list">
+                ${displayComments(post.comments || [])}
+            </div>
+        </div>
+    `;
+
+    openModal('post-modal');
+}
+
+function displayComments(comments) {
+    if (comments.length === 0) {
+        return `
+            <div class="empty-state">
+                <i class="fas fa-comments"></i>
+                <h3>No comments yet</h3>
+                <p>Be the first to share your thoughts!</p>
+            </div>
+        `;
+    }
+
+    return comments.map(comment => `
+        <div class="comment-item">
+            <div class="comment-header">
+                <span class="comment-author">${comment.author}</span>
+                <span class="comment-date">${formatDate(comment.date)}</span>
+            </div>
+            <div class="comment-content">${comment.content}</div>
+        </div>
+    `).join('');
+}
+
+function searchPosts() {
+    const query = document.getElementById('search-input').value.toLowerCase();
+    
+    if (!query.trim()) {
+        filteredPosts = [...currentPosts];
+    } else {
+        filteredPosts = currentPosts.filter(post =>
+            post.title.toLowerCase().includes(query) ||
+            post.content.toLowerCase().includes(query) ||
+            post.excerpt.toLowerCase().includes(query) ||
+            (post.tags && post.tags.some(tag => tag.toLowerCase().includes(query)))
+        );
+    }
+    
+    displayPosts(filteredPosts);
+}
+
+function filterByTag(tag = null) {
+    const tagFilter = tag || document.getElementById('tag-filter').value;
+    
+    if (!tagFilter) {
+        filteredPosts = [...currentPosts];
+    } else {
+        filteredPosts = currentPosts.filter(post =>
+            post.tags && post.tags.includes(tagFilter)
+        );
+    }
+    
+    displayPosts(filteredPosts);
+    
+    // Update filter dropdown if called from tag click
+    if (tag) {
+        const filterSelect = document.getElementById('tag-filter');
+        if (filterSelect) {
+            filterSelect.value = tag;
+        }
+    }
+}
+
+function sortPosts() {
+    const sortBy = document.getElementById('sort-select').value;
+    
+    switch (sortBy) {
+        case 'newest':
+            filteredPosts.sort((a, b) => new Date(b.datePublished) - new Date(a.datePublished));
+            break;
+        case 'oldest':
+            filteredPosts.sort((a, b) => new Date(a.datePublished) - new Date(b.datePublished));
+            break;
+        case 'popular':
+            filteredPosts.sort((a, b) => (b.likes || 0) - (a.likes || 0));
+            break;
+        case 'commented':
+            filteredPosts.sort((a, b) => (b.comments || []).length - (a.comments || []).length);
+            break;
+    }
+    
+    displayPosts(filteredPosts);
+}
+
+function likePost(postId) {
+    window.contentManager.likePost(postId);
+    
+    // Update display
+    const likeBtn = document.querySelector(`[onclick*="likePost(${postId})"]`);
+    if (likeBtn) {
+        const post = window.contentManager.getBlogPost(postId);
+        likeBtn.innerHTML = `<i class="fas fa-thumbs-up"></i> ${post.likes || 0}`;
+        likeBtn.classList.add('active');
+        
+        // Remove active state after animation
+        setTimeout(() => {
+            likeBtn.classList.remove('active');
+        }, 300);
+    }
+    
+    showMessage('Thanks for your feedback!', 'success');
+}
+
+function dislikePost(postId) {
+    window.contentManager.dislikePost(postId);
+    
+    // Update display
+    const dislikeBtn = document.querySelector(`[onclick*="dislikePost(${postId})"]`);
+    if (dislikeBtn) {
+        const post = window.contentManager.getBlogPost(postId);
+        dislikeBtn.innerHTML = `<i class="fas fa-thumbs-down"></i> ${post.dislikes || 0}`;
+        dislikeBtn.classList.add('active');
+        
+        setTimeout(() => {
+            dislikeBtn.classList.remove('active');
+        }, 300);
+    }
+    
+    showMessage('Thanks for your feedback!', 'success');
+}
+
+function openCommentModal(postId) {
+    currentPostId = postId;
+    openModal('comment-modal');
+}
+
+function submitComment(event) {
+    event.preventDefault();
+    
+    const form = event.target;
+    const formData = new FormData(form);
+    
+    const comment = {
+        content: formData.get('content').trim(),
+        author: formData.get('author').trim() || 'Anonymous'
+    };
+    
+    if (!comment.content) {
+        showMessage('Please enter a comment', 'error');
+        return;
+    }
+    
+    // Add comment
+    window.contentManager.addComment(currentPostId, comment);
+    
+    // Update modal if open
+    if (document.getElementById('post-modal').style.display === 'block') {
+        updatePostModal(currentPostId);
+    }
+    
+    // Update main page display
+    loadBlogPosts();
+    
+    // Close modal and reset form
+    closeModal('comment-modal');
+    form.reset();
+    
+    showMessage('Comment added successfully!', 'success');
+}
+
+function updatePostModal(postId) {
+    const post = window.contentManager.getBlogPost(postId);
+    if (!post) return;
+
+    // Update engagement numbers
+    const likeBtn = document.querySelector('.post-detail-actions .like-btn');
+    const dislikeBtn = document.querySelector('.post-detail-actions .dislike-btn');
+    const commentsList = document.getElementById('comments-list');
+    
+    if (likeBtn) {
+        likeBtn.innerHTML = `<i class="fas fa-thumbs-up"></i> ${post.likes || 0}`;
+    }
+    
+    if (dislikeBtn) {
+        dislikeBtn.innerHTML = `<i class="fas fa-thumbs-down"></i> ${post.dislikes || 0}`;
+    }
+    
+    if (commentsList) {
+        commentsList.innerHTML = displayComments(post.comments || []);
+    }
+    
+    // Update comments header
+    const commentsHeader = document.querySelector('.comments-header h3');
+    if (commentsHeader) {
+        commentsHeader.textContent = `Comments (${(post.comments || []).length})`;
+    }
+}
+
+function sharePost(postId) {
+    const post = window.contentManager.getBlogPost(postId);
+    if (!post) return;
+
+    const shareData = {
+        title: post.title,
+        text: post.excerpt,
+        url: `${window.location.origin}/blog.html?post=${postId}`
+    };
+
+    if (navigator.share) {
+        navigator.share(shareData);
+    } else {
+        // Show share options modal
+        showShareModal(shareData);
+    }
+}
+
+function showShareModal(shareData) {
+    const modal = document.createElement('div');
+    modal.className = 'modal';
+    modal.style.display = 'block';
+    modal.innerHTML = `
+        <div class="modal-content">
+            <span class="modal-close" onclick="this.closest('.modal').remove()">&times;</span>
+            <h2>Share This Post</h2>
+            <div class="share-options">
+                <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent(shareData.text)}&url=${encodeURIComponent(shareData.url)}" 
+                   target="_blank" class="share-option twitter">
+                    <i class="fab fa-twitter"></i>
+                    <span>Twitter</span>
+                </a>
+                <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareData.url)}" 
+                   target="_blank" class="share-option facebook">
+                    <i class="fab fa-facebook"></i>
+                    <span>Facebook</span>
+                </a>
+                <a href="https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareData.url)}" 
+                   target="_blank" class="share-option linkedin">
+                    <i class="fab fa-linkedin"></i>
+                    <span>LinkedIn</span>
+                </a>
+                <button onclick="copyToClipboard('${shareData.url}')" class="share-option copy">
+                    <i class="fas fa-copy"></i>
+                    <span>Copy Link</span>
+                </button>
+            </div>
+        </div>
+    `;
+    
+    document.body.appendChild(modal);
+}
+
+function copyToClipboard(text) {
+    navigator.clipboard.writeText(text).then(() => {
+        showMessage('Link copied to clipboard!', 'success');
+        // Close share modal
+        document.querySelector('.modal').remove();
+    });
+}
+
+function loadSidebar() {
+    loadTagCloud();
+    loadRecentComments();
+    loadArchive();
+}
+
+function loadTagCloud() {
+    const container = document.getElementById('tag-cloud');
+    if (!container) return;
+
+    const allTags = {};
+    currentPosts.forEach(post => {
+        if (post.tags) {
+            post.tags.forEach(tag => {
+                allTags[tag] = (allTags[tag] || 0) + 1;
+            });
+        }
+    });
+
+    const sortedTags = Object.entries(allTags)
+        .sort(([,a], [,b]) => b - a)
+        .slice(0, 10);
+
+    container.innerHTML = sortedTags.map(([tag, count]) => `
+        <span class="tag" onclick="filterByTag('${tag}')" style="font-size: ${Math.min(1 + count * 0.1, 1.5)}rem">
+            #${tag}
+        </span>
+    `).join('');
+}
+
+function loadRecentComments() {
+    const container = document.getElementById('recent-comments');
+    if (!container) return;
+
+    const allComments = [];
+    currentPosts.forEach(post => {
+        if (post.comments) {
+            post.comments.forEach(comment => {
+                allComments.push({
+                    ...comment,
+                    postTitle: post.title,
+                    postId: post.id
+                });
+            });
+        }
+    });
+
+    const recentComments = allComments
+        .sort((a, b) => new Date(b.date) - new Date(a.date))
+        .slice(0, 5);
+
+    if (recentComments.length === 0) {
+        container.innerHTML = `
+            <div class="empty-state">
+                <p>No comments yet. Be the first to share your thoughts!</p>
+            </div>
+        `;
+        return;
+    }
+
+    container.innerHTML = recentComments.map(comment => `
+        <div class="recent-comment" onclick="viewPost(${comment.postId})">
+            <div class="comment-author">${comment.author}</div>
+            <div class="comment-text">${comment.content}</div>
+            <div class="comment-post">on "${comment.postTitle}"</div>
+        </div>
+    `).join('');
+}
+
+function loadArchive() {
+    const container = document.getElementById('archive-links');
+    if (!container) return;
+
+    const archive = {};
+    currentPosts.forEach(post => {
+        const date = new Date(post.datePublished);
+        const monthYear = `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;
+        archive[monthYear] = (archive[monthYear] || 0) + 1;
+    });
+
+    const sortedArchive = Object.entries(archive)
+        .sort(([a], [b]) => new Date(b) - new Date(a));
+
+    container.innerHTML = sortedArchive.map(([monthYear, count]) => `
+        <a href="#" class="archive-link" onclick="filterByMonth('${monthYear}')">
+            ${monthYear} (${count})
+        </a>
+    `).join('');
+}
+
+function filterByMonth(monthYear) {
+    const [month, year] = monthYear.split(' ');
+    filteredPosts = currentPosts.filter(post => {
+        const postDate = new Date(post.datePublished);
+        return postDate.toLocaleString('default', { month: 'long' }) === month &&
+               postDate.getFullYear() === parseInt(year);
+    });
+    
+    displayPosts(filteredPosts);
+}
+
+function initializeBlogFeatures() {
+    // Search functionality
+    const searchInput = document.getElementById('search-input');
+    if (searchInput) {
+        searchInput.addEventListener('input', debounce(searchPosts, 300));
+        searchInput.addEventListener('keypress', function(e) {
+            if (e.key === 'Enter') {
+                searchPosts();
+            }
+        });
+    }
+
+    // Handle URL parameters for direct post links
+    handleUrlParams();
+    
+    // Initialize reading progress (for modal)
+    initializeReadingProgress();
+}
+
+function handleUrlParams() {
+    const urlParams = new URLSearchParams(window.location.search);
+    const postId = urlParams.get('post');
+    
+    if (postId) {
+        setTimeout(() => {
+            viewPost(parseInt(postId));
+        }, 1000);
+    }
+}
+
+function initializeReadingProgress() {
+    // Add reading progress bar to post modal
+    const progressBar = document.createElement('div');
+    progressBar.className = 'reading-progress';
+    progressBar.innerHTML = '<div class="reading-progress-fill"></div>';
+    document.body.appendChild(progressBar);
+
+    // Update progress on scroll within modal
+    function updateReadingProgress() {
+        const modal = document.getElementById('post-modal');
+        if (modal.style.display !== 'block') {
+            progressBar.style.display = 'none';
+            return;
+        }
+
+        progressBar.style.display = 'block';
+        const modalContent = modal.querySelector('.modal-content');
+        const scrollTop = modalContent.scrollTop;
+        const scrollHeight = modalContent.scrollHeight - modalContent.clientHeight;
+        const progress = (scrollTop / scrollHeight) * 100;
+        
+        progressBar.querySelector('.reading-progress-fill').style.width = `${Math.min(progress, 100)}%`;
+    }
+
+    // Listen for scroll events on modal content
+    document.addEventListener('scroll', updateReadingProgress, true);
+}
+
+function showLoading(show) {
+    const loading = document.getElementById('posts-loading');
+    if (loading) {
+        loading.style.display = show ? 'flex' : 'none';
+    }
+}
+
+function formatDate(dateString) {
+    const date = new Date(dateString);
+    return date.toLocaleDateString('en-US', {
+        year: 'numeric',
+        month: 'long',
+        day: 'numeric'
+    });
+}
+
+function formatPostContent(content) {
+    // Convert line breaks to paragraphs
+    return content.split('\n\n').map(paragraph => 
+        `<p>${paragraph.replace(/\n/g, '<br>')}</p>`
+    ).join('');
+}
+
+function estimateReadingTime(content) {
+    const wordsPerMinute = 200;
+    const wordCount = content.split(/\s+/).length;
+    return Math.ceil(wordCount / wordsPerMinute);
+}
+
+// Newsletter subscription
+function subscribeToNewsletter(email) {
+    if (!validateEmail(email)) {
+        showMessage('Please enter a valid email address', 'error');
+        return;
+    }
+
+    const subscribers = JSON.parse(localStorage.getItem('bultimore_subscribers')) || [];
+    
+    if (subscribers.includes(email)) {
+        showMessage('You are already subscribed!', 'error');
+        return;
+    }
+
+    subscribers.push(email);
+    localStorage.setItem('bultimore_subscribers', JSON.stringify(subscribers));
+    showMessage('Successfully subscribed to newsletter!', 'success');
+}
+
+// Admin functions
+function getPostAnalytics() {
+    const posts = window.contentManager.getBlogPosts();
+    
+    return {
+        totalPosts: posts.length,
+        totalLikes: posts.reduce((sum, post) => sum + (post.likes || 0), 0),
+        totalComments: posts.reduce((sum, post) => sum + (post.comments || []).length, 0),
+        mostPopular: posts.sort((a, b) => (b.likes || 0) - (a.likes || 0))[0],
+        mostCommented: posts.sort((a, b) => (b.comments || []).length - (a.comments || []).length)[0],
+        recentActivity: posts
+            .flatMap(post => (post.comments || []).map(comment => ({
+                type: 'comment',
+                postTitle: post.title,
+                author: comment.author,
+                date: comment.date
+            })))
+            .sort((a, b) => new Date(b.date) - new Date(a.date))
+            .slice(0, 10)
+    };
+}
+
+// Export for admin use
+window.blogManager = {
+    loadBlogPosts,
+    displayPosts,
+    searchPosts,
+    filterByTag,
+    sortPosts,
+    getPostAnalytics,
+    loadSidebar
+};
EOF
)