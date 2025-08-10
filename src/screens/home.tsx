import React, { useState } from 'react';
import { View, Text, Button, Alert } from 'react-native';
// 👇 ajusta la ruta según dónde esté firebase.ts
import { auth, db } from '../utils/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { addDoc, collection, getDocs } from 'firebase/firestore';

export default function FirebaseHealthCheck() {
    const [loading, setLoading] = useState(false);

    const checkAuth = async () => {
        setLoading(true);
        try {
            const email = `test${Date.now()}@example.com`;
            await createUserWithEmailAndPassword(auth, email, '12345678');
            Alert.alert('✅ Auth OK', `Usuario creado: ${email}`);
        } catch (e: any) {
            Alert.alert('❌ Auth', e.message);
        } finally {
            setLoading(false);
        }
    };

    const checkFirestore = async () => {
        setLoading(true);
        try {
            await addDoc(collection(db, 'health'), { ping: Date.now() });
            const qs = await getDocs(collection(db, 'health'));
            Alert.alert('✅ Firestore OK', `Docs en 'health': ${qs.size}`);
        } catch (e: any) {
            Alert.alert('❌ Firestore', e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={{ flex: 1, gap: 16, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: 18, fontWeight: '700' }}>Firebase Health Check</Text>
            <Button title="Probar Auth" onPress={checkAuth} disabled={loading} />
            <Button title="Probar Firestore" onPress={checkFirestore} disabled={loading} />
        </View>
    );
}