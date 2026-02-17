# TMX Notes

A modern, cross-platform desktop notes application built with Electron, React, and Firebase. Features a rich text editor, real-time sync, role-based access control, and a customizable glassmorphism/minimal theme system.

![Electron](https://img.shields.io/badge/Electron-33-47848F?logo=electron&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-11-FFCA28?logo=firebase&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white)

## Screenshots

![TMX Notes - Screenshot 1](screenshots/screenshot-1.png)

![TMX Notes - Screenshot 2](screenshots/screenshot-2.png)

## Features

- **Rich Text Editor** — Powered by Tiptap with bold, italic, underline, strikethrough, highlight, headings (H1–H3), bullet/ordered/task lists, blockquotes, code blocks, and horizontal rules
- **Real-time Sync** — Notes sync across devices via Firebase Firestore
- **Google Authentication** — Secure sign-in with Google accounts
- **Role-Based Access Control** — Three roles: superadmin, admin, and user
  - **Superadmin** — Full access: create, edit, delete notes; manage all users
  - **Admin** — Read/edit notes; add/remove users
  - **User** — Read and edit notes only
- **User Management** — Admins can invite users by email and assign roles
- **Pin Notes** — Pin important notes to the top of the list
- **Search** — Instantly filter notes by title or content
- **4 Theme Variants** — Two styles (Glass / Minimal) × two modes (Dark / Light), with localStorage persistence
- **Auto-save** — Debounced saving (1 second) as you type
- **Cross-Platform** — Builds for Windows, macOS, and Linux
- **Secure** — Content Security Policy, context isolation, sandboxed renderer

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Electron 33 + electron-vite |
| Frontend | React 19 + TypeScript 5 |
| Styling | Tailwind CSS 3 + CSS custom properties |
| Editor | Tiptap 2 (ProseMirror) |
| Icons | Lucide React |
| State | Zustand 5 |
| Backend | Firebase (Auth + Firestore) |
| Build | electron-builder |

## Prerequisites

- [Node.js](https://nodejs.org/) 18+ and npm
- A [Firebase](https://console.firebase.google.com/) project with:
  - **Authentication** enabled (Google sign-in provider)
  - **Cloud Firestore** database created

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/your-username/tmx-notes.git
cd tmx-notes
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure Firebase

Create a `.env` file in the project root (use `.env.example` as a template):

```bash
cp .env.example .env
```

Fill in your Firebase project credentials and superadmin email:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_SUPERADMIN_EMAIL=your-email@gmail.com
```

> The `VITE_SUPERADMIN_EMAIL` is the Google account that will have full superadmin access. This user is always authorized and cannot be removed.

### 4. Firebase Firestore Rules

In the Firebase Console, go to **Firestore Database > Rules** and set up appropriate security rules for the `notes` and `allowedUsers` collections.

### 5. Run in development

```bash
npm run dev
```

## Building

Build distributable packages for your platform:

```bash
# Windows (NSIS installer + portable .exe)
npm run build:win

# macOS (.dmg + .zip)
npm run build:mac

# Linux (.AppImage + .deb)
npm run build:linux

# All platforms
npm run build:all
```

Output files are saved to the `build/` directory.

### Type checking

```bash
npm run typecheck
```

## Project Structure

```
tmx-notes/
├── src/
│   ├── main/                   # Electron main process
│   │   ├── index.ts            # Window creation, CSP, menu
│   │   └── ipc-handlers.ts     # IPC communication
│   ├── preload/                # Preload scripts (context bridge)
│   │   └── index.ts
│   └── renderer/               # React application
│       └── src/
│           ├── components/     # UI components
│           │   ├── EditorToolbar.tsx
│           │   ├── EmptyState.tsx
│           │   ├── LoginScreen.tsx
│           │   ├── NoteEditor.tsx
│           │   ├── NoteList.tsx
│           │   ├── NoteListItem.tsx
│           │   ├── SearchBar.tsx
│           │   ├── Sidebar.tsx
│           │   ├── ThemeToggle.tsx
│           │   ├── UnauthorizedScreen.tsx
│           │   └── UserManagement.tsx
│           ├── hooks/          # Custom React hooks
│           │   ├── useAuth.ts
│           │   ├── useDebounce.ts
│           │   ├── useNote.ts
│           │   └── useNotes.ts
│           ├── lib/            # Firebase & editor config
│           │   ├── editor-extensions.ts
│           │   ├── firebase.ts
│           │   ├── firestore.ts
│           │   └── user-management.ts
│           ├── stores/         # Zustand state management
│           │   ├── auth-store.ts
│           │   ├── note-store.ts
│           │   └── theme-store.ts
│           ├── types/          # TypeScript type definitions
│           ├── utils/          # Utility functions
│           ├── app.css         # Theme variables & glass styles
│           ├── App.tsx         # Root component
│           └── main.tsx        # Entry point
├── resources/                  # App icons (ico, png, icns)
├── .env.example                # Environment variable template
├── electron.vite.config.ts     # Electron-vite configuration
├── tailwind.config.ts          # Tailwind CSS configuration
├── tsconfig.json               # TypeScript configuration
└── package.json
```

## Themes

TMX Notes includes 4 built-in themes, switchable from the sidebar:

| Theme | Description |
|-------|-------------|
| **Glass Dark** | Glassmorphism with blur, gradients, and glow effects on a dark background |
| **Glass Light** | Glassmorphism with translucent panels on a light background |
| **Minimal Dark** | Clean, flat design with no blur effects on a dark background |
| **Minimal Light** | Clean, flat design on a white background |

Theme preference is saved to `localStorage` and persists across sessions.

## License

MIT
