import 'react-native-get-random-values';
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import {
    initializeAuth,
    getAuth,
    type Auth,
    getReactNativePersistence,
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    getFirestore,
    initializeFirestore,   // 👈 importa esto
    type Firestore,
} from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyCcXam23UrzkhHKQ1KxqTkWt0UNG3rXSpo",
    authDomain: "grupos-63938.firebaseapp.com",
    projectId: "grupos-63938",
    storageBucket: "grupos-63938.firebasestorage.app",
    messagingSenderId: "230996510891",
    appId: "1:230996510891:web:0a5c03c13ccc15f84ccfee",
    measurementId: "G-P7YQS219SF"
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

if (!getApps().length) {
    app = initializeApp(firebaseConfig);

    // Auth con persistencia en React Native
    auth = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage),
    });

    // 🔧 Firestore en RN: fuerza long‑polling y evita streams fetch
    db = initializeFirestore(app, {
        experimentalForceLongPolling: true,
    });
} else {
    app = getApp();
    auth = getAuth(app);
    db = getFirestore(app);
}

const storage: FirebaseStorage = getStorage(app);

export { app, auth, db, storage };