// src/services/groups.ts
import {
    addDoc, collection, doc, getDoc,
    serverTimestamp, setDoc,
} from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, db, ensureAnonSession, waitForAuthUser } from '../utils/firebase';
import { colGroups, colMembers, genJoinCode, pathMember } from './firestorepaths';

type CreateGroupInput = { nombre: string; descripcion?: string };

// Crear grupo con joinCode + mapping público
export async function createGroup(input: CreateGroupInput) {
    const u = auth.currentUser ?? (await waitForAuthUser());
    if (u.isAnonymous) throw new Error('Necesitas cuenta para crear grupo.');

    // Generar código y asegurar que no colisione en /joinCodes/{code}
    let code = genJoinCode();
    for (let i = 0; i < 5; i++) {
        const codeDoc = await getDoc(doc(db, 'joinCodes', code));
        if (!codeDoc.exists()) break; // libre
        code = genJoinCode();         // colisionó, reintenta
    }

    // Crear doc del grupo
    const groupRef = await addDoc(collection(db, colGroups), {
        nombre: (input.nombre ?? '').trim(),
        descripcion: (input.descripcion ?? '').trim(),
        creatorId: u.uid,
        adminIds: [u.uid],
        everyoneIsAdmin: false,
        joinCode: code,
        membersCount: 1,           // ok al crear (eres creator)
        createdAt: serverTimestamp(),
    });

    // Crear membresía del creador
    await setDoc(doc(db, pathMember(groupRef.id, u.uid)), {
        role: 'admin',
        joinedAt: serverTimestamp(),
    });

    // Mapping público para resolver joinCode -> groupId
    await setDoc(doc(db, 'joinCodes', code), {
        groupId: groupRef.id,
        creatorId: u.uid,
        createdAt: serverTimestamp(),
    });

    await AsyncStorage.setItem('grupoSeleccionadoId', groupRef.id);
    return { id: groupRef.id, joinCode: code };
}

// Unirse por código usando /joinCodes/{code} (SIN tocar el doc del grupo
export async function joinGroupByCode(code: string) {
    const u = auth.currentUser ?? (await ensureAnonSession());

    const normalized = (code ?? '').toUpperCase().trim();
    if (!normalized) throw new Error('Código inválido.');

    // 1) Resolver código público -> groupId
    const codeSnap = await getDoc(doc(db, 'joinCodes', normalized));
    if (!codeSnap.exists()) throw new Error('Código inválido.');
    const groupId = (codeSnap.data() as any).groupId as string;

    // 2) Crear/mergear TU membresía (permitido por rules si userId == uid)
    const memberRef = doc(db, `${colGroups}/${groupId}/${colMembers}/${u.uid}`);
    await setDoc(memberRef, { role: 'alumno', joinedAt: serverTimestamp() }, { merge: true });

    // 3) Guardar selección local
    await AsyncStorage.setItem('grupoSeleccionadoId', groupId);
    return { id: groupId };
}