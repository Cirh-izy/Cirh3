// src/components/menu/JoinGroupModal.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    Modal, View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, StyleSheet,
    KeyboardAvoidingView, Platform, ScrollView, Pressable, BackHandler
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { onJoinByCode } from '../../actions/actions';

type Props = { visible: boolean; onClose: () => void };

export default function JoinGroupModal({ visible, onClose }: Props) {
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const insets = useSafeAreaInsets();
    const inputRef = useRef<TextInput>(null);

    const canDismiss = useMemo(() => visible && !loading, [visible, loading]);

    useEffect(() => {
        if (!visible) return;
        const sub = BackHandler.addEventListener('hardwareBackPress', () => {
            if (canDismiss) onClose();
            return true;
        });
        return () => sub.remove();
    }, [visible, canDismiss, onClose]);

    useEffect(() => {
        if (!visible) return;
        const t = setTimeout(() => inputRef.current?.focus(), 250);
        return () => clearTimeout(t);
    }, [visible]);

    function tryClose() {
        if (!canDismiss) return;
        onClose();
    }

    async function handleJoin() {
        if (!code.trim()) {
            Alert.alert('Código vacío', 'Escribe el código.');
            inputRef.current?.focus();
            return;
        }
        setLoading(true);
        try {
            await onJoinByCode(code.trim().toUpperCase());
            Alert.alert('Listo ✅', 'Te uniste al grupo.');
            onClose();
            setCode('');
        } catch (e: any) {
            const msg = String(e?.message ?? e);
            const friendly = /c(ó|o)digo inválido/i.test(msg) || /invalid/i.test(msg)
                ? 'Ese código no existe.'
                : msg;
            Alert.alert('No se pudo unir', friendly);
        } finally {
            setLoading(false);
        }
    }

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            statusBarTranslucent
            presentationStyle="overFullScreen"
            onRequestClose={tryClose}
        >
            <Pressable
                style={[styles.backdrop, { justifyContent: 'flex-start' }]}
                onPress={tryClose}
                disabled={!canDismiss}
            >
                <Pressable style={{ width: '100%' }} onPress={() => { }}>
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
                                <Text style={styles.title}>Unirme por código</Text>

                                <Text style={styles.label}>Código</Text>
                                <TextInput
                                    ref={inputRef}
                                    style={[styles.input, { letterSpacing: 2 }]}
                                    autoCapitalize="characters"
                                    value={code}
                                    onChangeText={(t) => setCode(t.toUpperCase())}
                                    placeholder="ABC123"
                                    returnKeyType="done"
                                    onSubmitEditing={handleJoin}
                                />

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
                                        onPress={handleJoin}
                                        disabled={loading}
                                    >
                                        {loading
                                            ? <ActivityIndicator color="#fff" />
                                            : <Text style={[styles.btnText, { color: '#fff' }]}>Unirme</Text>}
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
    backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' },
    card: {
        alignSelf: 'stretch',
        backgroundColor: 'white',
        padding: 16,
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
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
    label: { color: '#3A3A3C' },
    input: { borderWidth: 1, borderColor: '#E5E5EA', padding: 10, borderRadius: 8, color: '#1C1C1E' },
    row: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 12 },
    btn: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 8 },
    cancel: { backgroundColor: '#F2F2F7' },
    primary: { backgroundColor: '#1C1C1E' },
    btnText: { fontWeight: '600', color: '#1C1C1E' },
});