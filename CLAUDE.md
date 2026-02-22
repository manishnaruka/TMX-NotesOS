# NotesOS (TMX Notes) — Claude Project Guide

## Project Overview

A production-ready notes app built with Electron, React, TypeScript, and Firebase. Notes are stored in Firestore with real-time sync; auth uses Google OAuth via Firebase. Access is gated by a role-based allow-list.

All app code lives under `Electron/`. Run all commands from that directory.

## Tech Stack

- **Electron** (v33) + **electron-vite** (build/dev tooling)
- **React 19** + **TypeScript 5**
- **Firebase 11**: Firestore (notes + user management), Auth (Google OAuth)
- **Zustand 5**: client state (auth, selected note, theme)
- **TipTap 2**: rich-text editor (JSON storage format)
- **Tailwind CSS 3** + `@tailwindcss/typography`
- **lucide-react**: icons

## Key Architecture Decisions

### Local HTTP Server (Port 49821)
In production, the main process starts a local HTTP server at `localhost:49821` to serve renderer files. This is **required** for Firebase Auth persistence — Firebase rejects `file://` origins for `signInWithPopup`. Port is fixed for stable origin across restarts (localStorage/IndexedDB keyed by origin).

### Security Model
- `sandbox: true`, `contextIsolation: true`, `nodeIntegration: false` in BrowserWindow
- CSP headers applied **only in production** (Vite dev HMR requires inline scripts)
- IPC handlers (window controls, app version) registered in `ipc-handlers.ts`

### Role-Based Access Control
Three roles: `superadmin` | `admin` | `user`
- Superadmin email set via `VITE_SUPERADMIN_EMAIL` env var
- Other users must be in the Firestore `allowedUsers` collection
- Notes have an `assignedTo: string[]` field (emails); empty = only superadmin

### Notes Data Model
```ts
interface Note {
  id: string
  title: string
  content: TiptapJSON        // TipTap JSON doc format
  plainTextPreview: string
  createdAt / updatedAt: Timestamp
  isPinned: boolean
  isDeleted: boolean         // soft delete
  userId: string
  tags: string[]
  createdBy / lastEditedBy: NoteUserInfo
  assignedTo: string[]       // emails of allowed viewers
}
```

## Project Structure

```
NotesOS/
└── Electron/
    ├── src/
    │   ├── main/
    │   │   ├── index.ts           # App entry: window creation, local server, CSP
    │   │   └── ipc-handlers.ts    # IPC: window minimize/maximize/close, app:version
    │   ├── preload/
    │   │   └── index.ts           # Exposes safe APIs to renderer via contextBridge
    │   └── renderer/src/
    │       ├── components/        # UI: NoteEditor, LoginScreen, UserManagement, etc.
    │       ├── hooks/
    │       │   ├── useAuth.ts     # Firebase auth state + authorization check
    │       │   ├── useNote.ts     # Firestore real-time note subscription
    │       │   └── useDebounce.ts
    │       ├── lib/
    │       │   ├── firebase.ts         # Firebase init (validates env vars on startup)
    │       │   ├── user-management.ts  # allowedUsers CRUD + subscriptions
    │       │   └── editor-extensions.ts # TipTap extension config
    │       ├── stores/
    │       │   ├── auth-store.ts  # user, loading, role, authorized
    │       │   ├── note-store.ts  # selectedNoteId, searchQuery
    │       │   └── theme-store.ts
    │       ├── types/
    │       │   └── note.ts        # Note, UserRole, AllowedUser, TiptapJSON types
    │       └── utils/
    │           ├── content.ts
    │           └── date.ts
    ├── electron.vite.config.ts    # @ alias → src/renderer/src
    ├── tailwind.config.ts
    └── package.json
```

## Environment Variables

All prefixed with `VITE_` (renderer-accessible). Validated at startup in `firebase.ts`.

```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
VITE_SUPERADMIN_EMAIL
```

## Commands (run from `Electron/`)

```bash
npm run dev          # Dev mode with HMR (DevTools auto-open)
npm run build        # Production build
npm run typecheck    # TypeScript check (node + web tsconfigs)
npm run build:mac    # Build + package for macOS (dmg + zip)
npm run build:win    # Build + package for Windows (nsis + portable)
npm run build:linux  # Build + package for Linux (AppImage + deb)
```

## Common Patterns

- **Import alias**: `@/` maps to `src/renderer/src/`
- **State**: Zustand stores (not React context). Auth state in `useAuthStore`, UI selection in `useNoteStore`.
- **Auth flow**: `useAuth` hook subscribes to `onAuthStateChanged`, then calls `checkUserAllowed` to set role + authorization.
- **Firestore collections**: `notes`, `allowedUsers`
- **Soft deletes**: Notes have `isDeleted` flag; filter on queries rather than `deleteDoc`
- **TipTap content**: Stored as JSON (`TiptapJSON`), not HTML. Use `plainTextPreview` for search/display snippets.
