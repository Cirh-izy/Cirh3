import { onSnapshot, doc, collection } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../utils/firebase';
import { pathGroup, pathMaterias, colMembers } from './firestorepaths';
import { useAppStore } from '../store/useAppStore';

const cacheKey = (groupId: string) => `group-cache:${groupId}`;

export async function loadGroupFromCache(groupId: string) {
    const raw = await AsyncStorage.getItem(cacheKey(groupId));
    if (!raw) return;
    try {
        const data = JSON.parse(raw);
        useAppStore.getState().hydrateFromCache(groupId, data);
    } catch { }
}

async function saveCache(groupId: string) {
    const data = useAppStore.getState().exportGroupCache(groupId);
    if (data) await AsyncStorage.setItem(cacheKey(groupId), JSON.stringify(data));
}

export function subscribeGroup(groupId: string) {
    const unsubs: Array<() => void> = [];
    const set = useAppStore.getState();

    // grupo
    unsubs.push(onSnapshot(doc(db, pathGroup(groupId)), (snap) => {
        set.setGroupDoc(groupId, snap.exists() ? ({ id: snap.id, ...snap.data() } as any) : null);
        saveCache(groupId);
    }));

    // miembros
    unsubs.push(onSnapshot(collection(db, `${pathGroup(groupId)}/${colMembers}`), (qs) => {
        const members = qs.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
        set.setMembers(groupId, members as any);
        saveCache(groupId);
    }));

    // materias
    unsubs.push(onSnapshot(collection(db, pathMaterias(groupId)), (qs) => {
        const materias = qs.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
        useAppStore.getState().setMateriasFS(groupId, materias as any); // <- aquí
        saveCache(groupId);
    }));

    return () => unsubs.forEach((u) => u());
}