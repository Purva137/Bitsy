🪴 Bitsy — Minimal Habit Tracker

Bitsy is a clean, pixel-inspired habit tracker built as both:

- 🌐 Progressive Web App (PWA)
- 🖥️ Windows Desktop App (Electron)

Designed to feel small, focused, and distraction-free.

---

✨ Features

- 🪴 Simple habit tracking
- 📅 Day counter system
- 📊 Visual progress grid
- 🖼️ Export progress as shareable image
- 🖥️ Frameless custom desktop window
- ❌ Functional close button (desktop)
- ⚡ Lightweight and fast
- 🌙 Dark mode support
- 📦 Windows installer build

---

🖥️ Desktop Version (Electron)

Bitsy runs as a compact desktop utility app with:

- Custom draggable title bar
- Frameless window
- Proper close behavior
- Fixed compact window size
- No browser UI

Run in development:

```bash
npm start
```

Build Windows installer:

```bash
npm run dist
```

Installer will be generated in:

```bash
/dist
```

---

🌐 Web Version

Runs as a Progressive Web App.

Features:

- Installable
- Offline capable (Service Worker)
- Works in modern browsers
- Clean UI without desktop-specific behavior

To run locally:

```bash
Open index.html
```

Or deploy to:

- GitHub Pages
- Netlify
- Vercel

---

🛠️ Tech Stack

- HTML
- CSS
- Vanilla JavaScript
- Electron
- Electron Builder

No frameworks. No bloat.

---

📦 Project Structure

```bash
bitsy/
│
├── index.html
├── style.css
├── script.js
├── main.js
├── preload.js
├── manifest.json
├── service-worker.js
├── package.json
├── icons/
└── dist/
```

---

🎯 Philosophy

Bitsy is intentionally:

- Small
- Focused
- Minimal
- Offline-friendly
- Fast

No accounts. No tracking. No cloud dependency.

Just habits.

---

🚀 Roadmap Ideas

- Auto-update support
- System tray mode
- Daily reminders
- Statistics view
- Cross-platform builds (Mac / Linux)
- Mobile-optimized layout

---

📄 License

MIT License

---

👩‍💻 Author

Built by Purva 💛  
Crafted with obsession and polish.
