// src/utils/firebase.ts
import 'react-native-get-random-values';
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import {
    initializeAuth,
    getAuth,
    type Auth,
    type User,
    getReactNativePersistence,
    signInAnonymously,
    updateProfile,
    EmailAuthProvider,
    linkWithCredential,
    onAuthStateChanged,
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    initializeFirestore,
    getFirestore,
    type Firestore,
    persistentLocalCache,
    CACHE_SIZE_UNLIMITED,
} from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: 'AIzaSyCcXam23UrzkhHKQ1KxqTkWt0UNG3rXSpo',
    authDomain: 'grupos-63938.firebaseapp.com',
    projectId: 'grupos-63938',
    // ⚠️ Verifica en consola: muchos proyectos usan "<project-id>.appspot.com"
    storageBucket: 'grupos-63938.firebasestorage.app',
    messagingSenderId: '230996510891',
    appId: '1:230996510891:web:0a5c03c13ccc15f84ccfee',
    measurementId: 'G-P7YQS219SF',
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

if (!getApps().length) {
    app = initializeApp(firebaseConfig);

    // Auth con persistencia para RN
    auth = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage),
    });

    // Firestore offline + long-polling RN
    db = initializeFirestore(app, {
        localCache: persistentLocalCache({ cacheSizeBytes: CACHE_SIZE_UNLIMITED }),
        experimentalForceLongPolling: true, // no mezclar con AutoDetect
    });
} else {
    app = getApp();
    auth = getAuth(app);
    db = getFirestore(app);
}

const storage: FirebaseStorage = getStorage(app);

// ---------- Sesión ----------

// Devuelve siempre un User (crea sesión anónima si no hay)
export async function ensureAnonSession(): Promise<User> {
    if (auth.currentUser) return auth.currentUser;
    const { user } = await signInAnonymously(auth);
    return user;
}

// Espera a que Auth tenga usuario (útil en arranque para evitar carreras)
export function waitForAuthUser(timeoutMs = 4000): Promise<User> {
    return new Promise((resolve, reject) => {
        if (auth.currentUser) return resolve(auth.currentUser);
        const to = setTimeout(() => {
            unsub();
            reject(new Error('Timeout esperando sesión'));
        }, timeoutMs);
        const unsub = onAuthStateChanged(auth, (u) => {
            if (u) {
                clearTimeout(to);
                unsub();
                resolve(u);
            }
        });
    });
}

// Upgrade conservando UID (linkea credenciales al user anónimo)
export async function upgradeToEmailAccount(
    email: string,
    password: string,
    displayName?: string
) {
    const u = auth.currentUser ?? (await waitForAuthUser());
    if (!u.isAnonymous) return u; // ya es cuenta "real"

    const cred = EmailAuthProvider.credential(email.trim(), password);
    const { user } = await linkWithCredential(u, cred); // conserva el mismo UID
    if (displayName) await updateProfile(user, { displayName });
    return user;
}

export { app, auth, db, storage };
export const isAnon = () => !!auth.currentUser?.isAnonymous;