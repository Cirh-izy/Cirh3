// import React, { useRef, useState } from "react"
// import {
//     View,
//     Alert,
//     ScrollView,
//     TouchableOpacity,
//     Text,
//     StyleSheet,
// } from "react-native"
// import { Tarea } from "../../models/types"
// import { useAppStore } from "../../store/useAppStore"
// import KanbanTaskCard from "./kanban_taskcard"
// import TaskBottomSheet from "./task_creation_modal.tsx" // ← sin .tsx
// import { Modalize } from "react-native-modalize"     // ← API pública
// import MateriaModal from './create-materia'
// import AddActionSheet from './add_action'

// export default function KanbanView() {
//     const modalRef = useRef<Modalize>(null)   // ← tipo correcto
//     const addSheetRef = useRef<Modalize>(null)

//     const [editingTask, setEditingTask] = useState<Tarea | null>(null)
//     const [isMateriaModalVisible, setIsMateriaModalVisible] = useState(false)

//     const grupoId = useAppStore((s) => s.grupoSeleccionadoId)
//     const grupo = useAppStore((s) => s.grupos.find((g) => g.id === grupoId))
//     const materias = grupo?.materias || []
//     const usuario = useAppStore((s) => s.usuarioActivo)

//     const handleEditTask = (tarea: Tarea) => {
//         setEditingTask(tarea)
//         modalRef.current?.open()
//     }

//     const handleDeleteTask = (tareaId: string) => {
//         Alert.alert(
//             'Eliminar Tarea',
//             '¿Estás seguro de que quieres eliminar esta tarea?',
//             [
//                 { text: 'Cancelar', style: 'cancel' },
//                 {
//                     text: 'Eliminar',
//                     style: 'destructive',
//                     onPress: () => {
//                         if (!grupoId) return
//                         const store = useAppStore.getState()
//                         store.deleteTask(grupoId, tareaId)
//                     }
//                 }
//             ]
//         )
//     }

//     const handleToggleTaskStatus = (tareaId: string, currentStatus: string) => {
//         if (!grupoId || !usuario) return
//         const store = useAppStore.getState()
//         const newStatus = currentStatus === 'pendiente' ? 'completada' : 'pendiente'
//         store.updateTaskStatus(grupoId, tareaId, usuario.id, newStatus)
//     }

//     const handleAddTask = () => {
//         setEditingTask(null)
//         modalRef.current?.open()
//     }

//     const handleSaveTask = (taskData: Partial<Tarea>) => {
//         const materiaId = taskData.materiaId
//         if (!grupoId || !materiaId) return
//         const store = useAppStore.getState()
//         if (editingTask) {
//             store.updateTask(materiaId, taskData)
//         } else {
//             const newTask: Tarea = {
//                 ...taskData as Tarea,
//                 asignaciones: grupo?.miembros.map(miembro => ({
//                     alumnoId: miembro.id,
//                     estado: 'pendiente' as const,
//                 })) || [],
//             }
//             store.addTask(materiaId, newTask)
//         }
//     }

//     if (!grupo || !grupoId) {
//         return (
//             <View style={styles.centeredContainer}>
//                 <Text style={styles.centeredText}>
//                     Empieza por crear un grupo en el menú.
//                 </Text>
//             </View>
//         )
//     }

//     return (
//         <View style={styles.container}>
//             <View style={styles.topBar}>
//                 <TouchableOpacity onPress={() => addSheetRef.current?.open()} style={styles.addButton}>
//                     <Text style={styles.addButtonText}>＋</Text>
//                 </TouchableOpacity>
//                 <Text style={styles.headerTitle}> {grupo?.nombre || 'Grupo'}</Text>
//             </View>

//             {materias.length === 0 ? (
//                 <View style={styles.centeredContainer}>
//                     <Text style={styles.centeredText}>
//                         Primero crea una materia para comenzar a añadir tareas.
//                     </Text>
//                 </View>
//             ) : (
//                 <ScrollView contentContainerStyle={styles.kanbanContainer}>
//                     {materias.map((materia) => {
//                         const tareas = materia.tareas ?? []

