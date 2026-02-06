# bultimore.com

Official website for **Bultimore** – a residence and creative brand.  
Features: art marketplace, music & video store, donation portal, blog, gallery, programs, and digital library.

---

## 📂 Project Structure
```
/frontend
  index.html              # Landing page
  /store
    /art                  # Artworks (paintings, sculptures)
    /music                # Music albums, singles
    /video                # Videos, performances
  /gallery                # Photo gallery
  /ideas                  # Blog / idea-sharing
  /library                # Digital library (PDFs, docs)
  /assets
    /images               # Images and covers
    /previews             # Sample MP3/MP4 clips
    /css                  # Stylesheets
    /js                   # JavaScript files
/backend
  server.js               # Express server (optional for CRUD)
  /routes                 # API routes
  /uploads                # Admin uploads
  /database
    data.json             # File-based DB (or SQLite)
.env                      # API keys, admin credentials
README.md                 # Project overview
context.md                # Notes and planning
```

---

## 🚀 Setup
1. Clone repo:
```bash
git clone https://github.com/yourusername/bultimore.com.git
cd bultimore.com
```

2. Install dependencies (if backend is used):
```bash
npm install
```

3. Run backend:
```bash
node backend/server.js
```

4. Deploy frontend to Netlify or Vercel.

---

## 🛠️ Tech Stack
- **Frontend**: Static (HTML + CSS + JS) → Netlify hosting (Free)
- **Backend**: Node.js + Express (Render free tier) or Supabase
- **Database**: JSON / SQLite / Supabase
- **Payments**: Flutterwave / Paystack
- **Email**: Zoho Mail (Free tier)
- **Chat**: Tawk.to

---

## ✅ Launch Priority
1. Static frontend
2. Admin dashboard
3. Art, Music & Video store + donations
4. Blog / Ideas
5. Gallery
6. Digital library
7. Live chat + email support

---

## 📌 Notes
- Single admin controls everything (no public logins)
- Payments handled via Paystack/Flutterwave hosted links
- Keep backend lightweight → JSON files or Supabase storage
- All services must remain free/minimal to stay within $12 budget

