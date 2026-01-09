# 🎵 Free Music Player App - Open Source

Created by [Ninja Turtles](https://github.com/parbax33-droid)
Team Members: 
- Neeraj Saini
- Paree
- Jeevan Prakash SJ
- Gaurav Kalal
- Parbaz Ahmed Mazumder


> **100% Free & Open Source!** Download the code, run it locally, and enjoy ad-free music.

## 🚀 How to Use for Free

You can run this music player completely free on your own computer. Follow these simple steps:

### Step 1: Download the Code
1.  Go to the GitHub repository: [Music-App on GitHub](https://github.com/62fpsgaming-hue/Music-App)
2.  Click on the green **<> Code** button.
3.  Select **Download ZIP**.
4.  Extract the ZIP file to a folder on your computer.

### Step 2: Run the App
Since this app uses modern web technologies (ES6 Modules), you need a simple local server to run it.

**Using Python (Pre-installed on most Macs/Linux):**
1.  Open your Terminal (Command Prompt).
2.  Navigate to the folder where you extracted the code:
    ```bash
    cd path/to/extracted/folder
    ```
3.  Run this command:
    ```bash
    python3 -m http.server 8000
    ```
4.  Open your browser and go to: `http://localhost:8000`

**Using VS Code (Easiest for Beginners):**
1.  Open the extracted folder in VS Code.
2.  Install the "Live Server" extension.
3.  Right-click `index.html` and select **"Open with Live Server"**.

### ✨ Feature Showcase
Once running, you'll experience a premium music player with:
*   **Beautiful UI:** Glassmorphism design with smooth animations.
*   **Full Control:** Play, pause, skip, shuffle, and repeat tracks.
*   **Organization:** Filter by genre, search for songs, and manage queues.
*   **Favorites:** Mark your best tracks for quick access.
*   **Smart History:** Quickly jump back to recently played songs.

---

# Music Player - Status & Integration Guide

## ✅ Player Status: FULLY FUNCTIONAL

The music player is now working perfectly with all features operational:

### Working Features:
- ✅ Play/Pause with icon toggling
- ✅ Next/Previous track navigation
- ✅ Shuffle mode with visual active state
- ✅ Repeat mode with visual active state
- ✅ Track selection from lists
- ✅ Progress bar scrubbing
- ✅ Genre filtering
- ✅ Search functionality
- ✅ Favorite toggling
- ✅ Dynamic recent history
- ✅ Queue management
- ✅ Smooth UI animations and hover effects

---

## 🚀 Running the Application

**Important:** ES6 modules require a web server. Use:

```bash
# Python 3
python3 -m http.server 8080

# Or Node.js
npx http-server -p 8080

# Or PHP
php -S localhost:8080
```

Then open: `http://localhost:8080/index.html`

---

## 📁 Project Structure

```
/Documents/2/
├── index.html          # Main player interface
├── styles.css          # CSS import hub
├── css/
│   ├── base.css        # Variables, resets
│   ├── layout.css      # Layout structure
│   ├── sidebar.css     # Navigation styles
│   ├── components.css  # Cards, buttons
│   ├── pages.css       # List views
│   ├── player.css      # Player controls
│   └── animations.css  # Hover effects, transitions
└── js/
    ├── main.js         # Entry point
    ├── player.js       # Playback logic
    ├── ui.js           # DOM manipulation
    ├── audio.js        # Sound engine
    ├── tracks.js       # Track data
    └── utils.js        # Helper functions
```
