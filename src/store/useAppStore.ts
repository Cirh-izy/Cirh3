import { create } from 'zustand'
import { Grupo, Materia, Tarea, Usuario } from '../models/types'

type Member = { id: string; role: 'admin' | 'alumno'; joinedAt?: any } // para compatibilidad

interface AppState {
    // === Lo tuyo ===
    grupos: Grupo[];
    usuarioActivo?: Usuario;
    grupoSeleccionadoId: string | null;
    materiaSeleccionadaId?: string;

    setGrupoSeleccionadoId: (id: string | null) => void;
    setUsuario: (usuario: Usuario) => void;
    setGrupos: (grupos: Grupo[]) => void;
    setMateriaSeleccionada: (id: string) => void;

    addGrupo: (grupo: Grupo) => void;
    addMateria: (grupoId: string, nuevaMateria: Materia) => void;
    addTask: (materiaId: string, nuevaTarea: Tarea) => void;
    updateTask: (materiaId: string, tarea: Partial<Tarea>) => void;
    updateTaskStatus: (
        materiaId: string,
        tareaId: string,
        alumnoId: string,
        nuevoEstado: 'pendiente' | 'completada'
    ) => void;
    deleteTask: (materiaId: string, tareaId: string) => void;

    // === NUEVO: setters para snapshots de Firestore ===
    setGroupDoc: (groupId: string, doc: (Partial<Grupo> & { id: string }) | null) => void; // NEW
    setMembers: (groupId: string, members: Member[]) => void;                                   // NEW
    setMateriasFS: (groupId: string, materias: Materia[]) => void;                              // NEW (renombrada para no chocar con addMateria)

    // === NUEVO: cache (sync.ts los usa) ===
    hydrateFromCache: (groupId: string, data: { group?: Partial<Grupo> | null; members: Member[]; materias: Materia[] }) => void; // NEW
    exportGroupCache: (groupId: string) => { group?: Partial<Grupo> | null; members: Member[]; materias: Materia[] } | null;      // NEW
}

