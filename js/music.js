(cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF'
diff --git a/js/music.js b/js/music.js
--- a/js/music.js
+++ b/js/music.js
@@ -0,0 +1,672 @@
+// Music player functionality for bultimore.com
+document.addEventListener('DOMContentLoaded', function() {
+    initializeMusicPlayer();
+    loadMusicLibrary();
+    loadPlaylists();
+    loadFeaturedTrack();
+});
+
+let currentTrack = null;
+let currentPlaylist = [];
+let currentTrackIndex = 0;
+let isPlaying = false;
+let isShuffled = false;
+let isRepeating = false;
+let audioPlayer = null;
+
+function initializeMusicPlayer() {
+    audioPlayer = document.getElementById('audio-player');
+    
+    if (!audioPlayer) return;
+
+    // Audio event listeners
+    audioPlayer.addEventListener('loadstart', handleLoadStart);
+    audioPlayer.addEventListener('canplay', handleCanPlay);
+    audioPlayer.addEventListener('timeupdate', updateProgress);
+    audioPlayer.addEventListener('ended', handleTrackEnd);
+    audioPlayer.addEventListener('error', handleAudioError);
+
+    // Volume control
+    const volumeSlider = document.getElementById('volume-slider');
+    if (volumeSlider) {
+        volumeSlider.addEventListener('input', function() {
+            audioPlayer.volume = this.value / 100;
+        });
+        
+        // Set initial volume
+        audioPlayer.volume = 0.7;
+    }
+}
+
+function loadFeaturedTrack() {
+    const featuredTracks = window.contentManager.getFeaturedMusic();
+    if (featuredTracks.length === 0) return;
+
+    const track = featuredTracks[0];
+    const container = document.getElementById('featured-player');
+    
+    if (!container) return;
+
+    container.innerHTML = `
+        <div class="featured-album-art">
+            <img src="${track.image}" alt="${track.album}" onerror="handleImageError(this)">
+        </div>
+        <div class="featured-track-info">
+            <h2>${track.title}</h2>
+            <div class="artist">${track.artist}</div>
+            <div class="album">${track.album}</div>
+        </div>
+        <div class="featured-controls">
+            <button class="featured-play-btn" onclick="playTrack(${track.id})" id="featured-play-${track.id}">
+                <i class="fas fa-play"></i>
+            </button>
+        </div>
+        <div class="featured-progress">
+            <div class="featured-progress-bar" onclick="seekTo(event, 'featured')">
+                <div class="featured-progress-fill" id="featured-progress-fill"></div>
+            </div>
+            <div class="featured-time">
+                <span id="featured-current-time">0:00</span>
+                <span id="featured-total-time">${track.duration}</span>
+            </div>
+        </div>
+        <div class="streaming-platforms">
+            <h3>Listen On</h3>
+            <div class="platform-links">
+                <a href="#" class="platform-link-btn">
+                    <div class="platform-icon spotify">
+                        <i class="fab fa-spotify"></i>
+                    </div>
+                    <span>Spotify</span>
+                </a>
+                <a href="${track.src}" target="_blank" class="platform-link-btn">
+                    <div class="platform-icon soundcloud">
+                        <i class="fab fa-soundcloud"></i>
+                    </div>
+                    <span>SoundCloud</span>
+                </a>
+                <a href="#" class="platform-link-btn">
+                    <div class="platform-icon youtube">
+                        <i class="fab fa-youtube"></i>
+                    </div>
+                    <span>YouTube</span>
+                </a>
+                <a href="#" class="platform-link-btn">
+                    <div class="platform-icon bandcamp">
+                        <i class="fab fa-bandcamp"></i>
+                    </div>
+                    <span>Bandcamp</span>
+                </a>
+            </div>
+        </div>
+    `;
+}
+
+function loadMusicLibrary() {
+    const tracks = window.contentManager.getMusic();
+    const container = document.getElementById('music-grid');
+    
+    if (!container) return;
+
+    currentPlaylist = tracks;
+
+    container.innerHTML = tracks.map((track, index) => `
+        <div class="track-card">
+            <div class="track-image">
+                <img src="${track.image}" alt="${track.album}" onerror="handleImageError(this)">
+                <div class="track-overlay">
+                    <button class="track-play-btn" onclick="playTrack(${track.id}, ${index})" id="play-btn-${track.id}">
+                        <i class="fas fa-play"></i>
+                    </button>
+                </div>
+            </div>
+            <div class="track-info">
+                <h3 class="track-title">${track.title}</h3>
+                <div class="track-artist">${track.artist}</div>
+                <div class="track-album">${track.album}</div>
+                <div class="track-duration">${track.duration}</div>
+                <div class="track-actions">
+                    <button class="track-action-btn" onclick="addToPlaylist(${track.id})" title="Add to Playlist">
+                        <i class="fas fa-plus"></i>
+                    </button>
+                    <button class="track-action-btn" onclick="shareTrack(${track.id})" title="Share">
+                        <i class="fas fa-share"></i>
+                    </button>
+                    <button class="track-action-btn" onclick="downloadTrack(${track.id})" title="Download">
+                        <i class="fas fa-download"></i>
+                    </button>
+                </div>
+            </div>
+        </div>
+    `).join('');
+}
+
+function loadPlaylists() {
+    const container = document.getElementById('playlists-grid');
+    if (!container) return;
+
+    // Sample playlists - in a real app, this would come from the content manager
+    const playlists = [
+        {
+            id: 1,
+            title: "Creative Flow",
+            description: "Music for focused creative work and inspiration",
+            trackCount: 12,
+            cover: "images/playlist1.jpg",
+            tracks: [1, 2] // Track IDs
+        },
+        {
+            id: 2,
+            title: "Community Vibes",
+            description: "Uplifting tracks for community gatherings",
+            trackCount: 8,
+            cover: "images/playlist2.jpg",
+            tracks: [1, 2]
+        },
+        {
+            id: 3,
+            title: "Midnight Sessions",
+            description: "Late night creative energy and contemplation",
+            trackCount: 15,
+            cover: "images/playlist3.jpg",
+            tracks: [1, 2]
+        }
+    ];
+
+    container.innerHTML = playlists.map(playlist => `
+        <div class="playlist-card" onclick="playPlaylist(${playlist.id})">
+            <div class="playlist-cover">
+                <img src="${playlist.cover}" alt="${playlist.title}" onerror="this.parentNode.innerHTML='<i class=\\'fas fa-music\\'></i>'">
+                <div class="playlist-track-count">${playlist.trackCount} tracks</div>
+            </div>
+            <div class="playlist-info">
+                <h3 class="playlist-title">${playlist.title}</h3>
+                <p class="playlist-description">${playlist.description}</p>
+                <div class="playlist-stats">
+                    <span>${playlist.trackCount} tracks</span>
+                    <span>Updated recently</span>
+                </div>
+            </div>
+        </div>
+    `).join('');
+}
+
+function playTrack(trackId, index = 0) {
+    const track = window.contentManager.getMusic().find(t => t.id === trackId);
+    if (!track) return;
+
+    currentTrack = track;
+    currentTrackIndex = index;
+
+    // Update UI
+    updateNowPlaying(track);
+    updatePlayButtons(trackId);
+
+    // For demo purposes, we'll simulate audio playback
+    // In a real app, you would load the actual audio file or embed
+    simulateAudioPlayback(track);
+    
+    showMessage(`Now playing: ${track.title}`, 'success');
+}
+
+function simulateAudioPlayback(track) {
+    // This is a simulation - in a real app you would:
+    // 1. Load actual audio files
+    // 2. Use SoundCloud/Bandcamp embed APIs
+    // 3. Stream from your hosting service
+
+    isPlaying = true;
+    updatePlayButtonStates();
+    
+    // Show now playing bar
+    const nowPlayingBar = document.getElementById('now-playing-bar');
+    if (nowPlayingBar) {
+        nowPlayingBar.style.display = 'grid';
+    }
+
+    // Simulate progress update
+    let currentTime = 0;
+    const duration = parseDuration(track.duration);
+    
+    const progressInterval = setInterval(() => {
+        if (!isPlaying) {
+            clearInterval(progressInterval);
+            return;
+        }
+        
+        currentTime += 1;
+        updateProgressDisplay(currentTime, duration);
+        
+        if (currentTime >= duration) {
+            clearInterval(progressInterval);
+            handleTrackEnd();
+        }
+    }, 1000);
+}
+
+function updateNowPlaying(track) {
+    const image = document.getElementById('now-playing-image');
+    const title = document.getElementById('now-playing-title');
+    const artist = document.getElementById('now-playing-artist');
+    
+    if (image) image.src = track.image;
+    if (title) title.textContent = track.title;
+    if (artist) artist.textContent = track.artist;
+}
+
+function updatePlayButtons(activeTrackId) {
+    // Reset all play buttons
+    document.querySelectorAll('[id^="play-btn-"]').forEach(btn => {
+        btn.innerHTML = '<i class="fas fa-play"></i>';
+        btn.classList.remove('playing');
+    });
+
+    // Update active button
+    const activeBtn = document.getElementById(`play-btn-${activeTrackId}`);
+    if (activeBtn) {
+        activeBtn.innerHTML = '<i class="fas fa-pause"></i>';
+        activeBtn.classList.add('playing');
+    }
+}
+
+function updatePlayButtonStates() {
+    const mainPlayBtn = document.getElementById('main-play-btn');
+    if (mainPlayBtn) {
+        mainPlayBtn.innerHTML = isPlaying ? '<i class="fas fa-pause"></i>' : '<i class="fas fa-play"></i>';
+    }
+}
+
+function togglePlay() {
+    if (!currentTrack) {
+        // Play first track if none selected
+        const tracks = window.contentManager.getMusic();
+        if (tracks.length > 0) {
+            playTrack(tracks[0].id, 0);
+        }
+        return;
+    }
+
+    isPlaying = !isPlaying;
+    updatePlayButtonStates();
+    
+    if (isPlaying) {
+        showMessage('Resuming playback', 'success');
+    } else {
+        showMessage('Paused', 'success');
+    }
+}
+
+function nextTrack() {
+    if (currentPlaylist.length === 0) return;
+
+    if (isShuffled) {
+        currentTrackIndex = Math.floor(Math.random() * currentPlaylist.length);
+    } else {
+        currentTrackIndex = (currentTrackIndex + 1) % currentPlaylist.length;
+    }
+
+    const nextTrack = currentPlaylist[currentTrackIndex];
+    playTrack(nextTrack.id, currentTrackIndex);
+}
+
+function previousTrack() {
+    if (currentPlaylist.length === 0) return;
+
+    if (isShuffled) {
+        currentTrackIndex = Math.floor(Math.random() * currentPlaylist.length);
+    } else {
+        currentTrackIndex = currentTrackIndex === 0 ? currentPlaylist.length - 1 : currentTrackIndex - 1;
+    }
+
+    const prevTrack = currentPlaylist[currentTrackIndex];
+    playTrack(prevTrack.id, currentTrackIndex);
+}
+
+function toggleShuffle() {
+    isShuffled = !isShuffled;
+    const shuffleBtn = document.getElementById('shuffle-btn');
+    
+    if (shuffleBtn) {
+        shuffleBtn.classList.toggle('active', isShuffled);
+    }
+    
+    showMessage(isShuffled ? 'Shuffle enabled' : 'Shuffle disabled', 'success');
+}
+
+function toggleRepeat() {
+    isRepeating = !isRepeating;
+    const repeatBtn = document.getElementById('repeat-btn');
+    
+    if (repeatBtn) {
+        repeatBtn.classList.toggle('active', isRepeating);
+    }
+    
+    showMessage(isRepeating ? 'Repeat enabled' : 'Repeat disabled', 'success');
+}
+
+function handleTrackEnd() {
+    if (isRepeating) {
+        playTrack(currentTrack.id, currentTrackIndex);
+    } else {
+        nextTrack();
+    }
+}
+
+function seekTo(event, type = 'main') {
+    const progressBar = event.currentTarget;
+    const rect = progressBar.getBoundingClientRect();
+    const clickX = event.clientX - rect.left;
+    const percentage = clickX / rect.width;
+    
+    // In a real app, you would seek the audio to this position
+    console.log(`Seeking to ${(percentage * 100).toFixed(1)}%`);
+    
+    showMessage('Seeking...', 'success');
+}
+
+function updateProgressDisplay(currentTime, duration) {
+    const progressFill = document.getElementById('progress-fill');
+    const featuredProgressFill = document.getElementById('featured-progress-fill');
+    const currentTimeDisplay = document.getElementById('current-time');
+    const featuredCurrentTime = document.getElementById('featured-current-time');
+    
+    const percentage = (currentTime / duration) * 100;
+    
+    if (progressFill) {
+        progressFill.style.width = `${percentage}%`;
+    }
+    
+    if (featuredProgressFill) {
+        featuredProgressFill.style.width = `${percentage}%`;
+    }
+    
+    const timeString = formatTime(currentTime);
+    if (currentTimeDisplay) {
+        currentTimeDisplay.textContent = timeString;
+    }
+    
+    if (featuredCurrentTime) {
+        featuredCurrentTime.textContent = timeString;
+    }
+}
+
+function formatTime(seconds) {
+    const minutes = Math.floor(seconds / 60);
+    const remainingSeconds = seconds % 60;
+    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
+}
+
+function parseDuration(durationString) {
+    const parts = durationString.split(':');
+    return parseInt(parts[0]) * 60 + parseInt(parts[1]);
+}
+
+function playPlaylist(playlistId) {
+    // In a real app, load playlist tracks from backend
+    const tracks = window.contentManager.getMusic();
+    currentPlaylist = tracks;
+    currentTrackIndex = 0;
+    
+    if (tracks.length > 0) {
+        playTrack(tracks[0].id, 0);
+        showMessage('Playing playlist', 'success');
+    }
+}
+
+function addToPlaylist(trackId) {
+    // Simple implementation - in a real app, show playlist selection modal
+    const track = window.contentManager.getMusic().find(t => t.id === trackId);
+    if (!track) return;
+
+    const userPlaylists = JSON.parse(localStorage.getItem('bultimore_user_playlists')) || [];
+    
+    // Create "Favorites" playlist if it doesn't exist
+    let favoritesPlaylist = userPlaylists.find(p => p.name === 'Favorites');
+    if (!favoritesPlaylist) {
+        favoritesPlaylist = {
+            id: Date.now(),
+            name: 'Favorites',
+            tracks: []
+        };
+        userPlaylists.push(favoritesPlaylist);
+    }
+
+    // Add track if not already in favorites
+    if (!favoritesPlaylist.tracks.includes(trackId)) {
+        favoritesPlaylist.tracks.push(trackId);
+        localStorage.setItem('bultimore_user_playlists', JSON.stringify(userPlaylists));
+        showMessage(`Added "${track.title}" to Favorites`, 'success');
+    } else {
+        showMessage('Track already in Favorites', 'error');
+    }
+}
+
+function shareTrack(trackId) {
+    const track = window.contentManager.getMusic().find(t => t.id === trackId);
+    if (!track) return;
+
+    const shareData = {
+        title: `${track.title} by ${track.artist}`,
+        text: `Listen to "${track.title}" from the album "${track.album}"`,
+        url: `${window.location.origin}/music.html?track=${trackId}`
+    };
+
+    if (navigator.share) {
+        navigator.share(shareData);
+    } else {
+        navigator.clipboard.writeText(shareData.url).then(() => {
+            showMessage('Track link copied to clipboard!', 'success');
+        });
+    }
+}
+
+function downloadTrack(trackId) {
+    const track = window.contentManager.getMusic().find(t => t.id === trackId);
+    if (!track) return;
+
+    // In a real app, this would trigger an actual download
+    // For demo, we'll show a message and open the external link
+    showMessage('Redirecting to download source...', 'success');
+    
+    setTimeout(() => {
+        window.open(track.src, '_blank');
+    }, 1000);
+}
+
+// Embedded player integration
+function loadEmbeddedPlayers() {
+    const tracks = window.contentManager.getMusic();
+    const container = document.getElementById('embedded-players');
+    
+    if (!container) return;
+
+    container.innerHTML = tracks.map(track => {
+        // Check if it's a SoundCloud URL
+        if (track.src.includes('soundcloud.com')) {
+            const embedUrl = track.src.replace('soundcloud.com/', 'w.soundcloud.com/player/?url=https://soundcloud.com/');
+            return `
+                <div class="embedded-player">
+                    <iframe src="${embedUrl}&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true"></iframe>
+                    <div class="player-info">
+                        <h3>${track.title}</h3>
+                        <p>by ${track.artist} • ${track.album}</p>
+                        <div class="player-links">
+                            <a href="${track.src}" target="_blank" class="platform-link">
+                                <i class="fab fa-soundcloud"></i> Open in SoundCloud
+                            </a>
+                        </div>
+                    </div>
+                </div>
+            `;
+        }
+        
+        // Default player for other sources
+        return `
+            <div class="embedded-player">
+                <div class="custom-player" data-track-id="${track.id}">
+                    <div class="player-controls">
+                        <button class="play-btn" onclick="playTrack(${track.id})">
+                            <i class="fas fa-play"></i>
+                        </button>
+                        <div class="track-info-inline">
+                            <div class="track-title">${track.title}</div>
+                            <div class="track-artist">${track.artist}</div>
+                        </div>
+                        <div class="track-duration">${track.duration}</div>
+                    </div>
+                    <div class="progress-bar">
+                        <div class="progress-fill"></div>
+                    </div>
+                </div>
+                <div class="player-info">
+                    <h3>${track.title}</h3>
+                    <p>by ${track.artist} • ${track.album}</p>
+                </div>
+            </div>
+        `;
+    }).join('');
+}
+
+// Audio visualization (simple bars)
+function createVisualizer(containerId) {
+    const container = document.getElementById(containerId);
+    if (!container) return;
+
+    const visualizer = document.createElement('div');
+    visualizer.className = 'visualizer';
+    
+    for (let i = 0; i < 20; i++) {
+        const bar = document.createElement('div');
+        bar.className = 'visualizer-bar';
+        bar.style.height = `${Math.random() * 20 + 5}px`;
+        visualizer.appendChild(bar);
+    }
+    
+    container.appendChild(visualizer);
+    
+    // Animate bars when playing
+    if (isPlaying) {
+        animateVisualizer(visualizer);
+    }
+}
+
+function animateVisualizer(visualizer) {
+    if (!isPlaying) return;
+
+    const bars = visualizer.querySelectorAll('.visualizer-bar');
+    bars.forEach(bar => {
+        const height = Math.random() * 20 + 5;
+        bar.style.height = `${height}px`;
+    });
+
+    setTimeout(() => animateVisualizer(visualizer), 100);
+}
+
+// Handle audio loading states
+function handleLoadStart() {
+    showMessage('Loading track...', 'success');
+}
+
+function handleCanPlay() {
+    console.log('Track ready to play');
+}
+
+function handleAudioError(event) {
+    console.error('Audio error:', event);
+    showMessage('Error loading track. Please try again.', 'error');
+    isPlaying = false;
+    updatePlayButtonStates();
+}
+
+// Keyboard shortcuts
+document.addEventListener('keydown', function(event) {
+    // Only handle shortcuts when not typing in input fields
+    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
+        return;
+    }
+
+    switch(event.code) {
+        case 'Space':
+            event.preventDefault();
+            togglePlay();
+            break;
+        case 'ArrowRight':
+            event.preventDefault();
+            nextTrack();
+            break;
+        case 'ArrowLeft':
+            event.preventDefault();
+            previousTrack();
+            break;
+        case 'KeyS':
+            if (event.ctrlKey || event.metaKey) {
+                event.preventDefault();
+                toggleShuffle();
+            }
+            break;
+        case 'KeyR':
+            if (event.ctrlKey || event.metaKey) {
+                event.preventDefault();
+                toggleRepeat();
+            }
+            break;
+    }
+});
+
+// URL parameter handling for direct track links
+function handleMusicUrlParams() {
+    const urlParams = new URLSearchParams(window.location.search);
+    const trackId = urlParams.get('track');
+    
+    if (trackId) {
+        setTimeout(() => {
+            const trackIndex = currentPlaylist.findIndex(t => t.id == trackId);
+            playTrack(parseInt(trackId), trackIndex >= 0 ? trackIndex : 0);
+        }, 1000);
+    }
+}
+
+// Initialize URL parameter handling
+document.addEventListener('DOMContentLoaded', handleMusicUrlParams);
+
+// Music analytics for admin
+function getMusicAnalytics() {
+    const playHistory = JSON.parse(localStorage.getItem('bultimore_play_history')) || [];
+    const tracks = window.contentManager.getMusic();
+    
+    return {
+        totalTracks: tracks.length,
+        totalPlays: playHistory.length,
+        mostPlayed: tracks.map(track => ({
+            ...track,
+            playCount: playHistory.filter(p => p.trackId === track.id).length
+        })).sort((a, b) => b.playCount - a.playCount),
+        recentPlays: playHistory.slice(-10).reverse()
+    };
+}
+
+// Track play history
+function recordPlay(trackId) {
+    const playHistory = JSON.parse(localStorage.getItem('bultimore_play_history')) || [];
+    playHistory.push({
+        trackId: trackId,
+        timestamp: new Date().toISOString(),
+        source: 'web_player'
+    });
+    
+    // Keep only last 1000 plays
+    if (playHistory.length > 1000) {
+        playHistory.splice(0, playHistory.length - 1000);
+    }
+    
+    localStorage.setItem('bultimore_play_history', JSON.stringify(playHistory));
+}
+
+// Export for admin use
+window.musicManager = {
+    loadMusicLibrary,
+    loadPlaylists,
+    playTrack,
+    getMusicAnalytics,
+    createVisualizer
+};
EOF
)