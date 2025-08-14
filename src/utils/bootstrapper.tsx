// src/app/Bootstrapper.tsx
import React, { useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ensureAnonSession } from '../utils/firebase';
import { loadGroupFromCache, subscribeGroup } from '../services/sync';
import { useAppStore } from '../store/useAppStore';

export default function Bootstrapper() {
    const unsubRef = useRef<null | (() => void)>(null);
    const setGrupoSeleccionadoId = useAppStore(s => s.setGrupoSeleccionadoId);
    const grupoId = useAppStore(s => s.grupoSeleccionadoId);

    // Arranque: sesión + restaurar grupo guardado + cache + primera suscripción
    useEffect(() => {
        (async () => {
            await ensureAnonSession();

            const saved = await AsyncStorage.getItem('grupoSeleccionadoId');
            if (saved) {
                setGrupoSeleccionadoId(saved);
                await loadGroupFromCache(saved);
                unsubRef.current = subscribeGroup(saved);
            }
        })();

        return () => { if (unsubRef.current) unsubRef.current(); };
    }, []);

    // Si el grupo activo cambia en runtime (ej. te unes o creas uno), re-suscribe
    useEffect(() => {
        if (!grupoId) return;
        // corta suscripción previa
        if (unsubRef.current) unsubRef.current();
        // nueva suscripción
        unsubRef.current = subscribeGroup(grupoId);
        return () => { if (unsubRef.current) unsubRef.current(); };
    }, [grupoId]);

    return null; // no renderiza UI
}