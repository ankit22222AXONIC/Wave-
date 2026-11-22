# Wave — Desktop Music Player & Streamer

A desktop music upload and streaming application built with a strict Matte Gray & Black software aesthetic. Features client-side IndexedDB persistence, metadata extraction, playlists, audio playback, and Firebase Google Sign-In.

![Design Theme](https://img.shields.io/badge/Design-Matte%20Gray%20%26%20Black-121215)
![Stack](https://img.shields.io/badge/Stack-React%20%7C%20TypeScript%20%7C%20Tailwind%20%7C%20Vite-black)
![Database](https://img.shields.io/badge/Database-Dexie%20(IndexedDB)-white)

---

## Features

- **Local Storage & Offline Library**: Uses **Dexie (IndexedDB)** to save uploaded audio files (as Blobs), custom cover art, playlists, and liked tracks directly in the browser so nothing is lost on page refresh.
- **Audio Metadata Extraction**: Automatically reads title, artist, duration, and embedded cover art (ID3 tags) from uploaded audio files (`.mp3`, `.wav`, `.m4a`, `.ogg`, `.flac`) with clean filename fallbacks and placeholder art.
- **Persistent Player Bar**: Fixed 80px bottom music player bar with play/pause, scrubbable progress bar, volume controls, repeat modes (`off`, `all`, `one`), shuffle, and working heart toggle.
- **Spacebar Play/Pause**: Global shortcut with smart detection to avoid triggering while typing in search/inputs.
- **4 Pages**:
  - **Home (All Songs)**: Track table with animated playing equalizer indicator, "Play All", shuffle, and empty state drag-and-drop zone.
  - **Search**: Fast real-time filtering across songs, artists, and playlists with filter pills.
  - **Liked Songs**: Dedicated playlist for favorited tracks with total duration calculations.
  - **Playlist Management**: Create, rename, delete playlists, and easily add tracks from library.
- **Google Sign-In & Name Setup**: Firebase Authentication integration with strict route protection and first-time name customization.

---

## Tech Stack

- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Icons**: `lucide-react`
- **Database**: `dexie` (IndexedDB)
- **Auth**: Firebase Authentication (`signInWithPopup` + `GoogleAuthProvider`)

---

## Getting Started

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/ankit22222AXONIC/Wave-.git
cd Wave-
npm install
```

### 2. Configure Firebase Auth
Copy `.env.example` to `.env` and fill in your Firebase project credentials:
```bash
cp .env.example .env
```
Add your keys to `.env`:
```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_APP_ID=your_app_id_here
```
*(Make sure to enable Google Sign-In in Firebase Console under **Authentication -> Sign-in method** and verify `localhost` is listed under **Authorized domains**).*

### 3. Run Development Server
```bash
npm run dev
```

### 4. Build for Production
```bash
npm run build
```