export const useAppStore = create<AppState>((set, get) => ({
    // === estado base tuyo ===
    grupos: [],
    usuarioActivo: undefined,
    grupoSeleccionadoId: null,
    materiaSeleccionadaId: undefined,

    setGrupoSeleccionadoId: (id) => set({ grupoSeleccionadoId: id }),
    setUsuario: (usuario) => set({ usuarioActivo: usuario }),
    setGrupos: (grupos) => set({ grupos }),
    setMateriaSeleccionada: (id) => set({ materiaSeleccionadaId: id }),

    addGrupo: (nuevoGrupo) => {
        const { grupos } = get()
        // si ya existe, lo reemplazamos
        const exists = grupos.some(g => g.id === nuevoGrupo.id)
        set({ grupos: exists ? grupos.map(g => g.id === nuevoGrupo.id ? nuevoGrupo : g) : [...grupos, nuevoGrupo] })
    },

    addMateria: (grupoId, nuevaMateria) => {
        const { grupos } = get()
        const grupo = grupos.find(g => g.id === grupoId)
        if (!grupo) return
        const nuevasMaterias = [...(grupo.materias || []), nuevaMateria]
        const grupoActualizado = { ...grupo, materias: nuevasMaterias }
        set({ grupos: grupos.map(g => g.id === grupoId ? grupoActualizado : g) })
    },

    addTask: (materiaId, nuevaTarea) => {
        const { grupos, grupoSeleccionadoId } = get()
        const grupo = grupos.find(g => g.id === grupoSeleccionadoId)
        if (!grupo) return
        const nuevasMaterias = (grupo.materias || []).map(m =>
            m.id === materiaId ? { ...m, tareas: [...(m.tareas || []), nuevaTarea] } : m
        )
        const nuevoGrupo = { ...grupo, materias: nuevasMaterias }
        set({ grupos: grupos.map(g => g.id === grupo.id ? nuevoGrupo : g) })
    },

    updateTask: (materiaId, tareaActualizada) => {
        const { grupos, grupoSeleccionadoId } = get()
        const grupo = grupos.find(g => g.id === grupoSeleccionadoId)
        if (!grupo) return
        const nuevasMaterias = (grupo.materias || []).map(m => {
            if (m.id !== materiaId) return m
            const nuevasTareas = (m.tareas || []).map(t =>
                t.id === tareaActualizada.id ? { ...t, ...tareaActualizada } : t
            )
            return { ...m, tareas: nuevasTareas }
        })
        set({ grupos: grupos.map(g => g.id === grupo.id ? { ...grupo, materias: nuevasMaterias } : g) })
    },

    updateTaskStatus: (materiaId, tareaId, alumnoId, nuevoEstado) => {
        const { grupos, grupoSeleccionadoId } = get()
        const grupo = grupos.find(g => g.id === grupoSeleccionadoId)
        if (!grupo) return
        const nuevasMaterias = (grupo.materias || []).map(m => {
            if (m.id !== materiaId) return m
            const nuevasTareas = (m.tareas || []).map(t => {
                if (t.id !== tareaId) return t
                const nuevasAsignaciones = (t.asignaciones || []).map(a =>
                    a.alumnoId === alumnoId ? { ...a, estado: nuevoEstado } : a
                )
                return { ...t, asignaciones: nuevasAsignaciones }
            })
            return { ...m, tareas: nuevasTareas }
        })
        set({ grupos: grupos.map(g => g.id === grupo.id ? { ...grupo, materias: nuevasMaterias } : g) })
    },

    deleteTask: (materiaId, tareaId) => {
        const { grupos, grupoSeleccionadoId } = get()
        const grupo = grupos.find(g => g.id === grupoSeleccionadoId)
        if (!grupo) return
        const nuevasMaterias = (grupo.materias || []).map(m =>
            m.id === materiaId ? { ...m, tareas: (m.tareas || []).filter(t => t.id !== tareaId) } : m
        )
        set({ grupos: grupos.map(g => g.id === grupo.id ? { ...grupo, materias: nuevasMaterias } : g) })
    },

    // ======== NUEVO: setters para snapshots de Firestore ========

    setGroupDoc: (groupId, doc) => {
        if (!doc) return; // si el grupo fue borrado podrías removerlo del array si quieres
        const { grupos } = get()
        const idx = grupos.findIndex(g => g.id === groupId)
        const base: Grupo = idx >= 0 ? grupos[idx] : {
            id: groupId,
            nombre: doc.nombre ?? '',
            descripcion: doc.descripcion ?? '',
            fechaCreacion: (doc as any).createdAt ?? new Date().toISOString(),
            materias: [],
            miembros: [],
            adminIds: (doc as any).adminIds ?? [],
        } as Grupo

        const merged: Grupo = {
            ...base,
            ...doc as any, // mezcla nombre/descripcion/etc que vengan del snapshot
            id: groupId,
        }

        const next = idx >= 0
            ? grupos.map((g, i) => i === idx ? merged : g)
            : [...grupos, merged]

        set({ grupos: next })
    },

    setMembers: (groupId, members) => {
        const { grupos } = get()
        const idx = grupos.findIndex(g => g.id === groupId)
        if (idx < 0) {
            // crea stub y asigna miembros
            const nuevo: Grupo = {
                id: groupId,
                nombre: '',
                fechaCreacion: new Date().toISOString(),
                materias: [],
                miembros: members.map(m => ({
                    id: m.id,
                    nombre: '', // si luego cargas perfil puedes rellenar
                    rol: (m.role as any) === 'admin' ? 'admin' : 'alumno',
                    grupoId: groupId,
                })) as any,
                adminIds: members.filter(m => m.role === 'admin').map(m => m.id),
            }
            set({ grupos: [...grupos, nuevo] })
            return
        }
        const grupo = grupos[idx]
        const miembros = members.map(m => ({
            id: m.id,
            nombre: '',
            rol: (m.role as any) === 'admin' ? 'admin' : 'alumno',
            grupoId: groupId,
        })) as any
        const adminIds = members.filter(m => m.role === 'admin').map(m => m.id)
        const actualizado = { ...grupo, miembros, adminIds }
        set({ grupos: grupos.map((g, i) => i === idx ? actualizado : g) })
    },

    setMateriasFS: (groupId, materias) => {
        const { grupos } = get()
        const idx = grupos.findIndex(g => g.id === groupId)
        const base: Grupo = idx >= 0 ? grupos[idx] : {
            id: groupId,
            nombre: '',
            fechaCreacion: new Date().toISOString(),
            materias: [],
            miembros: [],
            adminIds: [],
        } as Grupo

        const actualizado: Grupo = { ...base, materias }
        const next = idx >= 0
            ? grupos.map((g, i) => i === idx ? actualizado : g)
            : [...grupos, actualizado]

        set({ grupos: next })
    },

    // ======== NUEVO: cache compatible con sync.ts ========

    hydrateFromCache: (groupId, data) => {
        // data = { group, members, materias }
        // aplicamos en orden para reutilizar setters
        get().setGroupDoc(groupId, data.group ? { id: groupId, ...(data.group as any) } : { id: groupId })
        get().setMembers(groupId, data.members || [])
        get().setMateriasFS(groupId, data.materias || [])
    },

    exportGroupCache: (groupId) => {
        const { grupos } = get()
        const g = grupos.find(x => x.id === groupId)
        if (!g) return null
        return {
            group: {
                id: g.id,
                nombre: g.nombre,
                descripcion: (g as any).descripcion ?? '',
                adminIds: g.adminIds,
                // puedes agregar joinCode/everyoneIsAdmin si lo guardas en tu Grupo
            } as any,
            members: (g.miembros || []).map(m => ({
                id: m.id,
                role: (m as any).rol === 'admin' ? 'admin' : 'alumno'
            })),
            materias: g.materias || [],
        }
    },
}))