# TMX Notes Mobile Migration Plan

Last updated: 2026-02-22
Owner: Codex + Manish
Target app: `React-Native/`
Source app: `Electron/`

## Goal

Build a React Native app that matches the desktop TMX Notes feature set and shares the same Firebase backend/data model, so notes are seamless between desktop and mobile.

## Confirmed Decisions

- Feature parity target: same core features as desktop.
- Auth: Google login only.
- Backend: same Firebase project and same Firestore collections (`notes`, `allowedUsers`).
- Superadmin: `manishnaruka123@gmail.com` from env config.
- Roles/permissions: same as desktop (`superadmin`, `admin`, `user`) including unauthorized state.
- UI: same branding/colors/look-feel, but mobile-native layout.
- Rich text editor target: `10tap-editor` (closest RN option for Tiptap-like JSON workflows).
- Compatibility priority: mobile must read/write notes in a desktop-compatible format.

## Important Constraint

Desktop stores note content as Tiptap JSON (`notes.content`).

Mobile implementation must preserve shared data integrity:
- Prefer exact JSON compatibility where possible.
- If any unsupported marks/nodes exist on mobile, preserve data and avoid destructive transforms.
- Never overwrite unknown JSON structures with lossy output.

## Implementation Plan

## Phase 0: Baseline and dependency setup

- [x] Confirm current RN scaffold baseline.
- [x] Add dependencies in `package.json`:
  - [x] `firebase`
  - [x] `zustand`
  - [x] `@react-navigation/native`
  - [x] `@react-navigation/native-stack`
  - [x] `react-native-screens`
  - [x] `react-native-safe-area-context`
  - [x] `@react-native-google-signin/google-signin`
  - [x] `react-native-dotenv`
  - [x] `@10play/tentap-editor`
  - [x] `@react-native-async-storage/async-storage`
- [ ] Install dependencies locally (`npm install`) and resolve native pods.
- [x] Add and configure Babel/TS env typings for `.env`.
- [x] Create folder structure aligned to desktop architecture:
  - [x] `src/lib`
  - [x] `src/hooks`
  - [x] `src/stores`
  - [x] `src/types`
  - [x] `src/components`
  - [x] `src/screens`
  - [x] `src/theme`
  - [x] `src/utils`

## Phase 1: Firebase + Auth + Authorization

- [x] Implement `src/lib/firebase.ts` for RN using env vars.
- [x] Implement auth store equivalent to desktop (`user`, `loading`, `role`, `authorized`).
- [x] Implement Google sign-in flow:
  - [x] Configure `GoogleSignin`
  - [x] Sign in and exchange credential with Firebase Auth
  - [x] Sign out support
- [x] Implement authorization logic against `allowedUsers` collection and superadmin email check.
- [x] Create screens:
  - [x] `LoginScreen`
  - [x] `UnauthorizedScreen`
  - [x] Loading state screen

## Phase 2: Notes data layer (shared model)

- [x] Port note types from desktop to RN (`Note`, `TiptapJSON`, `UserRole`, etc.).
- [x] Implement Firestore helpers:
  - [x] `createNote`
  - [x] `updateNoteContent`
  - [x] `deleteNote` (soft delete)
  - [x] `togglePinNote`
  - [x] `assignNoteToUsers`
  - [x] `subscribeToNotes` with same query rules
- [x] Port title/preview extraction utilities for consistent indexing/search.
- [x] Implement note selection/search state store.

## Phase 3: Editor and Note UX

- [x] Integrate `10tap-editor` with JSON load/save (with fallback path).
- [x] Add debounce autosave behavior (~1s) similar to desktop.
- [x] Ensure note updates include `lastEditedBy` and timestamps.
- [x] Build screens/components:
  - [x] Notes list with pinned sorting + updated date
  - [x] Search bar
  - [x] Note editor screen
  - [x] Empty state
  - [x] Pin/unpin + delete actions (permission-guarded)

## Phase 4: User management and assignment parity

- [x] Port `allowedUsers` CRUD:
  - [x] list users
  - [x] add user
  - [x] remove user
  - [x] update role
- [x] Build user management UI (role-aware).
- [x] Build note assignment UI to control `assignedTo` emails.
- [x] Match desktop permission behavior:
  - [x] Superadmin full
  - [x] Admin scoped management
  - [x] User limited access

## Phase 5: Styling and theme parity

- [x] Port desktop color tokens and theme variants into RN theme constants (subset focused on current screens).
- [x] Implement same visual language (glass/minimal tones) adapted for touch/mobile layout.
- [x] Apply consistent typography, spacing, cards, buttons, and states.

## Phase 6: Native platform integration

- [ ] Android:
  - [ ] Place `google-services.json`
  - [ ] Validate runtime config for Google sign-in
- [ ] iOS:
  - [ ] Add `GoogleService-Info.plist`
  - [ ] Configure URL schemes in `Info.plist`
  - [ ] Run `bundle exec pod install`
- [ ] Validate sign-in flow on both platforms.

## Phase 7: QA and compatibility hardening

- [ ] Validate shared-note workflows desktop <-> mobile:
  - [ ] Create/edit on mobile, open on desktop
  - [ ] Create/edit on desktop, open on mobile
  - [ ] Rich text node/mark preservation tests
- [ ] Permission checks by role and unauthorized user.
- [ ] Realtime updates, offline reconnect behavior, and error states.
- [ ] Basic smoke test checklist documented in repo.

## Deliverables

- Mobile app code in `React-Native/` with feature parity focus.
- Env template for Firebase + superadmin.
- Setup doc for Android/iOS Google sign-in files.
- Known limitations doc if any editor feature differs from desktop.

## Proposed Working Order (next session)

1. Phase 0 + Phase 1 (foundation/auth)
2. Phase 2 (notes Firestore layer)
3. Phase 3 (editor + notes UX)
4. Phase 4 (user management + assignment)
5. Phase 5/6 (styling + native setup)
6. Phase 7 (QA + docs)

## Resume Commands

Run from project root:

```bash
cd React-Native
npm install
npm run start
```

Platform run commands:

```bash
npm run android
npm run ios
```

## Notes for Next Session

- First verify current package versions for RN `0.84.0` compatibility before adding editor/auth libraries.
- If `10tap-editor` has compatibility gaps with current RN version, evaluate fallback editor that still preserves JSON content safely.
- Keep all writes backward-compatible with existing Electron `notes.content` documents.
