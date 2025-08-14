// src/components/menu/CreateGroupModal.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    Modal, View, Text, TextInput, TouchableOpacity, ActivityIndicator,
    Alert, StyleSheet, KeyboardAvoidingView, Platform, ScrollView,
    Pressable, BackHandler
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { onCreateGroup } from '../../actions/actions';
import { useAuthUser } from '../../hooks/useauthuser';

type Props = { visible: boolean; onClose: () => void };

export default function CreateGroupModal({ visible, onClose }: Props) {
    const user = useAuthUser();
    const isAnon = !!user?.isAnonymous;

    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const insets = useSafeAreaInsets();
    const nameRef = useRef<TextInput>(null);
    const emailRef = useRef<TextInput>(null);
    const passRef = useRef<TextInput>(null);
    const descRef = useRef<TextInput>(null);

    const canDismiss = useMemo(() => visible && !loading, [visible, loading]);

    // Android back button handling
    useEffect(() => {
        if (!visible) return;
        const sub = BackHandler.addEventListener('hardwareBackPress', () => {
            if (canDismiss) onClose();
            return true; // prevent default
        });
        return () => sub.remove();
    }, [visible, canDismiss, onClose]);

    // Autofocus primer input cuando abre
    useEffect(() => {
        if (!visible) return;
        const t = setTimeout(() => {
            nameRef.current?.focus();
        }, 250);
        return () => clearTimeout(t);
    }, [visible]);

    function tryClose() {
        if (!canDismiss) return;
        onClose();
    }

    async function handleCreate() {
        if (!nombre.trim()) {
            Alert.alert('Faltan datos', 'El nombre del grupo es obligatorio.');
            nameRef.current?.focus();
            return;
        }
        if (isAnon && (!email.trim() || !password)) {
            Alert.alert('Faltan datos', 'Email y contraseña son obligatorios para crear grupo.');
            if (!email.trim()) emailRef.current?.focus();
            else passRef.current?.focus();
            return;
        }
        setLoading(true);
        try {
            const joinCode = await onCreateGroup(
                nombre.trim(),
                descripcion.trim(),
                isAnon ? email.trim() : '',
                isAnon ? password : ''
            );
            Alert.alert('Grupo creado 🎉', `Código para unirse: ${joinCode}`);
            onClose();
            setNombre(''); setDescripcion(''); setEmail(''); setPassword('');
        } catch (e: any) {
            const msg = String(e?.message ?? e);
            let friendly = 'No se pudo crear el grupo.';
            if (msg.includes('auth/email-already-in-use')) friendly = 'Ese correo ya está en uso.';
            else if (msg.includes('auth/invalid-email')) friendly = 'Correo inválido.';
            else if (msg.includes('auth/weak-password')) friendly = 'La contraseña es muy débil.';
            else if (msg.includes('missing') || msg.includes('insufficient')) friendly = 'Permisos insuficientes. Revisa las reglas o tu sesión.';
            Alert.alert('Error', friendly);
        } finally {
            setLoading(false);
        }
    }

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            statusBarTranslucent
            onRequestClose={tryClose}
            presentationStyle="overFullScreen"
        >
            {/* Backdrop que cierra */}
            <Pressable
                style={styles.backdrop}
                onPress={tryClose}
                disabled={!canDismiss}
                accessibilityRole="button"
                accessibilityLabel="Cerrar modal"
            >
                {/* Evitar que pulsaciones dentro del card cierren */}
                <Pressable style={{ width: '100%' }} onPress={() => { }} >
                    <KeyboardAvoidingView
                        behavior={Platform.select({ ios: 'padding', android: 'height' })}
                        keyboardVerticalOffset={Platform.select({ ios: Math.max(0, insets.top) + 12, android: 0 })}
                        style={{ width: '100%' }}
                    >
                        <View style={[styles.card, { paddingBottom: Math.max(12, insets.bottom + 12) }]}>
                            <View style={styles.header}>
                                <View style={styles.grabber} />
                                <TouchableOpacity
                                    onPress={tryClose}
                                    accessibilityRole="button"
                                    accessibilityLabel="Cerrar"
                                    style={styles.closeBtn}
                                    disabled={!canDismiss}
                                >
                                    <Text style={styles.closeIcon}>✕</Text>
                                </TouchableOpacity>
                            </View>

                            <ScrollView
                                bounces={false}
                                showsVerticalScrollIndicator={false}
                                keyboardShouldPersistTaps="handled"
                                contentContainerStyle={styles.content}
                            >
                                <Text style={styles.title}>Crear grupo</Text>

                                <Text style={styles.label}>Nombre</Text>
                                <TextInput
                                    ref={nameRef}
                                    style={styles.input}
                                    value={nombre}
                                    onChangeText={setNombre}
                                    placeholder="Mi grupo"
                                    returnKeyType="next"
                                    onSubmitEditing={() => descRef.current?.focus()}
                                />

                                <Text style={styles.label}>Descripción (opcional)</Text>
                                <TextInput
                                    ref={descRef}
                                    style={[styles.input, { minHeight: 44 }]}
                                    value={descripcion}
                                    onChangeText={setDescripcion}
                                    placeholder="Descripción"
                                    returnKeyType={isAnon ? 'next' : 'done'}
                                    onSubmitEditing={() => (isAnon ? emailRef.current?.focus() : handleCreate())}
                                />

                                {isAnon && (
                                    <>
                                        <Text style={[styles.sectionTitle]}>Tu cuenta</Text>

                                        <Text style={styles.label}>Email</Text>
                                        <TextInput
                                            ref={emailRef}
                                            style={styles.input}
                                            autoCapitalize="none"
                                            keyboardType="email-address"
                                            value={email}
                                            onChangeText={setEmail}
                                            placeholder="email@example.com"
                                            returnKeyType="next"
                                            onSubmitEditing={() => passRef.current?.focus()}
                                        />

                                        <Text style={styles.label}>Contraseña</Text>
                                        <TextInput
                                            ref={passRef}
                                            style={styles.input}
                                            secureTextEntry
                                            value={password}
                                            onChangeText={setPassword}
                                            placeholder="••••••••"
                                            returnKeyType="done"
                                            onSubmitEditing={handleCreate}
                                        />
                                    </>
                                )}

                                <View style={styles.row}>
                                    <TouchableOpacity
                                        style={[styles.btn, styles.cancel]}
                                        onPress={tryClose}
                                        disabled={!canDismiss}
                                    >
                                        <Text style={styles.btnText}>Cancelar</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.btn, styles.primary, loading && { opacity: 0.7 }]}
                                        onPress={handleCreate}
                                        disabled={loading}
                                    >
                                        {loading
                                            ? <ActivityIndicator color="#fff" />
                                            : <Text style={[styles.btnText, { color: '#fff' }]}>Crear</Text>}
                                    </TouchableOpacity>
                                </View>
                            </ScrollView>
                        </View>
                    </KeyboardAvoidingView>
                </Pressable>
            </Pressable>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
    card: {
        alignSelf: 'stretch',
        maxHeight: '88%',
        backgroundColor: 'white',
        paddingTop: 6,
        paddingHorizontal: 16,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
    },
    header: { paddingTop: 2, paddingBottom: 4, justifyContent: 'center' },
    grabber: {
        alignSelf: 'center',
        width: 44, height: 5, borderRadius: 3,
        backgroundColor: '#D1D1D6', marginBottom: 4,
    },
    closeBtn: { position: 'absolute', right: -4, top: -2, padding: 10 },
    closeIcon: { fontSize: 18, color: '#8E8E93' },
    content: { gap: 8, paddingBottom: 8 },
    title: { fontSize: 18, fontWeight: '700', marginBottom: 6, color: '#1C1C1E' },
    sectionTitle: { marginTop: 10, fontWeight: '600', color: '#1C1C1E' },
    label: { color: '#3A3A3C' },
    input: { borderWidth: 1, borderColor: '#E5E5EA', padding: 10, borderRadius: 8, color: '#1C1C1E' },
    row: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 12 },
    btn: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 8 },
    cancel: { backgroundColor: '#F2F2F7' },
    primary: { backgroundColor: '#4A90E2' },
    btnText: { fontWeight: '600', color: '#1C1C1E' },
});