# bultimore.com – Project Context

## 🌍 Project Overview
**bultimore.com** is the official website for a residence and creative brand.  
It will serve as:
- An art marketplace  
- A donation portal  
- A blog/idea-sharing platform  
- A media gallery and digital archive  
- A hub for community engagement and support  

⚠️ Note: The admin controls **everything**.  
No public user accounts are needed.  
All content is created and managed by the admin.

---

## 💰 Budget Constraints
- Total budget: **$12 USD**  
- Requires **free or open-source tools**  
- Hosting, email, payments, and chat must all be zero-cost or minimal

---

## 🔐 Admin Role
- Single admin account with full control  
- Admin can:
  - Add/edit/delete posts  
  - Upload products and images  
  - View and manage donations  
  - Moderate comments  
  - Manage gallery, programs, and library content  

---

## ✨ Core Features (MVP)

### 1. Art Store
- List artworks with images, price, and description  
- Simple cart/checkout  
- Accept Mobile Money, bank transfer (via Flutterwave/Paystack)  

### 2. Donations
- Allow visitors to donate any amount  
- Accept payments via mobile money or bank  

### 3. Blog / Ideas
- Admin can post ideas  
- Users can like, dislike, comment, and share  
- No login required  

### 4. Photo Gallery
- Organized albums  
- Click to enlarge (lightbox)  

### 5. Projects & Programs
- Pages or posts about current and past projects  
- Show progress, updates, and media  

### 6. Digital Library
- Upload/download PDFs, docs, and media  
- Searchable or filterable  

### 7. Support
- 24/7 live chat (using Tawk.to - free)  
- Telephone support (info only or clickable link)  
- Custom email: info@bultimore.com (via Zoho Mail free tier)  

---

## 🌐 Tech Stack Suggestions

| Component         | Tool / Service               | Cost  |
|-------------------|------------------------------|-------|
| Hosting (frontend)| Netlify or Vercel            | Free  |
| Backend/API       | Render / Railway / 000webhost| Free  |
| Database          | JSON, SQLite, or Supabase    | Free  |
| Domain Email      | Zoho Mail (custom domain)    | Free  |
| Live Chat         | Tawk.to                      | Free  |
| Payments          | Flutterwave / Paystack       | Free setup |

---

## 🛠️ Technical Notes
- Prefer **static frontend** (HTML + JS or
## made some changes
# Project Context – bultimore.com

This is the context file for the **bultimore.com** project.  
It will guide AI-assisted coding inside Cursor.  

## Vision
bultimore.com is a simple but functional website that brings together:
- **Art**
- **Ideas**
- **Donations**
- **Community hub**
- **Store**
- **Blog**
- **Gallery**
- **Programs**
- **Library**
- **Support**
- **Music**
- **Video**

The goal is to create a place that reflects creativity, innovation, and community impact, while staying accessible and affordable.  

## Budget
- **Total budget: $12 USD maximum**  
- This must cover **domain + hosting**.  
- Hosting will use **free tiers** (Netlify, Vercel, GitHub Pages, etc.).  
- No premium paid services beyond domain purchase.  

## Technical Constraints
- Must run on **free/open-source tools**.  
- Should work on **mobile and desktop**.  
- Lightweight (minimal dependencies).  
- HTML, CSS, JavaScript frontend (static hosting).  

## Extra Notes
- **Music Section**:  
  - Should include a clean, dedicated page and a homepage preview block.  
  - Ability to embed tracks from free platforms like **SoundCloud, Bandcamp, YouTube Music**, or directly stream MP3 files hosted on free storage.  
  - Playlist support or at least a list of multiple tracks.  
  - Simple player controls (play/pause, next, previous).  
  - Optional album art thumbnails and descriptions for each track.  
  - The design should allow growth, so more songs and albums can be added easily.  

- **Video Section**:  
  - Showcase embedded videos from **YouTube or Vimeo** with clean responsive players.  
  - Should support a **video gallery page** plus a featured video section on the homepage.  
  - Allow short descriptions or stories behind each video.  
  - Design must keep bandwidth light (don’t self-host large video files).  
  - Can include live performance videos, design tutorials, or community project recordings.  
  - Layout should be modular so it can expand into a media hub over time.  

- Keep all design modular, so sections can be added step-by-step.  
