# TMX Notes Mobile Setup

This app reuses the same Firebase backend and Firestore collections as desktop (`notes`, `allowedUsers`).

## 1. Install dependencies

```bash
cd React-Native
npm install
```

## 2. Configure environment variables

```bash
cp .env.example .env
```

Fill `.env`:

```env
FIREBASE_API_KEY=...
FIREBASE_AUTH_DOMAIN=...
FIREBASE_PROJECT_ID=...
FIREBASE_STORAGE_BUCKET=...
FIREBASE_MESSAGING_SENDER_ID=...
FIREBASE_APP_ID=...
SUPERADMIN_EMAIL=manishnaruka123@gmail.com
GOOGLE_WEB_CLIENT_ID=...
```

`GOOGLE_WEB_CLIENT_ID` should be your Firebase Web client ID.

## 3. Add Firebase native files

### Android

- Put `google-services.json` at:
  - `android/app/google-services.json`

### iOS

- Add `GoogleService-Info.plist` to:
  - `ios/TMXNotes/GoogleService-Info.plist`
- Ensure URL scheme from that plist is added in `Info.plist`.

## 4. iOS pods

```bash
cd ios
bundle exec pod install
cd ..
```

## 5. Start metro and run app

```bash
npm start
npm run android
npm run ios
```

## Notes

- Google sign-in is implemented with `@react-native-google-signin/google-signin` + Firebase Auth.
- Rich text editor target is `@10play/tentap-editor` with a plain text fallback editor if package/runtime integration is incomplete.
- Mobile keeps desktop-compatible note fields (`content`, `plainTextPreview`, `assignedTo`, `isPinned`, role-based visibility).
