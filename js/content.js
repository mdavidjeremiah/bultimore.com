(cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF'
diff --git a/js/content.js b/js/content.js
--- a/js/content.js
+++ b/js/content.js
@@ -0,0 +1,369 @@
+// Content management system for bultimore.com
+class ContentManager {
+    constructor() {
+        this.data = this.loadData();
+        this.initializeData();
+    }
+
+    initializeData() {
+        // Initialize with sample data if empty
+        if (!this.data.products || this.data.products.length === 0) {
+            this.data.products = [
+                {
+                    id: 1,
+                    title: "Abstract Dreams",
+                    description: "A vibrant abstract piece exploring the subconscious mind through bold colors and flowing forms.",
+                    price: 150,
+                    image: "images/art1.jpg",
+                    category: "painting",
+                    featured: true,
+                    dateAdded: new Date().toISOString()
+                },
+                {
+                    id: 2,
+                    title: "Urban Landscape",
+                    description: "Contemporary urban scene capturing the energy and rhythm of city life.",
+                    price: 200,
+                    image: "images/art2.jpg",
+                    category: "photography",
+                    featured: true,
+                    dateAdded: new Date().toISOString()
+                },
+                {
+                    id: 3,
+                    title: "Color Symphony",
+                    description: "An explosion of colors creating harmony and movement on canvas.",
+                    price: 175,
+                    image: "images/art3.jpg",
+                    category: "painting",
+                    featured: false,
+                    dateAdded: new Date().toISOString()
+                }
+            ];
+        }
+
+        if (!this.data.blogPosts || this.data.blogPosts.length === 0) {
+            this.data.blogPosts = [
+                {
+                    id: 1,
+                    title: "The Power of Community Art",
+                    content: "Art has always been a powerful force for bringing communities together. In this post, we explore how creative expression can bridge divides and create lasting connections between people from all walks of life.",
+                    excerpt: "Exploring how art brings people together and creates lasting community bonds.",
+                    author: "Admin",
+                    datePublished: new Date().toISOString(),
+                    likes: 12,
+                    dislikes: 1,
+                    comments: [],
+                    tags: ["community", "art", "connection"]
+                },
+                {
+                    id: 2,
+                    title: "Digital vs Traditional Media",
+                    content: "The debate between digital and traditional art mediums continues to evolve. Each has its unique strengths and offers different possibilities for artistic expression.",
+                    excerpt: "A comparison of artistic mediums and their unique strengths.",
+                    author: "Admin",
+                    datePublished: new Date(Date.now() - 86400000).toISOString(),
+                    likes: 8,
+                    dislikes: 0,
+                    comments: [],
+                    tags: ["digital", "traditional", "media"]
+                },
+                {
+                    id: 3,
+                    title: "Supporting Local Artists",
+                    content: "Local artists are the heartbeat of our creative communities. Supporting them means investing in the cultural richness of our neighborhoods and ensuring art remains accessible to everyone.",
+                    excerpt: "Why local art matters more than ever in our communities.",
+                    author: "Admin",
+                    datePublished: new Date(Date.now() - 172800000).toISOString(),
+                    likes: 15,
+                    dislikes: 0,
+                    comments: [],
+                    tags: ["local", "support", "community"]
+                }
+            ];
+        }
+
+        if (!this.data.gallery || this.data.gallery.length === 0) {
+            this.data.gallery = [
+                {
+                    id: 1,
+                    title: "Studio Sessions",
+                    description: "Behind the scenes in the creative process",
+                    images: [
+                        { src: "images/gallery/studio1.jpg", caption: "Morning light in the studio" },
+                        { src: "images/gallery/studio2.jpg", caption: "Work in progress" },
+                        { src: "images/gallery/studio3.jpg", caption: "Creative tools and materials" }
+                    ]
+                },
+                {
+                    id: 2,
+                    title: "Community Events",
+                    description: "Moments from our community gatherings",
+                    images: [
+                        { src: "images/gallery/event1.jpg", caption: "Art exhibition opening" },
+                        { src: "images/gallery/event2.jpg", caption: "Workshop participants" },
+                        { src: "images/gallery/event3.jpg", caption: "Community celebration" }
+                    ]
+                }
+            ];
+        }
+
+        if (!this.data.music || this.data.music.length === 0) {
+            this.data.music = [
+                {
+                    id: 1,
+                    title: "Creative Flow",
+                    artist: "bultimore",
+                    album: "Studio Sessions Vol. 1",
+                    duration: "3:45",
+                    src: "https://soundcloud.com/example", // Replace with actual SoundCloud embed
+                    image: "images/music/album1.jpg",
+                    featured: true
+                },
+                {
+                    id: 2,
+                    title: "Urban Rhythms",
+                    artist: "bultimore",
+                    album: "City Sounds",
+                    duration: "4:12",
+                    src: "https://soundcloud.com/example2",
+                    image: "images/music/album2.jpg",
+                    featured: false
+                }
+            ];
+        }
+
+        if (!this.data.videos || this.data.videos.length === 0) {
+            this.data.videos = [
+                {
+                    id: 1,
+                    title: "Creative Process Documentary",
+                    description: "A behind-the-scenes look at the artistic process",
+                    embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", // Replace with actual video
+                    thumbnail: "images/video/thumb1.jpg",
+                    duration: "12:34",
+                    featured: true
+                },
+                {
+                    id: 2,
+                    title: "Community Art Workshop",
+                    description: "Teaching art techniques to community members",
+                    embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
+                    thumbnail: "images/video/thumb2.jpg",
+                    duration: "8:45",
+                    featured: false
+                }
+            ];
+        }
+
+        this.saveData();
+    }
+
+    loadData() {
+        const saved = localStorage.getItem('bultimore_content');
+        return saved ? JSON.parse(saved) : {};
+    }
+
+    saveData() {
+        localStorage.setItem('bultimore_content', JSON.stringify(this.data));
+    }
+
+    // Product methods
+    getProducts() {
+        return this.data.products || [];
+    }
+
+    getFeaturedProducts() {
+        return this.getProducts().filter(product => product.featured);
+    }
+
+    getProduct(id) {
+        return this.getProducts().find(product => product.id == id);
+    }
+
+    addProduct(product) {
+        const products = this.getProducts();
+        product.id = Date.now();
+        product.dateAdded = new Date().toISOString();
+        products.push(product);
+        this.data.products = products;
+        this.saveData();
+        return product;
+    }
+
+    updateProduct(id, updates) {
+        const products = this.getProducts();
+        const index = products.findIndex(product => product.id == id);
+        if (index !== -1) {
+            products[index] = { ...products[index], ...updates };
+            this.data.products = products;
+            this.saveData();
+            return products[index];
+        }
+        return null;
+    }
+
+    deleteProduct(id) {
+        this.data.products = this.getProducts().filter(product => product.id != id);
+        this.saveData();
+    }
+
+    // Blog methods
+    getBlogPosts() {
+        return this.data.blogPosts || [];
+    }
+
+    getLatestPosts(limit = 3) {
+        return this.getBlogPosts()
+            .sort((a, b) => new Date(b.datePublished) - new Date(a.datePublished))
+            .slice(0, limit);
+    }
+
+    getBlogPost(id) {
+        return this.getBlogPosts().find(post => post.id == id);
+    }
+
+    addBlogPost(post) {
+        const posts = this.getBlogPosts();
+        post.id = Date.now();
+        post.datePublished = new Date().toISOString();
+        post.likes = 0;
+        post.dislikes = 0;
+        post.comments = [];
+        posts.unshift(post);
+        this.data.blogPosts = posts;
+        this.saveData();
+        return post;
+    }
+
+    updateBlogPost(id, updates) {
+        const posts = this.getBlogPosts();
+        const index = posts.findIndex(post => post.id == id);
+        if (index !== -1) {
+            posts[index] = { ...posts[index], ...updates };
+            this.data.blogPosts = posts;
+            this.saveData();
+            return posts[index];
+        }
+        return null;
+    }
+
+    deleteBlogPost(id) {
+        this.data.blogPosts = this.getBlogPosts().filter(post => post.id != id);
+        this.saveData();
+    }
+
+    // Interaction methods
+    likePost(postId) {
+        const post = this.getBlogPost(postId);
+        if (post) {
+            post.likes = (post.likes || 0) + 1;
+            this.updateBlogPost(postId, { likes: post.likes });
+        }
+    }
+
+    dislikePost(postId) {
+        const post = this.getBlogPost(postId);
+        if (post) {
+            post.dislikes = (post.dislikes || 0) + 1;
+            this.updateBlogPost(postId, { dislikes: post.dislikes });
+        }
+    }
+
+    addComment(postId, comment) {
+        const post = this.getBlogPost(postId);
+        if (post) {
+            const newComment = {
+                id: Date.now(),
+                content: comment.content,
+                author: comment.author || 'Anonymous',
+                date: new Date().toISOString()
+            };
+            post.comments = post.comments || [];
+            post.comments.push(newComment);
+            this.updateBlogPost(postId, { comments: post.comments });
+            return newComment;
+        }
+        return null;
+    }
+
+    // Gallery methods
+    getGalleryAlbums() {
+        return this.data.gallery || [];
+    }
+
+    getAlbum(id) {
+        return this.getGalleryAlbums().find(album => album.id == id);
+    }
+
+    // Music methods
+    getMusic() {
+        return this.data.music || [];
+    }
+
+    getFeaturedMusic() {
+        return this.getMusic().filter(track => track.featured);
+    }
+
+    // Video methods
+    getVideos() {
+        return this.data.videos || [];
+    }
+
+    getFeaturedVideos() {
+        return this.getVideos().filter(video => video.featured);
+    }
+
+    // Search functionality
+    search(query, type = 'all') {
+        const results = {
+            products: [],
+            posts: [],
+            music: [],
+            videos: []
+        };
+
+        const searchTerm = query.toLowerCase();
+
+        if (type === 'all' || type === 'products') {
+            results.products = this.getProducts().filter(product => 
+                product.title.toLowerCase().includes(searchTerm) ||
+                product.description.toLowerCase().includes(searchTerm) ||
+                product.category.toLowerCase().includes(searchTerm)
+            );
+        }
+
+        if (type === 'all' || type === 'posts') {
+            results.posts = this.getBlogPosts().filter(post => 
+                post.title.toLowerCase().includes(searchTerm) ||
+                post.content.toLowerCase().includes(searchTerm) ||
+                (post.tags && post.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
+            );
+        }
+
+        if (type === 'all' || type === 'music') {
+            results.music = this.getMusic().filter(track => 
+                track.title.toLowerCase().includes(searchTerm) ||
+                track.artist.toLowerCase().includes(searchTerm) ||
+                track.album.toLowerCase().includes(searchTerm)
+            );
+        }
+
+        if (type === 'all' || type === 'videos') {
+            results.videos = this.getVideos().filter(video => 
+                video.title.toLowerCase().includes(searchTerm) ||
+                video.description.toLowerCase().includes(searchTerm)
+            );
+        }
+
+        return results;
+    }
+}
+
+// Initialize content manager
+window.contentManager = new ContentManager();
+
+// Export for use in other scripts
+if (typeof module !== 'undefined' && module.exports) {
+    module.exports = ContentManager;
+}
EOF
)