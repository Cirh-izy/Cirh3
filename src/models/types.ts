export interface Grupo {
    id: string; // UUID o generado por Firestore luego
    nombre: string;
    descripcion?: string;
    fechaCreacion: string; // ISO string
    materias: Materia[];
    miembros: Usuario[];
    adminIds: string[]; // ids de los usuarios con permisos de admin
}

export interface Materia {
    id: string;
    nombre: string;
    imagenUrl?: string;
    profesor?: string;
    detallesDefinidosPorAlumnos?: DetalleLibre[]; // lo explicamos abajo
    tareas: Tarea[];
}

export interface DetalleLibre {
    id: string;
    titulo: string;
    contenido: string;
    autorId: string;
    fecha: string;
}

export interface Tarea {
    id: string;
    titulo: string;
    descripcion?: string;
    imagenUrl?: string;
    tipo: "tarea" | "examen" | "evento" | "recordatorio";
    fechaEntrega: string;
    creadorId: string;
    materiaId: string;
    visibleParaTodos: boolean;
    asignaciones: TareaPorAlumno[]; // asignaciones individuales
}


export interface TareaPorAlumno {
    alumnoId: string;
    estado: "pendiente" | "completada";
    fechaCompletado?: string;
    notaPersonal?: string;
}

export interface Usuario {
    id: string;
    nombre: string;
    correo?: string;
    fotoUrl?: string;
    grupoId: string;
    rol: "alumno" | "admin";
}

interface AppState {
    usuarioActivo: Usuario | null
    grupos: Grupo[]
    grupoSeleccionadoId: string | null
    setGrupoSeleccionadoId: (id: string) => void
    // ...otros estados
}