//                         const tareasUsuario = tareas
//                             .map((t) => {
//                                 if (!t.asignaciones || t.asignaciones.length === 0) {
//                                     return { ...t, estado: 'pendiente' } // fallback si no hay asignaciones
//                                 }
//                                 const asignacion = t.asignaciones.find((a) => a.alumnoId === usuario?.id)
//                                 return asignacion ? { ...t, estado: asignacion.estado } : null
//                             })
//                             .filter(Boolean) as (Tarea & { estado: string })[]

//                         return (
//                             <View key={materia.id} style={styles.materiaCard}>
//                                 <Text style={styles.materiaTitle}>{materia.nombre}</Text>

//                                 {tareasUsuario.length === 0 ? (
//                                     <Text style={styles.noTareas}>No hay tareas.</Text>
//                                 ) : (
//                                     tareasUsuario.map((tarea) => (
//                                         <KanbanTaskCard
//                                             key={tarea.id}
//                                             tarea={tarea}
//                                             onEdit={handleEditTask}
//                                             onDelete={handleDeleteTask}
//                                             onToggleStatus={handleToggleTaskStatus}
//                                         />
//                                     ))
//                                 )}
//                             </View>
//                         )
//                     })}
//                 </ScrollView>
//             )}

//             <AddActionSheet
//                 modalRef={addSheetRef}
//                 mostrarCrearTarea={materias.length > 0}
//                 onCrearMateria={() => {
//                     addSheetRef.current?.close()
//                     setTimeout(() => setIsMateriaModalVisible(true), 300)
//                 }}
//                 onCrearTarea={() => {
//                     addSheetRef.current?.close()
//                     setTimeout(() => handleAddTask(), 300)
//                 }}
//             />

//             <MateriaModal
//                 visible={isMateriaModalVisible}
//                 onClose={() => setIsMateriaModalVisible(false)}
//             />

//             <TaskBottomSheet
//                 modalRef={modalRef}
//                 editingTask={editingTask}
//                 onSave={handleSaveTask}
//             />
//         </View>
//     )
// }

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor: '#F8F9FA',
//     },
//     topBar: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         justifyContent: 'space-between',
//         paddingHorizontal: 16,
//         paddingTop: 16,
//         paddingBottom: 8,
//     },
//     addButton: {
//         backgroundColor: '#007AFF',
//         borderRadius: 20,
//         width: 40,
//         height: 40,
//         alignItems: 'center',
//         justifyContent: 'center',
//     },
//     addButtonText: {
//         color: 'white',
//         fontSize: 24,
//         lineHeight: 28,
//     },
//     headerTitle: {
//         fontSize: 24,
//         fontWeight: 'bold',
//         color: '#1C1C1E',
//     },
//     kanbanContainer: {
//         paddingHorizontal: 16,
//         paddingBottom: 24,
//     },
//     materiaCard: {
//         backgroundColor: 'white',
//         borderRadius: 12,
//         padding: 16,
//         marginBottom: 16,
//         shadowColor: '#000',
//         shadowOpacity: 0.1,
//         shadowRadius: 6,
//         elevation: 3,
//     },
//     materiaTitle: {
//         fontSize: 18,
//         fontWeight: 'bold',
//         marginBottom: 10,
//         color: '#333',
//     },
//     tareaItem: {
//         paddingVertical: 8,
//         borderBottomWidth: 1,
//         borderBottomColor: '#EEE',
//     },
//     tareaText: {
//         fontSize: 16,
//         color: '#333',
//     },
//     fechaEntrega: {
//         fontSize: 12,
//         color: '#999',
//     },
//     noTareas: {
//         fontSize: 14,
//         color: '#777',
//         fontStyle: 'italic',
//     },
//     centeredContainer: {
//         flex: 1,
//         justifyContent: 'center',
//         alignItems: 'center',
//         padding: 20,
//     },
//     centeredText: {
//         fontSize: 16,
//         color: '#666',
//         textAlign: 'center',
//     },
// })