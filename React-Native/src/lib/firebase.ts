import { getApp, getApps, initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { GoogleAuthProvider, getAuth, getReactNativePersistence, initializeAuth } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  FIREBASE_API_KEY,
  FIREBASE_APP_ID,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET,
} from '@env';

const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: FIREBASE_AUTH_DOMAIN,
  projectId: FIREBASE_PROJECT_ID,
  storageBucket: FIREBASE_STORAGE_BUCKET,
  messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
  appId: FIREBASE_APP_ID,
};

const requiredFields: Array<keyof typeof firebaseConfig> = ['apiKey', 'authDomain', 'projectId', 'appId'];
const missingFields = requiredFields.filter((field) => !firebaseConfig[field]);

if (missingFields.length > 0) {
  throw new Error(`Firebase configuration error. Missing fields: ${missingFields.join(', ')}`);
}

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = (() => {
  try {
    return initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch (error) {
    // During Fast Refresh, auth may already be initialized for the app instance.
    if (error instanceof Error && error.message.includes('already-initialized')) {
      return getAuth(app);
    }

    throw error;
  }
})();

export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
