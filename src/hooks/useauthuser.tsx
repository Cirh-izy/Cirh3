// src/hooks/useAuthUser.ts
import { useEffect, useState } from 'react';
import { auth } from '../utils/firebase';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { useAppStore } from '../store/useAppStore';

export function useAuthUser(): User | null {
    const [user, setUser] = useState<User | null>(auth.currentUser ?? null);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (u) => {
            setUser(u);

            // 👇 Si quieres reflejar el usuario en tu store (útil para tu UI actual)
            const setUsuario = (useAppStore.getState() as any).setUsuario;
            if (typeof setUsuario === 'function') {
                if (u) {
                    setUsuario({
                        id: u.uid,
                        nombre: u.displayName ?? '',
                        correo: u.email ?? undefined,
                        fotoUrl: u.photoURL ?? undefined,
                        grupoId: useAppStore.getState().grupoSeleccionadoId ?? '',
                        rol: 'alumno', // el rol real lo decides leyendo /members/{uid}
                    });
                } else {
                    setUsuario(undefined as any);
                }
            }
        });
        return unsub;
    }, []);

    return user;
}