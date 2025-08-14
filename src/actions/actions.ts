// src/features/groups/actions.ts
import { ensureAnonSession, upgradeToEmailAccount } from '../utils/firebase';
import { createGroup, joinGroupByCode } from '../services/groups';
import { useAppStore } from '../store/useAppStore';

export async function onCreateGroup(nombre: string, descripcion: string, email: string, password: string) {
    // si el user es anónimo, lo “upgradeamos” a cuenta real
    const joinDisplayName = nombre?.trim() || undefined;
    await upgradeToEmailAccount(email.trim(), password, joinDisplayName);
    const { id, joinCode } = await createGroup({ nombre: nombre.trim(), descripcion: (descripcion ?? '').trim() });
    useAppStore.getState().setGrupoSeleccionadoId(id); // Bootstrapper re-suscribe
    return joinCode; // muéstralo en UI
}
export async function onJoinByCode(code: string) {
    await ensureAnonSession(); // extra seguro
    const { id } = await joinGroupByCode(code.trim().toUpperCase());
    useAppStore.getState().setGrupoSeleccionadoId(id);
    return id;
}