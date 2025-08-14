// src/services/debugTests.ts
import { db } from '../utils/firebase';
import { addDoc, collection, onSnapshot } from 'firebase/firestore';

export async function saveTestData() {
    await addDoc(collection(db, 'debugTests'), {
        mensaje: 'Hola Firebase',
        fecha: new Date(),
    });
    console.log('Documento guardado!');
}

export function listenTestData() {
    // devuelve la función para desuscribirse
    return onSnapshot(collection(db, 'debugTests'), (snapshot) => {
        snapshot.forEach((doc) => {
            console.log('Doc:', doc.id, doc.data());
        });
    });
}
