(cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF'
diff --git a/js/video.js b/js/video.js
--- a/js/video.js
+++ b/js/video.js
@@ -0,0 +1,699 @@
+// Video functionality for bultimore.com
+document.addEventListener('DOMContentLoaded', function() {
+    loadFeaturedVideo();
+    loadVideoGallery();
+    initializeVideoFeatures();
+});
+
+let currentVideos = [];
+let filteredVideos = [];
+let currentCategory = 'all';
+let currentView = 'grid';
+
+function loadFeaturedVideo() {
+    const featuredVideos = window.contentManager.getFeaturedVideos();
+    if (featuredVideos.length === 0) return;
+
+    const video = featuredVideos[0];
+    const container = document.getElementById('featured-video-container');
+    
+    if (!container) return;
+
+    container.innerHTML = `
+        <div class="featured-video-player">
+            <div class="responsive-video">
+                <iframe src="${video.embedUrl}?autoplay=0&rel=0" 
+                        title="${video.title}" 
+                        frameborder="0" 
+                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
+                        allowfullscreen>
+                </iframe>
+            </div>
+        </div>
+        <div class="featured-video-info">
+            <h2 class="featured-video-title">${video.title}</h2>
+            <p class="featured-video-description">${video.description}</p>
+            <div class="featured-video-meta">
+                <div class="video-stats">
+                    <span><i class="fas fa-clock"></i> ${video.duration}</span>
+                    <span><i class="fas fa-calendar"></i> ${formatDate(new Date())}</span>
+                </div>
+                <div class="video-actions">
+                    <button class="video-action-btn" onclick="shareVideo(${video.id})">
+                        <i class="fas fa-share"></i> Share
+                    </button>
+                    <button class="video-action-btn" onclick="openVideoInNewTab('${video.embedUrl}')">
+                        <i class="fas fa-external-link-alt"></i> Watch on Platform
+                    </button>
+                </div>
+            </div>
+        </div>
+    `;
+}
+
+function loadVideoGallery() {
+    showLoading(true);
+    
+    setTimeout(() => {
+        // In a real app, this would come from the content manager with more video data
+        currentVideos = [
+            ...window.contentManager.getVideos(),
+            // Add more sample videos
+            {
+                id: 3,
+                title: "Art Technique Tutorial: Watercolor Basics",
+                description: "Learn fundamental watercolor techniques in this step-by-step tutorial perfect for beginners.",
+                embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
+                thumbnail: "images/video/thumb3.jpg",
+                duration: "15:22",
+                category: "tutorials",
+                featured: false,
+                tags: ["tutorial", "watercolor", "beginner"]
+            },
+            {
+                id: 4,
+                title: "Studio Tour: Inside the Creative Space",
+                description: "Take a virtual tour of our studio space and see where the magic happens.",
+                embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
+                thumbnail: "images/video/thumb4.jpg",
+                duration: "6:45",
+                category: "behind-scenes",
+                featured: false,
+                tags: ["studio", "tour", "behind-scenes"]
+            },
+            {
+                id: 5,
+                title: "Community Art Exhibition Opening",
+                description: "Highlights from our recent community art exhibition opening night.",
+                embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
+                thumbnail: "images/video/thumb5.jpg",
+                duration: "9:30",
+                category: "community",
+                featured: false,
+                tags: ["community", "exhibition", "event"]
+            },
+            {
+                id: 6,
+                title: "Live Performance: Creative Flow Session",
+                description: "An impromptu creative session combining music, art, and storytelling.",
+                embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
+                thumbnail: "images/video/thumb6.jpg",
+                duration: "18:45",
+                category: "performances",
+                featured: false,
+                tags: ["performance", "live", "music", "art"]
+            }
+        ];
+        
+        filteredVideos = [...currentVideos];
+        displayVideos(filteredVideos);
+        showLoading(false);
+    }, 500);
+}
+
+function displayVideos(videos) {
+    const container = document.getElementById('videos-grid');
+    const noResults = document.getElementById('no-results');
+    
+    if (!container) return;
+
+    if (videos.length === 0) {
+        container.innerHTML = '';
+        if (noResults) noResults.style.display = 'block';
+        return;
+    }
+
+    if (noResults) noResults.style.display = 'none';
+
+    container.innerHTML = videos.map(video => `
+        <div class="video-card" onclick="viewVideo(${video.id})">
+            <div class="video-thumbnail">
+                <img src="${video.thumbnail}" alt="${video.title}" onerror="this.parentNode.innerHTML='<i class=\\'fas fa-video\\'></i>'">
+                <div class="video-overlay">
+                    <button class="video-play-btn">
+                        <i class="fas fa-play"></i>
+                    </button>
+                </div>
+                <div class="video-duration">${video.duration}</div>
+            </div>
+            <div class="video-info">
+                <h3 class="video-title">${video.title}</h3>
+                <p class="video-description">${video.description}</p>
+                <div class="video-meta">
+                    <span class="video-date">
+                        <i class="fas fa-calendar"></i> ${formatDate(new Date())}
+                    </span>
+                    <span class="video-category">${video.category}</span>
+                </div>
+                <div class="video-actions">
+                    <button class="video-action-btn" onclick="event.stopPropagation(); shareVideo(${video.id})">
+                        <i class="fas fa-share"></i>
+                    </button>
+                    <button class="video-action-btn" onclick="event.stopPropagation(); addToWatchLater(${video.id})">
+                        <i class="fas fa-clock"></i>
+                    </button>
+                    <button class="video-action-btn" onclick="event.stopPropagation(); openVideoInNewTab('${video.embedUrl}')">
+                        <i class="fas fa-external-link-alt"></i>
+                    </button>
+                </div>
+                ${video.tags ? `
+                    <div class="video-tags">
+                        ${video.tags.map(tag => `<span class="video-tag">#${tag}</span>`).join('')}
+                    </div>
+                ` : ''}
+            </div>
+        </div>
+    `).join('');
+}
+
+function viewVideo(videoId) {
+    const video = currentVideos.find(v => v.id === videoId);
+    if (!video) return;
+
+    const videoDetail = document.getElementById('video-detail');
+    videoDetail.innerHTML = `
+        <div class="video-modal-player">
+            <div class="responsive-video">
+                <iframe src="${video.embedUrl}?autoplay=1&rel=0" 
+                        title="${video.title}" 
+                        frameborder="0" 
+                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
+                        allowfullscreen>
+                </iframe>
+            </div>
+        </div>
+        <div class="video-modal-info">
+            <h1 class="video-modal-title">${video.title}</h1>
+            <div class="video-modal-meta">
+                <div class="video-modal-stats">
+                    <span><i class="fas fa-clock"></i> ${video.duration}</span>
+                    <span><i class="fas fa-calendar"></i> ${formatDate(new Date())}</span>
+                    <span><i class="fas fa-tag"></i> ${video.category}</span>
+                </div>
+                <div class="video-modal-actions">
+                    <button class="btn btn-secondary" onclick="shareVideo(${video.id})">
+                        <i class="fas fa-share"></i> Share
+                    </button>
+                    <button class="btn btn-secondary" onclick="addToWatchLater(${video.id})">
+                        <i class="fas fa-clock"></i> Watch Later
+                    </button>
+                    <button class="btn btn-primary" onclick="openVideoInNewTab('${video.embedUrl}')">
+                        <i class="fas fa-external-link-alt"></i> Open in Platform
+                    </button>
+                </div>
+            </div>
+            <div class="video-modal-description">
+                ${formatVideoDescription(video.description)}
+            </div>
+            ${video.tags ? `
+                <div class="video-tags">
+                    ${video.tags.map(tag => `<span class="video-tag">#${tag}</span>`).join('')}
+                </div>
+            ` : ''}
+            <div class="related-videos">
+                <h3>Related Videos</h3>
+                <div class="related-videos-grid" id="related-videos-grid">
+                    ${getRelatedVideos(video).map(relatedVideo => `
+                        <div class="related-video-card" onclick="viewVideo(${relatedVideo.id})">
+                            <div class="related-video-thumbnail">
+                                <img src="${relatedVideo.thumbnail}" alt="${relatedVideo.title}" onerror="this.parentNode.innerHTML='<i class=\\'fas fa-video\\'></i>'">
+                            </div>
+                            <div class="related-video-info">
+                                <div class="related-video-title">${relatedVideo.title}</div>
+                                <div class="related-video-duration">${relatedVideo.duration}</div>
+                            </div>
+                        </div>
+                    `).join('')}
+                </div>
+            </div>
+        </div>
+    `;
+
+    openModal('video-modal');
+    recordVideoView(videoId);
+}
+
+function closeVideoModal() {
+    closeModal('video-modal');
+    
+    // Stop any playing video by reloading the iframe
+    const iframe = document.querySelector('#video-modal iframe');
+    if (iframe) {
+        iframe.src = iframe.src;
+    }
+}
+
+function filterVideos(category) {
+    currentCategory = category;
+    
+    // Update active tab
+    document.querySelectorAll('.category-tab').forEach(tab => {
+        tab.classList.remove('active');
+    });
+    document.querySelector(`[data-category="${category}"]`).classList.add('active');
+    
+    // Filter videos
+    if (category === 'all') {
+        filteredVideos = [...currentVideos];
+    } else {
+        filteredVideos = currentVideos.filter(video => video.category === category);
+    }
+    
+    displayVideos(filteredVideos);
+}
+
+function searchVideos() {
+    const query = document.getElementById('search-input').value.toLowerCase();
+    
+    if (!query.trim()) {
+        filteredVideos = currentCategory === 'all' ? [...currentVideos] : 
+                        currentVideos.filter(video => video.category === currentCategory);
+    } else {
+        let searchBase = currentCategory === 'all' ? currentVideos : 
+                        currentVideos.filter(video => video.category === currentCategory);
+        
+        filteredVideos = searchBase.filter(video =>
+            video.title.toLowerCase().includes(query) ||
+            video.description.toLowerCase().includes(query) ||
+            (video.tags && video.tags.some(tag => tag.toLowerCase().includes(query)))
+        );
+    }
+    
+    displayVideos(filteredVideos);
+}
+
+function setView(viewType) {
+    currentView = viewType;
+    
+    const container = document.getElementById('videos-grid');
+    const gridBtn = document.getElementById('grid-view-btn');
+    const listBtn = document.getElementById('list-view-btn');
+    
+    if (viewType === 'grid') {
+        container.classList.remove('list-view');
+        gridBtn.classList.add('active');
+        listBtn.classList.remove('active');
+    } else {
+        container.classList.add('list-view');
+        listBtn.classList.add('active');
+        gridBtn.classList.remove('active');
+    }
+}
+
+function shareVideo(videoId) {
+    const video = currentVideos.find(v => v.id === videoId);
+    if (!video) return;
+
+    const shareData = {
+        title: video.title,
+        text: video.description,
+        url: `${window.location.origin}/video.html?video=${videoId}`
+    };
+
+    if (navigator.share) {
+        navigator.share(shareData);
+    } else {
+        navigator.clipboard.writeText(shareData.url).then(() => {
+            showMessage('Video link copied to clipboard!', 'success');
+        });
+    }
+}
+
+function addToWatchLater(videoId) {
+    const watchLater = JSON.parse(localStorage.getItem('bultimore_watch_later')) || [];
+    
+    if (!watchLater.includes(videoId)) {
+        watchLater.push(videoId);
+        localStorage.setItem('bultimore_watch_later', JSON.stringify(watchLater));
+        showMessage('Added to Watch Later', 'success');
+    } else {
+        showMessage('Already in Watch Later', 'error');
+    }
+}
+
+function openVideoInNewTab(embedUrl) {
+    // Convert embed URL to regular YouTube/Vimeo URL
+    let regularUrl = embedUrl;
+    
+    if (embedUrl.includes('youtube.com/embed/')) {
+        const videoId = embedUrl.split('/embed/')[1].split('?')[0];
+        regularUrl = `https://www.youtube.com/watch?v=${videoId}`;
+    } else if (embedUrl.includes('vimeo.com/video/')) {
+        const videoId = embedUrl.split('/video/')[1].split('?')[0];
+        regularUrl = `https://vimeo.com/${videoId}`;
+    }
+    
+    window.open(regularUrl, '_blank');
+}
+
+function getRelatedVideos(currentVideo) {
+    // Get videos from same category or with similar tags
+    return currentVideos
+        .filter(video => 
+            video.id !== currentVideo.id && 
+            (video.category === currentVideo.category ||
+             (video.tags && currentVideo.tags && 
+              video.tags.some(tag => currentVideo.tags.includes(tag))))
+        )
+        .slice(0, 4);
+}
+
+function formatVideoDescription(description) {
+    // Convert line breaks to paragraphs and make URLs clickable
+    return description
+        .split('\n\n')
+        .map(paragraph => {
+            // Simple URL detection and linking
+            const urlRegex = /(https?:\/\/[^\s]+)/g;
+            const linkedText = paragraph.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener">$1</a>');
+            return `<p>${linkedText}</p>`;
+        })
+        .join('');
+}
+
+function initializeVideoFeatures() {
+    // Search functionality
+    const searchInput = document.getElementById('search-input');
+    if (searchInput) {
+        searchInput.addEventListener('input', debounce(searchVideos, 300));
+        searchInput.addEventListener('keypress', function(e) {
+            if (e.key === 'Enter') {
+                searchVideos();
+            }
+        });
+    }
+
+    // Handle URL parameters for direct video links
+    handleVideoUrlParams();
+    
+    // Initialize lazy loading for video thumbnails
+    initializeLazyLoading();
+    
+    // Set up intersection observer for video analytics
+    setupVideoAnalytics();
+}
+
+function handleVideoUrlParams() {
+    const urlParams = new URLSearchParams(window.location.search);
+    const videoId = urlParams.get('video');
+    
+    if (videoId) {
+        setTimeout(() => {
+            viewVideo(parseInt(videoId));
+        }, 1000);
+    }
+}
+
+function initializeLazyLoading() {
+    if ('IntersectionObserver' in window) {
+        const imageObserver = new IntersectionObserver((entries, observer) => {
+            entries.forEach(entry => {
+                if (entry.isIntersecting) {
+                    const img = entry.target;
+                    if (img.dataset.src) {
+                        img.src = img.dataset.src;
+                        img.classList.remove('lazy');
+                        observer.unobserve(img);
+                    }
+                }
+            });
+        });
+
+        document.querySelectorAll('img[data-src]').forEach(img => {
+            imageObserver.observe(img);
+        });
+    }
+}
+
+function setupVideoAnalytics() {
+    const videoObserver = new IntersectionObserver((entries) => {
+        entries.forEach(entry => {
+            if (entry.isIntersecting) {
+                const videoCard = entry.target;
+                const videoId = videoCard.getAttribute('data-video-id');
+                if (videoId) {
+                    recordVideoImpression(videoId);
+                }
+            }
+        });
+    }, { threshold: 0.5 });
+
+    document.querySelectorAll('.video-card').forEach(card => {
+        videoObserver.observe(card);
+    });
+}
+
+function recordVideoView(videoId) {
+    const viewHistory = JSON.parse(localStorage.getItem('bultimore_video_views')) || [];
+    viewHistory.push({
+        videoId: videoId,
+        timestamp: new Date().toISOString(),
+        type: 'view'
+    });
+    
+    // Keep only last 1000 views
+    if (viewHistory.length > 1000) {
+        viewHistory.splice(0, viewHistory.length - 1000);
+    }
+    
+    localStorage.setItem('bultimore_video_views', JSON.stringify(viewHistory));
+}
+
+function recordVideoImpression(videoId) {
+    const impressions = JSON.parse(localStorage.getItem('bultimore_video_impressions')) || [];
+    
+    // Don't record duplicate impressions within 1 hour
+    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
+    const recentImpression = impressions.find(imp => 
+        imp.videoId === videoId && new Date(imp.timestamp) > oneHourAgo
+    );
+    
+    if (!recentImpression) {
+        impressions.push({
+            videoId: videoId,
+            timestamp: new Date().toISOString(),
+            type: 'impression'
+        });
+        
+        // Keep only last 1000 impressions
+        if (impressions.length > 1000) {
+            impressions.splice(0, impressions.length - 1000);
+        }
+        
+        localStorage.setItem('bultimore_video_impressions', JSON.stringify(impressions));
+    }
+}
+
+function showLoading(show) {
+    const loading = document.getElementById('videos-loading');
+    if (loading) {
+        loading.style.display = show ? 'flex' : 'none';
+    }
+}
+
+function formatDate(date) {
+    return date.toLocaleDateString('en-US', {
+        year: 'numeric',
+        month: 'long',
+        day: 'numeric'
+    });
+}
+
+// Video playlist functionality
+function createVideoPlaylist(name, videoIds) {
+    const playlists = JSON.parse(localStorage.getItem('bultimore_video_playlists')) || [];
+    
+    const playlist = {
+        id: Date.now(),
+        name: name,
+        videos: videoIds,
+        created: new Date().toISOString()
+    };
+    
+    playlists.push(playlist);
+    localStorage.setItem('bultimore_video_playlists', JSON.stringify(playlists));
+    
+    return playlist;
+}
+
+function getVideoPlaylists() {
+    return JSON.parse(localStorage.getItem('bultimore_video_playlists')) || [];
+}
+
+function playVideoPlaylist(playlistId) {
+    const playlists = getVideoPlaylists();
+    const playlist = playlists.find(p => p.id === playlistId);
+    
+    if (playlist && playlist.videos.length > 0) {
+        viewVideo(playlist.videos[0]);
+    }
+}
+
+// Video series functionality
+function loadVideoSeries() {
+    const series = [
+        {
+            id: 1,
+            title: "Art Fundamentals",
+            description: "Complete series covering basic art techniques",
+            videos: [3, 4], // Video IDs
+            episodes: 8
+        },
+        {
+            id: 2,
+            title: "Behind the Scenes",
+            description: "Exclusive behind-the-scenes content",
+            videos: [4, 5],
+            episodes: 5
+        }
+    ];
+
+    const container = document.getElementById('video-series');
+    if (!container) return;
+
+    container.innerHTML = series.map(s => `
+        <div class="video-series">
+            <div class="series-header">
+                <h3 class="series-title">${s.title}</h3>
+                <div class="series-info">${s.episodes} episodes</div>
+            </div>
+            <div class="series-videos">
+                ${s.videos.map((videoId, index) => {
+                    const video = currentVideos.find(v => v.id === videoId);
+                    return video ? `
+                        <div class="series-video" onclick="viewVideo(${video.id})">
+                            <div class="series-video-thumbnail">
+                                <img src="${video.thumbnail}" alt="${video.title}" onerror="this.parentNode.innerHTML='<i class=\\'fas fa-video\\'></i>'">
+                                <div class="series-episode-number">EP ${index + 1}</div>
+                            </div>
+                            <div class="series-video-info">
+                                <div class="series-video-title">${video.title}</div>
+                                <div class="series-video-duration">${video.duration}</div>
+                            </div>
+                        </div>
+                    ` : '';
+                }).join('')}
+            </div>
+        </div>
+    `).join('');
+}
+
+// Video comments (simplified)
+function loadVideoComments(videoId) {
+    // In a real app, this would load from backend
+    const comments = JSON.parse(localStorage.getItem(`video_comments_${videoId}`)) || [];
+    
+    return comments.sort((a, b) => new Date(b.date) - new Date(a.date));
+}
+
+function addVideoComment(videoId, comment) {
+    const comments = loadVideoComments(videoId);
+    
+    const newComment = {
+        id: Date.now(),
+        author: comment.author || 'Anonymous',
+        content: comment.content,
+        date: new Date().toISOString()
+    };
+    
+    comments.unshift(newComment);
+    localStorage.setItem(`video_comments_${videoId}`, JSON.stringify(comments));
+    
+    return newComment;
+}
+
+// Video analytics for admin
+function getVideoAnalytics() {
+    const views = JSON.parse(localStorage.getItem('bultimore_video_views')) || [];
+    const impressions = JSON.parse(localStorage.getItem('bultimore_video_impressions')) || [];
+    
+    const analytics = currentVideos.map(video => {
+        const videoViews = views.filter(v => v.videoId === video.id).length;
+        const videoImpressions = impressions.filter(i => i.videoId === video.id).length;
+        
+        return {
+            ...video,
+            views: videoViews,
+            impressions: videoImpressions,
+            clickRate: videoImpressions > 0 ? (videoViews / videoImpressions * 100).toFixed(1) : 0
+        };
+    });
+    
+    return {
+        totalVideos: currentVideos.length,
+        totalViews: views.length,
+        totalImpressions: impressions.length,
+        averageClickRate: analytics.reduce((sum, v) => sum + parseFloat(v.clickRate), 0) / analytics.length,
+        topPerforming: analytics.sort((a, b) => b.views - a.views),
+        recentViews: views.slice(-20).reverse()
+    };
+}
+
+// Keyboard shortcuts for video navigation
+document.addEventListener('keydown', function(event) {
+    const modal = document.getElementById('video-modal');
+    if (modal.style.display !== 'block') return;
+
+    switch(event.code) {
+        case 'Escape':
+            closeVideoModal();
+            break;
+        case 'ArrowLeft':
+            // Previous video in series/playlist
+            navigateVideo('previous');
+            break;
+        case 'ArrowRight':
+            // Next video in series/playlist
+            navigateVideo('next');
+            break;
+    }
+});
+
+function navigateVideo(direction) {
+    const currentVideoId = getCurrentVideoId();
+    if (!currentVideoId) return;
+
+    const currentIndex = filteredVideos.findIndex(v => v.id === currentVideoId);
+    let nextIndex;
+
+    if (direction === 'next') {
+        nextIndex = (currentIndex + 1) % filteredVideos.length;
+    } else {
+        nextIndex = currentIndex === 0 ? filteredVideos.length - 1 : currentIndex - 1;
+    }
+
+    const nextVideo = filteredVideos[nextIndex];
+    if (nextVideo) {
+        viewVideo(nextVideo.id);
+    }
+}
+
+function getCurrentVideoId() {
+    const iframe = document.querySelector('#video-modal iframe');
+    if (!iframe) return null;
+
+    // Extract video ID from iframe src
+    const src = iframe.src;
+    if (src.includes('youtube.com/embed/')) {
+        return currentVideos.find(v => v.embedUrl.includes(src.split('/embed/')[1].split('?')[0]))?.id;
+    }
+    
+    return null;
+}
+
+// Auto-play next video feature
+function setupAutoPlay() {
+    // This would require YouTube/Vimeo API integration for real implementation
+    console.log('Auto-play setup - requires platform API integration');
+}
+
+// Export for admin use
+window.videoManager = {
+    loadVideoGallery,
+    displayVideos,
+    filterVideos,
+    searchVideos,
+    getVideoAnalytics,
+    createVideoPlaylist,
+    loadVideoSeries
+};
EOF
)