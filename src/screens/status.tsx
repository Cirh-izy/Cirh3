// StatusScreen.tsx (solo los cambios clave)
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, Button, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { onSnapshot, doc } from 'firebase/firestore';
import { auth, db, ensureAnonSession } from '../utils/firebase';
import { useAuthUser } from '../hooks/useauthuser';

function providerLabel(user: ReturnType<typeof useAuthUser>) {
    if (!user) return '—';
    if (user.isAnonymous) return 'anonymous';
    const p = user.providerData?.[0]?.providerId;
    return p || 'password';
}

export default function StatusScreen() {
    const [booting, setBooting] = useState(true);
    const [gid, setGid] = useState<string | null>(null);
    const [tick, setTick] = useState(0);
    const user = useAuthUser(); // 👈 ahora este cambia en vivo

    // estados de grupo/miembro
    const [group, setGroup] = useState<any>(null);
    const [member, setMember] = useState<any>(null);
    const [loadingGroup, setLoadingGroup] = useState(false);
    const [loadingMember, setLoadingMember] = useState(false);

    const isSignedIn = !!user;
    const isAnonymous = !!user?.isAnonymous;
    const email = user?.email ?? '—';
    const uid = user?.uid ?? '—';
    const provider = providerLabel(user);

    const everyoneIsAdmin = !!group?.everyoneIsAdmin;
    const adminIds: string[] = group?.adminIds ?? [];
    const isCreator = !!(group && user && group.creatorId === user.uid);
    const isAdminEffective = !!(user && (everyoneIsAdmin || adminIds.includes(user.uid)));
    const role = member?.role ?? '—';

    // boot
    useEffect(() => {
        (async () => {
            await ensureAnonSession();
            const saved = await AsyncStorage.getItem('grupoSeleccionadoId');
            setGid(saved ?? null);
            setBooting(false);
        })();
    }, [tick]);

    // group sub
    useEffect(() => {
        if (!gid) { setGroup(null); return; }
        setLoadingGroup(true);
        const unsub = onSnapshot(doc(db, 'groups', gid), (snap) => {
            setGroup(snap.exists() ? { id: snap.id, ...snap.data() } : null);
            setLoadingGroup(false);
        }, () => setLoadingGroup(false));
        return unsub;
    }, [gid]);

    // member sub (depende del uid actual)
    useEffect(() => {
        if (!gid || !user) { setMember(null); return; }
        setLoadingMember(true);
        const unsub = onSnapshot(doc(db, `groups/${gid}/members/${user.uid}`), (snap) => {
            setMember(snap.exists() ? { id: snap.id, ...snap.data() } : null);
            setLoadingMember(false);
        }, () => setLoadingMember(false));
        return unsub;
    }, [gid, user?.uid]); // 👈 ahora se reactualiza cuando cambie el usuario

    const refresh = () => setTick(x => x + 1);

    if (booting) {
        return (
            <View style={styles.center}>
                <ActivityIndicator />
                <Text style={styles.muted}>Inicializando sesión…</Text>
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Estado de Sesión y Grupo</Text>

            <Section title="Usuario">
                <Row label="isSignedIn" value={String(isSignedIn)} />
                <Row label="isAnonymous" value={String(isAnonymous)} />
                <Row label="uid" value={uid} mono />
                <Row label="email" value={email} />
                <Row label="provider" value={provider} />
            </Section>

            <Section title="Selección de Grupo">
                <Row label="grupoSeleccionadoId" value={gid ?? '—'} mono />
                <View style={{ marginTop: 8 }}>
                    <Button title="Refrescar selección" onPress={refresh} />
                </View>
            </Section>

            <Section title="Grupo (Firestore)">
                {loadingGroup ? <ActivityIndicator /> : null}
                <Row label="Existe" value={String(!!group)} />
                <Row label="nombre" value={group?.nombre ?? '—'} />
                <Row label="creatorId" value={group?.creatorId ?? '—'} mono />
                <Row label="joinCode" value={group?.joinCode ?? '—'} mono />
                <Row label="everyoneIsAdmin" value={String(everyoneIsAdmin)} />
                <Row label="adminIds" value={(adminIds.length ? adminIds.join(', ') : '—')} small mono />
            </Section>

            <Section title="Membresía">
                {loadingMember ? <ActivityIndicator /> : null}
                <Row label="isMember" value={String(!!member)} />
                <Row label="role" value={role} />
                <Row label="isCreator" value={String(isCreator)} />
                <Row label="isAdminEffective" value={String(isAdminEffective)} />
            </Section>

            <View style={{ height: 24 }} />
        </ScrollView>
    );
}

function Section({ title, children }: { title: string; children: React.ReactNode; }) {
    return (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>{title}</Text>
            <View style={styles.card}>{children}</View>
        </View>
    );
}

function Row({ label, value, mono, small }: { label: string; value: string; mono?: boolean; small?: boolean }) {
    return (
        <View style={styles.row}>
            <Text style={styles.label}>{label}</Text>
            <Text style={[styles.value, mono && styles.mono, small && styles.small]} numberOfLines={3}>
                {value}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { padding: 16 },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },
    title: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
    section: { marginBottom: 16 },
    sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 12,
        shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 3 },
        borderWidth: StyleSheet.hairlineWidth, borderColor: '#eaeaea',
    },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingVertical: 6 },
    label: { fontSize: 14, color: '#555', marginRight: 12, flex: 0.7 },
    value: { fontSize: 14, color: '#111', flex: 1.3, textAlign: 'right' },
    mono: { fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }) as any },
    small: { fontSize: 12 },
    muted: { color: '#666', marginTop: 8 },
});