(cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF'
diff --git a/DEPLOYMENT.md b/DEPLOYMENT.md
--- a/DEPLOYMENT.md
+++ b/DEPLOYMENT.md
@@ -0,0 +1,204 @@
+# Deployment Guide for bultimore.com
+
+## Quick Start
+
+This is a static website that can be deployed to any static hosting service. The entire project is contained in this directory and requires no build process.
+
+## Recommended Hosting (Free Options)
+
+### 1. Netlify (Recommended)
+- **Cost**: Free tier available
+- **Custom domain**: $12/year for domain only
+- **Steps**:
+  1. Create account at [netlify.com](https://netlify.com)
+  2. Connect your GitHub repository or drag & drop the project folder
+  3. Site will auto-deploy from the root directory
+  4. Configure custom domain in Netlify settings
+
+### 2. Vercel
+- **Cost**: Free tier available  
+- **Steps**:
+  1. Create account at [vercel.com](https://vercel.com)
+  2. Import from GitHub or deploy directly
+  3. No configuration needed - auto-detects static site
+
+### 3. GitHub Pages
+- **Cost**: Free
+- **Steps**:
+  1. Push code to GitHub repository
+  2. Enable GitHub Pages in repository settings
+  3. Set source to root directory
+
+## Required Setup Steps
+
+### 1. Payment Integration
+Update the following files with your actual payment provider keys:
+
+**For Flutterwave:**
+```javascript
+// In js/store.js and js/donate.js, replace:
+public_key: "FLWPUBK_TEST-XXXXX"
+// With your actual Flutterwave public key
+```
+
+**For Paystack (alternative):**
+```javascript
+// Add Paystack integration if preferred
+```
+
+### 2. Live Chat Integration
+Update Tawk.to integration in `index.html`:
+```javascript
+// Replace YOUR_TAWK_ID and YOUR_WIDGET_ID with actual values from Tawk.to
+s1.src='https://embed.tawk.to/YOUR_TAWK_ID/YOUR_WIDGET_ID';
+```
+
+### 3. Email Setup
+- Set up custom email at [Zoho Mail](https://www.zoho.com/mail/) (free tier)
+- Update contact email throughout the site
+- Configure contact forms to send to your email
+
+### 4. Domain Configuration
+- Purchase domain from any registrar (~$12/year)
+- Point domain to your hosting provider
+- Configure DNS settings as per hosting provider instructions
+
+## File Structure
+```
+/
+├── index.html              # Homepage
+├── store.html             # Art store
+├── blog.html              # Blog/Ideas
+├── gallery.html           # Photo gallery
+├── music.html             # Music player
+├── video.html             # Video gallery
+├── donate.html            # Donation page
+├── programs.html          # Programs & projects
+├── library.html           # Digital library
+├── css/                   # Stylesheets
+├── js/                    # JavaScript files
+├── images/                # Image assets (empty - add your images)
+├── admin/                 # Admin panel
+├── package.json           # Project metadata
+├── netlify.toml          # Netlify configuration
+└── README.md             # Project documentation
+```
+
+## Content Management
+
+### Admin Panel
+- Access at: `yoursite.com/admin`
+- Default credentials: `admin` / `admin123`
+- **Important**: Change these credentials in `js/admin.js`
+
+### Adding Content
+1. **Products**: Use admin panel to add artworks
+2. **Blog Posts**: Create posts through admin interface
+3. **Gallery**: Upload photos and create albums
+4. **Music**: Add SoundCloud/Bandcamp embeds
+5. **Videos**: Embed YouTube/Vimeo videos
+
+## Customization
+
+### Colors and Branding
+Main brand colors are defined in `css/style.css`:
+```css
+/* Primary brand color */
+#e74c3c (red)
+
+/* Secondary colors */
+#2c3e50 (dark blue)
+#1abc9c (teal)
+#9b59b6 (purple)
+#e67e22 (orange)
+```
+
+### Images
+Add your images to the `/images` directory:
+- `/images/art/` - Artwork images
+- `/images/gallery/` - Gallery photos  
+- `/images/music/` - Album covers
+- `/images/video/` - Video thumbnails
+
+### Content
+All content is managed through:
+- Admin panel (recommended)
+- Direct editing of `js/content.js`
+- Local storage (for testing)
+
+## SEO Optimization
+
+### Meta Tags
+Update meta descriptions in each HTML file for better SEO.
+
+### Sitemap
+Create `sitemap.xml` with your actual domain:
+```xml
+<?xml version="1.0" encoding="UTF-8"?>
+<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
+  <url><loc>https://bultimore.com/</loc></url>
+  <url><loc>https://bultimore.com/store.html</loc></url>
+  <url><loc>https://bultimore.com/blog.html</loc></url>
+  <!-- Add all your pages -->
+</urlset>
+```
+
+## Security Notes
+
+### Admin Access
+- Change default admin credentials immediately
+- Consider adding proper authentication system for production
+- Restrict admin panel access via server configuration
+
+### Payment Security
+- Use HTTPS only (automatic on Netlify/Vercel)
+- Never store sensitive payment data in localStorage
+- Validate all payments server-side in production
+
+## Performance
+
+### Image Optimization
+- Compress images before uploading
+- Use WebP format when possible
+- Implement lazy loading (already included)
+
+### Caching
+- Static files are cached automatically
+- `netlify.toml` includes cache headers
+
+## Support
+
+### Free Services Used
+- **Hosting**: Netlify/Vercel (free tier)
+- **Email**: Zoho Mail (free tier)
+- **Chat**: Tawk.to (free)
+- **Payments**: Flutterwave (free setup)
+- **CDN**: Automatically provided by hosting
+
+### Monitoring
+- Use Netlify Analytics (free basic tier)
+- Google Analytics (free) - add tracking code if needed
+
+## Backup
+
+### Local Backup
+- Use admin panel "Export Data" feature
+- Regularly backup using git
+
+### Remote Backup
+- GitHub repository serves as code backup
+- Consider automated database backups for user data
+
+## Scaling
+
+When you outgrow the free tiers:
+- Upgrade hosting plan for more bandwidth
+- Add backend database (PostgreSQL, MongoDB)
+- Implement user authentication system
+- Add advanced analytics and monitoring
+
+---
+
+**Total estimated monthly cost**: $1-2 (domain only)
+**Setup time**: 2-4 hours
+**Maintenance**: Minimal - update content via admin panel
EOF
)