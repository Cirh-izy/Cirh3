import firestore from '@react-native-firebase/firestore';

// Guardar dato de prueba
export async function saveTestData() {
    await firestore().collection('debugTests').add({
        mensaje: 'Hola Firebase',
        fecha: new Date()
    });
    console.log('Documento guardado!');
}

// Leer datos de prueba
export function listenTestData() {
    return firestore().collection('debugTests').onSnapshot(snapshot => {
        snapshot.forEach(doc => {
            console.log('Doc:', doc.id, doc.data());
        });
    });
}