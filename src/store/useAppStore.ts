import { create } from 'zustand'
import { Grupo, Materia, Tarea, Usuario } from '../models/types'

interface AppState {
    addGrupo: (grupo: Grupo) => void
    grupoSeleccionadoId: string | null;
    setGrupoSeleccionadoId: (id: string) => void;
    grupos: Grupo[];
    usuarioActivo?: Usuario;
    materiaSeleccionadaId?: string;
    setUsuario: (usuario: Usuario) => void;
    setGrupos: (grupos: Grupo[]) => void;
    setMateriaSeleccionada: (id: string) => void;
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
}

export const useAppStore = create<AppState>((set, get) => ({
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
        set({ grupos: [...grupos, nuevoGrupo] })
    },

    addMateria: (grupoId, nuevaMateria) => {
        const { grupos } = get()
        const grupo = grupos.find(g => g.id === grupoId)
        if (!grupo) return

        const nuevasMaterias = [...(grupo.materias || []), nuevaMateria]
        const grupoActualizado = { ...grupo, materias: nuevasMaterias }

        set({
            grupos: grupos.map(g => g.id === grupoId ? grupoActualizado : g)
        })
    },

    addTask: (materiaId, nuevaTarea) => {
        const { grupos, grupoSeleccionadoId } = get()
        const grupo = grupos.find(g => g.id === grupoSeleccionadoId)
        if (!grupo) return

        const nuevasMaterias = grupo.materias.map(m =>
            m.id === materiaId
                ? { ...m, tareas: [...m.tareas, nuevaTarea] }
                : m
        )

        const nuevoGrupo = { ...grupo, materias: nuevasMaterias }

        set({
            grupos: grupos.map(g => g.id === grupo.id ? nuevoGrupo : g)
        })
    },
    updateTask: (materiaId, tareaActualizada) => {
        const { grupos, grupoSeleccionadoId } = get()
        const grupo = grupos.find(g => g.id === grupoSeleccionadoId)
        if (!grupo) return

        const nuevasMaterias = grupo.materias.map(m => {
            if (m.id !== materiaId) return m

            const nuevasTareas = m.tareas.map(t =>
                t.id === tareaActualizada.id ? { ...t, ...tareaActualizada } : t
            )
            return { ...m, tareas: nuevasTareas }
        })

        set({
            grupos: grupos.map(g => g.id === grupo.id ? { ...grupo, materias: nuevasMaterias } : g)
        })
    },

    updateTaskStatus: (materiaId, tareaId, alumnoId, nuevoEstado) => {
        const { grupos, grupoSeleccionadoId } = get()
        const grupo = grupos.find(g => g.id === grupoSeleccionadoId)
        if (!grupo) return

        const nuevasMaterias = grupo.materias.map(m => {
            if (m.id !== materiaId) return m

            const nuevasTareas = m.tareas.map(t => {
                if (t.id !== tareaId) return t
                const nuevasAsignaciones = t.asignaciones.map(a =>
                    a.alumnoId === alumnoId ? { ...a, estado: nuevoEstado } : a
                )
                return { ...t, asignaciones: nuevasAsignaciones }
            })

            return { ...m, tareas: nuevasTareas }
        })

        set({
            grupos: grupos.map(g => g.id === grupo.id ? { ...grupo, materias: nuevasMaterias } : g)
        })
    },

    deleteTask: (materiaId, tareaId) => {
        const { grupos, grupoSeleccionadoId } = get()
        const grupo = grupos.find(g => g.id === grupoSeleccionadoId)
        if (!grupo) return

        const nuevasMaterias = grupo.materias.map(m =>
            m.id === materiaId
                ? { ...m, tareas: m.tareas.filter(t => t.id !== tareaId) }
                : m
        )

        set({
            grupos: grupos.map(g => g.id === grupo.id ? { ...grupo, materias: nuevasMaterias } : g)
        })
    }
}))