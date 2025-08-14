// src/screens/AuthPanel.tsx
import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, StyleSheet
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth } from '../../utils/firebase';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    updateProfile,
    linkWithCredential,
    EmailAuthProvider,
    sendPasswordResetEmail,
} from 'firebase/auth';
import { useAuthUser } from '../../hooks/useauthuser';

export default function AuthPanel() {
    const user = useAuthUser();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [displayName, setDisplayName] = useState('');
    const [loading, setLoading] = useState(false);

    const isAnon = !!user?.isAnonymous;
    const currentLabel = user ? (user.email ?? '(anónimo)') : '—';

    async function handleSignUpOrUpgrade() {
        if (!email.trim() || !password) {
            Alert.alert('Faltan datos', 'Escribe tu email y contraseña.');
            return;
        }
        setLoading(true);
        try {
            if (auth.currentUser?.isAnonymous) {
                // ✅ Upgrade conservando UID
                const cred = EmailAuthProvider.credential(email.trim(), password);
                const { user } = await linkWithCredential(auth.currentUser, cred);
                if (displayName.trim()) await updateProfile(user, { displayName: displayName.trim() });
                Alert.alert('Listo ✅', 'Tu sesión anónima ahora es una cuenta con email.');
            } else {
                // Registro normal
                const { user } = await createUserWithEmailAndPassword(auth, email.trim(), password);
                if (displayName.trim()) await updateProfile(user, { displayName: displayName.trim() });
                Alert.alert('Cuenta creada ✅', user.email ?? '');
            }
        } catch (e: any) {
            Alert.alert('Error', mapAuthError(String(e?.message ?? e)));
        } finally {
            setLoading(false);
        }
    }

    async function handleSignIn() {
        if (!email.trim() || !password) {
            Alert.alert('Faltan datos', 'Escribe tu email y contraseña.');
            return;
        }
        setLoading(true);
        try {
            const { user } = await signInWithEmailAndPassword(auth, email.trim(), password);
            Alert.alert('Sesión iniciada ✅', user.email ?? '');
        } catch (e: any) {
            Alert.alert('Error', mapAuthError(String(e?.message ?? e)));
        } finally {
            setLoading(false);
        }
    }

    async function handleSignOut() {
        setLoading(true);
        try {
            await signOut(auth);
            Alert.alert('Sesión cerrada 🔒');
        } catch (e: any) {
            Alert.alert('Error', String(e?.message ?? e));
        } finally {
            setLoading(false);
        }
    }

    async function handleResetPassword() {
        if (!email.trim()) {
            Alert.alert('Falta email', 'Escribe tu email para enviar el correo de recuperación.');
            return;
        }
        setLoading(true);
        try {
            await sendPasswordResetEmail(auth, email.trim());
            Alert.alert('Correo enviado 📩', 'Revisa tu bandeja para restablecer tu contraseña.');
        } catch (e: any) {
            Alert.alert('Error', mapAuthError(String(e?.message ?? e)));
        } finally {
            setLoading(false);
        }
    }

    return (
        <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
            <View style={styles.container}>
                <Text style={styles.title}>Autenticación</Text>

                <View style={styles.card}>
                    <Row label="Usuario actual" value={currentLabel} />
                    <Row label="Tipo" value={isAnon ? 'Anónimo' : 'Email/Password'} />
                </View>

                <View style={styles.card}>
                    <Text style={styles.label}>Nombre a mostrar (opcional)</Text>
                    <TextInput
                        value={displayName}
                        onChangeText={setDisplayName}
                        placeholder="Tu nombre"
                        style={styles.input}
                        autoCapitalize="words"
                    />

                    <Text style={styles.label}>Email</Text>
                    <TextInput
                        autoCapitalize="none"
                        keyboardType="email-address"
                        value={email}
                        onChangeText={setEmail}
                        placeholder="email@example.com"
                        style={styles.input}
                    />

                    <Text style={styles.label}>Contraseña</Text>
                    <View style={styles.passRow}>
                        <TextInput
                            secureTextEntry={!showPass}
                            value={password}
                            onChangeText={setPassword}
                            placeholder="••••••••"
                            style={[styles.input, { flex: 1 }]}
                        />
                        <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPass(v => !v)}>
                            <Text style={styles.eyeText}>{showPass ? 'Ocultar' : 'Mostrar'}</Text>
                        </TouchableOpacity>
                    </View>

                    {loading && <ActivityIndicator style={{ marginVertical: 8 }} />}

                    <TouchableOpacity
                        style={[styles.btn, styles.primary, loading && styles.disabled]}
                        onPress={handleSignUpOrUpgrade}
                        disabled={loading}
                    >
                        <Text style={styles.btnText}>
                            {isAnon ? 'Upgrade (conservar UID)' : 'Crear cuenta'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.btn, styles.dark, loading && styles.disabled]}
                        onPress={handleSignIn}
                        disabled={loading}
                    >
                        <Text style={styles.btnText}>Iniciar sesión</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.btn, styles.light, loading && styles.disabled]}
                        onPress={handleSignOut}
                        disabled={loading || !user}
                    >
                        <Text style={[styles.btnText, { color: '#1C1C1E' }]}>Cerrar sesión</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.linkBtn]}
                        onPress={handleResetPassword}
                        disabled={loading}
                    >
                        <Text style={styles.linkText}>¿Olvidaste tu contraseña?</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

function Row({ label, value }: { label: string; value: string }) {
    return (
        <View style={styles.row}>
            <Text style={styles.rowLabel}>{label}</Text>
            <Text style={styles.rowValue} numberOfLines={2}>{value}</Text>
        </View>
    );
}

function mapAuthError(msg: string) {
    if (msg.includes('auth/email-already-in-use')) return 'Ese correo ya está en uso.';
    if (msg.includes('auth/invalid-email')) return 'Correo inválido.';
    if (msg.includes('auth/weak-password')) return 'La contraseña es muy débil.';
    if (msg.includes('auth/user-not-found')) return 'Usuario no encontrado.';
    if (msg.includes('auth/wrong-password')) return 'Contraseña incorrecta.';
    if (msg.includes('auth/network-request-failed')) return 'Sin conexión o red inestable.';
    if (msg.includes('auth/too-many-requests')) return 'Demasiados intentos, intenta más tarde.';
    return msg;
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#fff' },
    container: { padding: 16, gap: 12 },
    title: { fontSize: 22, fontWeight: '800', color: '#1C1C1E' },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 12,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: '#eaeaea',
        shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 3 },
        gap: 8,
    },
    label: { fontSize: 14, color: '#555', marginTop: 6 },
    input: { borderWidth: 1, borderColor: '#E5E5EA', padding: 10, borderRadius: 8 },
    passRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    eyeBtn: { paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8, backgroundColor: '#F2F2F7' },
    eyeText: { fontWeight: '600', color: '#1C1C1E' },
    btn: { paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginTop: 8 },
    primary: { backgroundColor: '#4A90E2' },
    dark: { backgroundColor: '#1C1C1E' },
    light: { backgroundColor: '#F2F2F7' },
    btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
    disabled: { opacity: 0.6 },
    linkBtn: { alignSelf: 'center', marginTop: 6 },
    linkText: { color: '#4A90E2', fontWeight: '600' },

    row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
    rowLabel: { color: '#555', fontSize: 14 },
    rowValue: { color: '#111', fontSize: 14, maxWidth: '60%', textAlign: 'right' },
});