(cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF'
diff --git a/js/gallery.js b/js/gallery.js
--- a/js/gallery.js
+++ b/js/gallery.js
@@ -0,0 +1,744 @@
+// Gallery functionality for bultimore.com
+document.addEventListener('DOMContentLoaded', function() {
+    loadAlbums();
+    initializeGalleryFeatures();
+});
+
+let currentAlbums = [];
+let currentPhotos = [];
+let currentPhotoIndex = 0;
+let slideshowInterval = null;
+let isSlideshow = false;
+
+function loadAlbums() {
+    currentAlbums = window.contentManager.getGalleryAlbums();
+    displayAlbums(currentAlbums);
+    populateAlbumFilter();
+}
+
+function displayAlbums(albums) {
+    const container = document.getElementById('albums-grid');
+    if (!container) return;
+
+    container.innerHTML = albums.map(album => `
+        <div class="album-card" onclick="viewAlbum(${album.id})">
+            <div class="album-cover">
+                <div class="album-cover-grid">
+                    ${album.images.slice(0, 3).map((image, index) => `
+                        <div class="album-cover-image">
+                            <img src="${image.src}" alt="${image.caption}" onerror="handleImageError(this)">
+                        </div>
+                    `).join('')}
+                </div>
+                <div class="album-overlay">
+                    <div class="album-photo-count">${album.images.length} photos</div>
+                </div>
+            </div>
+            <div class="album-info">
+                <h3 class="album-title">${album.title}</h3>
+                <p class="album-description">${album.description}</p>
+                <div class="album-meta">
+                    <span>${album.images.length} photos</span>
+                    <span>Updated recently</span>
+                </div>
+            </div>
+        </div>
+    `).join('');
+}
+
+function viewAlbum(albumId) {
+    const album = currentAlbums.find(a => a.id === albumId);
+    if (!album) return;
+
+    currentPhotos = album.images.map((image, index) => ({
+        ...image,
+        albumTitle: album.title,
+        index: index
+    }));
+
+    // Show gallery section, hide albums section
+    document.getElementById('albums-section').style.display = 'none';
+    document.getElementById('gallery-section').style.display = 'block';
+    
+    // Update header
+    document.getElementById('current-album-title').textContent = album.title;
+    
+    // Display photos
+    displayPhotos(currentPhotos);
+    
+    // Initialize masonry layout
+    setTimeout(initializeMasonry, 100);
+}
+
+function showAlbums() {
+    document.getElementById('albums-section').style.display = 'block';
+    document.getElementById('gallery-section').style.display = 'none';
+    
+    // Stop slideshow if active
+    if (isSlideshow) {
+        stopSlideshow();
+    }
+}
+
+function displayPhotos(photos) {
+    const container = document.getElementById('gallery-grid');
+    if (!container) return;
+
+    container.innerHTML = photos.map((photo, index) => `
+        <div class="gallery-item" onclick="openLightbox(${index})" data-index="${index}">
+            <img src="${photo.src}" alt="${photo.caption}" onerror="handleImageError(this)" onload="calculateMasonrySpan(this)">
+            <div class="gallery-item-overlay">
+                <div class="gallery-item-title">${photo.caption}</div>
+            </div>
+            <div class="photo-actions">
+                <button class="photo-action-btn" onclick="event.stopPropagation(); downloadPhoto('${photo.src}', '${photo.caption}')" title="Download">
+                    <i class="fas fa-download"></i>
+                </button>
+                <button class="photo-action-btn" onclick="event.stopPropagation(); sharePhoto(${index})" title="Share">
+                    <i class="fas fa-share"></i>
+                </button>
+            </div>
+        </div>
+    `).join('');
+}
+
+function calculateMasonrySpan(img) {
+    const galleryGrid = document.getElementById('gallery-grid');
+    if (!galleryGrid.classList.contains('masonry')) return;
+
+    const item = img.closest('.gallery-item');
+    const rowHeight = 10; // Should match CSS grid-auto-rows
+    const rowGap = 16; // Should match CSS gap
+    
+    const imageHeight = img.naturalHeight;
+    const imageWidth = img.naturalWidth;
+    const containerWidth = item.offsetWidth;
+    
+    const scaledHeight = (imageHeight / imageWidth) * containerWidth;
+    const rowSpan = Math.ceil((scaledHeight + rowGap) / (rowHeight + rowGap));
+    
+    item.style.setProperty('--row-span', rowSpan);
+}
+
+function initializeMasonry() {
+    const images = document.querySelectorAll('#gallery-grid img');
+    let loadedImages = 0;
+    
+    images.forEach(img => {
+        if (img.complete) {
+            calculateMasonrySpan(img);
+            loadedImages++;
+        } else {
+            img.addEventListener('load', () => {
+                calculateMasonrySpan(img);
+                loadedImages++;
+                if (loadedImages === images.length) {
+                    console.log('All images loaded for masonry');
+                }
+            });
+        }
+    });
+}
+
+function setGalleryView(viewType) {
+    const container = document.getElementById('gallery-grid');
+    const buttons = document.querySelectorAll('.view-btn');
+    
+    // Remove all view classes
+    container.classList.remove('masonry', 'grid');
+    buttons.forEach(btn => btn.classList.remove('active'));
+    
+    // Add new view class and activate button
+    if (viewType !== 'slideshow') {
+        container.classList.add(viewType);
+        document.getElementById(`${viewType}-btn`).classList.add('active');
+        
+        if (viewType === 'masonry') {
+            setTimeout(initializeMasonry, 100);
+        }
+    } else {
+        document.getElementById('slideshow-btn').classList.add('active');
+        startSlideshow();
+    }
+}
+
+function openLightbox(photoIndex) {
+    if (currentPhotos.length === 0) return;
+
+    currentPhotoIndex = photoIndex;
+    const photo = currentPhotos[photoIndex];
+    
+    const lightboxImage = document.getElementById('lightbox-image');
+    const lightboxTitle = document.getElementById('lightbox-title');
+    const lightboxCaption = document.getElementById('lightbox-caption');
+    const lightboxCounter = document.getElementById('lightbox-counter');
+    
+    lightboxImage.src = photo.src;
+    lightboxImage.alt = photo.caption;
+    lightboxTitle.textContent = photo.albumTitle;
+    lightboxCaption.textContent = photo.caption;
+    lightboxCounter.textContent = `${photoIndex + 1} of ${currentPhotos.length}`;
+    
+    document.getElementById('lightbox-modal').style.display = 'block';
+    document.body.style.overflow = 'hidden';
+    
+    // Preload adjacent images
+    preloadAdjacentImages(photoIndex);
+}
+
+function closeLightbox() {
+    document.getElementById('lightbox-modal').style.display = 'none';
+    document.body.style.overflow = 'auto';
+}
+
+function navigateLightbox(direction) {
+    if (direction === 'next') {
+        currentPhotoIndex = (currentPhotoIndex + 1) % currentPhotos.length;
+    } else {
+        currentPhotoIndex = currentPhotoIndex === 0 ? currentPhotos.length - 1 : currentPhotoIndex - 1;
+    }
+    
+    updateLightboxContent();
+}
+
+function updateLightboxContent() {
+    const photo = currentPhotos[currentPhotoIndex];
+    
+    const lightboxImage = document.getElementById('lightbox-image');
+    const lightboxTitle = document.getElementById('lightbox-title');
+    const lightboxCaption = document.getElementById('lightbox-caption');
+    const lightboxCounter = document.getElementById('lightbox-counter');
+    
+    // Fade out
+    lightboxImage.style.opacity = '0';
+    
+    setTimeout(() => {
+        lightboxImage.src = photo.src;
+        lightboxImage.alt = photo.caption;
+        lightboxTitle.textContent = photo.albumTitle;
+        lightboxCaption.textContent = photo.caption;
+        lightboxCounter.textContent = `${currentPhotoIndex + 1} of ${currentPhotos.length}`;
+        
+        // Fade in
+        lightboxImage.style.opacity = '1';
+    }, 150);
+    
+    preloadAdjacentImages(currentPhotoIndex);
+}
+
+function preloadAdjacentImages(index) {
+    const preloadIndexes = [
+        index - 1 >= 0 ? index - 1 : currentPhotos.length - 1,
+        index + 1 < currentPhotos.length ? index + 1 : 0
+    ];
+    
+    preloadIndexes.forEach(i => {
+        const img = new Image();
+        img.src = currentPhotos[i].src;
+    });
+}
+
+function downloadPhoto(src, filename) {
+    const link = document.createElement('a');
+    link.href = src;
+    link.download = filename || 'photo.jpg';
+    document.body.appendChild(link);
+    link.click();
+    document.body.removeChild(link);
+    
+    showMessage('Download started', 'success');
+}
+
+function sharePhoto(photoIndex) {
+    const photo = currentPhotos[photoIndex];
+    
+    const shareData = {
+        title: photo.caption,
+        text: `Check out this photo: ${photo.caption}`,
+        url: `${window.location.origin}/gallery.html?photo=${photoIndex}`
+    };
+
+    if (navigator.share) {
+        navigator.share(shareData);
+    } else {
+        navigator.clipboard.writeText(shareData.url).then(() => {
+            showMessage('Photo link copied to clipboard!', 'success');
+        });
+    }
+}
+
+function filterByAlbum() {
+    const albumFilter = document.getElementById('album-filter').value;
+    
+    if (!albumFilter) {
+        showAlbums();
+        return;
+    }
+    
+    const albumId = parseInt(albumFilter);
+    viewAlbum(albumId);
+}
+
+function populateAlbumFilter() {
+    const select = document.getElementById('album-filter');
+    if (!select) return;
+
+    const options = currentAlbums.map(album => 
+        `<option value="${album.id}">${album.title}</option>`
+    ).join('');
+    
+    select.innerHTML = '<option value="">All Albums</option>' + options;
+}
+
+// Slideshow functionality
+function startSlideshow() {
+    if (currentPhotos.length === 0) {
+        showMessage('No photos to display in slideshow', 'error');
+        return;
+    }
+
+    isSlideshow = true;
+    currentPhotoIndex = 0;
+    
+    // Create slideshow viewer
+    const slideshowViewer = document.createElement('div');
+    slideshowViewer.className = 'slideshow-viewer active';
+    slideshowViewer.id = 'slideshow-viewer';
+    
+    document.body.appendChild(slideshowViewer);
+    document.body.style.overflow = 'hidden';
+    
+    // Show slideshow controls
+    const controls = document.getElementById('slideshow-controls');
+    if (controls) {
+        controls.style.display = 'flex';
+    }
+    
+    updateSlideshowImage();
+    startSlideshowTimer();
+    
+    showMessage('Slideshow started - Press ESC to exit', 'success');
+}
+
+function stopSlideshow() {
+    isSlideshow = false;
+    
+    if (slideshowInterval) {
+        clearInterval(slideshowInterval);
+        slideshowInterval = null;
+    }
+    
+    const slideshowViewer = document.getElementById('slideshow-viewer');
+    if (slideshowViewer) {
+        slideshowViewer.remove();
+    }
+    
+    const controls = document.getElementById('slideshow-controls');
+    if (controls) {
+        controls.style.display = 'none';
+    }
+    
+    document.body.style.overflow = 'auto';
+    
+    // Reset view button states
+    document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
+    document.getElementById('masonry-btn').classList.add('active');
+}
+
+function toggleSlideshow() {
+    if (isSlideshow) {
+        stopSlideshow();
+    } else {
+        startSlideshow();
+    }
+}
+
+function startSlideshowTimer() {
+    const speed = parseInt(document.getElementById('slideshow-speed').value);
+    
+    if (slideshowInterval) {
+        clearInterval(slideshowInterval);
+    }
+    
+    slideshowInterval = setInterval(() => {
+        currentPhotoIndex = (currentPhotoIndex + 1) % currentPhotos.length;
+        updateSlideshowImage();
+    }, speed);
+}
+
+function updateSlideshowImage() {
+    const viewer = document.getElementById('slideshow-viewer');
+    if (!viewer) return;
+
+    const photo = currentPhotos[currentPhotoIndex];
+    
+    viewer.innerHTML = `
+        <img src="${photo.src}" alt="${photo.caption}" class="slideshow-image">
+        <div class="slideshow-info">
+            <h3>${photo.caption}</h3>
+            <p>${currentPhotoIndex + 1} of ${currentPhotos.length}</p>
+        </div>
+    `;
+}
+
+function toggleFullscreen() {
+    const lightboxModal = document.getElementById('lightbox-modal');
+    
+    if (!document.fullscreenElement) {
+        lightboxModal.requestFullscreen().catch(err => {
+            console.error('Error attempting to enable fullscreen:', err);
+        });
+    } else {
+        document.exitFullscreen();
+    }
+}
+
+function initializeGalleryFeatures() {
+    // Keyboard navigation
+    document.addEventListener('keydown', handleKeyboardNavigation);
+    
+    // Touch/swipe support for mobile
+    initializeTouchNavigation();
+    
+    // Lazy loading
+    initializeImageLazyLoading();
+    
+    // Handle URL parameters
+    handleGalleryUrlParams();
+    
+    // Slideshow speed change
+    const speedSelect = document.getElementById('slideshow-speed');
+    if (speedSelect) {
+        speedSelect.addEventListener('change', () => {
+            if (isSlideshow) {
+                startSlideshowTimer();
+            }
+        });
+    }
+}
+
+function handleKeyboardNavigation(event) {
+    const lightboxModal = document.getElementById('lightbox-modal');
+    
+    if (lightboxModal.style.display === 'block') {
+        switch(event.code) {
+            case 'Escape':
+                closeLightbox();
+                break;
+            case 'ArrowLeft':
+                navigateLightbox('prev');
+                break;
+            case 'ArrowRight':
+                navigateLightbox('next');
+                break;
+            case 'Space':
+                event.preventDefault();
+                // Toggle slideshow in lightbox
+                break;
+        }
+    } else if (isSlideshow) {
+        switch(event.code) {
+            case 'Escape':
+                stopSlideshow();
+                break;
+            case 'Space':
+                event.preventDefault();
+                // Pause/resume slideshow
+                if (slideshowInterval) {
+                    clearInterval(slideshowInterval);
+                    slideshowInterval = null;
+                } else {
+                    startSlideshowTimer();
+                }
+                break;
+            case 'ArrowLeft':
+                currentPhotoIndex = currentPhotoIndex === 0 ? currentPhotos.length - 1 : currentPhotoIndex - 1;
+                updateSlideshowImage();
+                break;
+            case 'ArrowRight':
+                currentPhotoIndex = (currentPhotoIndex + 1) % currentPhotos.length;
+                updateSlideshowImage();
+                break;
+        }
+    }
+}
+
+function initializeTouchNavigation() {
+    let startX = 0;
+    let startY = 0;
+    
+    const lightboxModal = document.getElementById('lightbox-modal');
+    
+    lightboxModal.addEventListener('touchstart', (e) => {
+        startX = e.touches[0].clientX;
+        startY = e.touches[0].clientY;
+    });
+    
+    lightboxModal.addEventListener('touchend', (e) => {
+        if (!startX || !startY) return;
+        
+        const endX = e.changedTouches[0].clientX;
+        const endY = e.changedTouches[0].clientY;
+        
+        const deltaX = startX - endX;
+        const deltaY = startY - endY;
+        
+        // Horizontal swipe detection
+        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
+            if (deltaX > 0) {
+                navigateLightbox('next');
+            } else {
+                navigateLightbox('prev');
+            }
+        }
+        
+        // Vertical swipe to close
+        if (Math.abs(deltaY) > Math.abs(deltaX) && deltaY > 100) {
+            closeLightbox();
+        }
+        
+        startX = 0;
+        startY = 0;
+    });
+}
+
+function initializeImageLazyLoading() {
+    if ('IntersectionObserver' in window) {
+        const imageObserver = new IntersectionObserver((entries, observer) => {
+            entries.forEach(entry => {
+                if (entry.isIntersecting) {
+                    const img = entry.target;
+                    if (img.dataset.src) {
+                        img.src = img.dataset.src;
+                        img.classList.add('loaded');
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
+function handleGalleryUrlParams() {
+    const urlParams = new URLSearchParams(window.location.search);
+    const albumId = urlParams.get('album');
+    const photoIndex = urlParams.get('photo');
+    
+    if (albumId) {
+        setTimeout(() => {
+            viewAlbum(parseInt(albumId));
+            
+            if (photoIndex) {
+                setTimeout(() => {
+                    openLightbox(parseInt(photoIndex));
+                }, 500);
+            }
+        }, 1000);
+    }
+}
+
+// Photo management (for admin)
+function addPhotoToAlbum(albumId, photoData) {
+    const album = currentAlbums.find(a => a.id === albumId);
+    if (!album) return false;
+
+    const newPhoto = {
+        src: photoData.src,
+        caption: photoData.caption || 'Untitled',
+        date: new Date().toISOString()
+    };
+    
+    album.images.push(newPhoto);
+    
+    // Update content manager
+    window.contentManager.data.gallery = currentAlbums;
+    window.contentManager.saveData();
+    
+    return true;
+}
+
+function createNewAlbum(albumData) {
+    const newAlbum = {
+        id: Date.now(),
+        title: albumData.title,
+        description: albumData.description,
+        images: albumData.images || [],
+        created: new Date().toISOString()
+    };
+    
+    currentAlbums.push(newAlbum);
+    
+    // Update content manager
+    window.contentManager.data.gallery = currentAlbums;
+    window.contentManager.saveData();
+    
+    displayAlbums(currentAlbums);
+    populateAlbumFilter();
+    
+    return newAlbum;
+}
+
+function deleteAlbum(albumId) {
+    if (!confirm('Are you sure you want to delete this album?')) return;
+    
+    currentAlbums = currentAlbums.filter(album => album.id !== albumId);
+    
+    // Update content manager
+    window.contentManager.data.gallery = currentAlbums;
+    window.contentManager.saveData();
+    
+    displayAlbums(currentAlbums);
+    populateAlbumFilter();
+    showAlbums();
+}
+
+// Image optimization and processing
+function compressImage(file, maxWidth = 1200, quality = 0.8) {
+    return new Promise((resolve) => {
+        const canvas = document.createElement('canvas');
+        const ctx = canvas.getContext('2d');
+        const img = new Image();
+        
+        img.onload = () => {
+            const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
+            canvas.width = img.width * ratio;
+            canvas.height = img.height * ratio;
+            
+            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
+            
+            canvas.toBlob(resolve, 'image/jpeg', quality);
+        };
+        
+        img.src = URL.createObjectURL(file);
+    });
+}
+
+// Drag and drop upload (for admin)
+function initializeDragAndDrop() {
+    const uploadArea = document.getElementById('upload-area');
+    if (!uploadArea) return;
+
+    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
+        uploadArea.addEventListener(eventName, preventDefaults, false);
+    });
+
+    function preventDefaults(e) {
+        e.preventDefault();
+        e.stopPropagation();
+    }
+
+    ['dragenter', 'dragover'].forEach(eventName => {
+        uploadArea.addEventListener(eventName, () => {
+            uploadArea.classList.add('dragover');
+        }, false);
+    });
+
+    ['dragleave', 'drop'].forEach(eventName => {
+        uploadArea.addEventListener(eventName, () => {
+            uploadArea.classList.remove('dragover');
+        }, false);
+    });
+
+    uploadArea.addEventListener('drop', handleDrop, false);
+
+    function handleDrop(e) {
+        const files = e.dataTransfer.files;
+        handleFiles(files);
+    }
+}
+
+function handleFiles(files) {
+    Array.from(files).forEach(file => {
+        if (file.type.startsWith('image/')) {
+            processImageUpload(file);
+        }
+    });
+}
+
+function processImageUpload(file) {
+    const reader = new FileReader();
+    
+    reader.onload = (e) => {
+        // In a real app, you would upload to your server
+        console.log('Image processed:', file.name);
+        showMessage(`Image "${file.name}" processed successfully`, 'success');
+    };
+    
+    reader.readAsDataURL(file);
+}
+
+// Gallery analytics
+function getGalleryAnalytics() {
+    const views = JSON.parse(localStorage.getItem('bultimore_gallery_views')) || [];
+    
+    const albumStats = currentAlbums.map(album => {
+        const albumViews = views.filter(v => v.albumId === album.id).length;
+        return {
+            ...album,
+            views: albumViews,
+            photoCount: album.images.length
+        };
+    });
+    
+    return {
+        totalAlbums: currentAlbums.length,
+        totalPhotos: currentAlbums.reduce((sum, album) => sum + album.images.length, 0),
+        totalViews: views.length,
+        mostViewedAlbum: albumStats.sort((a, b) => b.views - a.views)[0],
+        recentViews: views.slice(-20).reverse(),
+        albumStats: albumStats
+    };
+}
+
+function recordAlbumView(albumId) {
+    const views = JSON.parse(localStorage.getItem('bultimore_gallery_views')) || [];
+    views.push({
+        albumId: albumId,
+        timestamp: new Date().toISOString(),
+        type: 'album_view'
+    });
+    
+    localStorage.setItem('bultimore_gallery_views', JSON.stringify(views));
+}
+
+function recordPhotoView(photoIndex, albumId) {
+    const views = JSON.parse(localStorage.getItem('bultimore_gallery_views')) || [];
+    views.push({
+        albumId: albumId,
+        photoIndex: photoIndex,
+        timestamp: new Date().toISOString(),
+        type: 'photo_view'
+    });
+    
+    localStorage.setItem('bultimore_gallery_views', JSON.stringify(views));
+}
+
+// Search functionality
+function searchGallery(query) {
+    const searchTerm = query.toLowerCase();
+    
+    const matchingAlbums = currentAlbums.filter(album =>
+        album.title.toLowerCase().includes(searchTerm) ||
+        album.description.toLowerCase().includes(searchTerm) ||
+        album.images.some(img => img.caption.toLowerCase().includes(searchTerm))
+    );
+    
+    displayAlbums(matchingAlbums);
+}
+
+// Export for admin use
+window.galleryManager = {
+    loadAlbums,
+    displayAlbums,
+    viewAlbum,
+    addPhotoToAlbum,
+    createNewAlbum,
+    deleteAlbum,
+    getGalleryAnalytics,
+    searchGallery,
+    initializeDragAndDrop
+};
EOF
)