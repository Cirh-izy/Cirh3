import React, { useMemo, useRef, useState } from "react";
import { View, Text, FlatList, Pressable, StyleSheet, Modal, SafeAreaView, Alert } from "react-native";
import { useAppStore } from "../../store/useAppStore";
import type { Tarea } from "../../models/types";
import KanbanTaskCard from "../kanban/kanban_taskcard";
import TaskBottomSheet from "../kanban/task_creation_modal.tsx";
import MateriaModal from "../kanban/create-materia";
import AddActionSheet from "../kanban/add_action";
import type { IHandles } from "react-native-modalize/lib/options";

export default function MosaicoView({ groupId }: { groupId?: string }) {
  const gidFromStore = useAppStore(s => s.grupoSeleccionadoId);
  const gid = groupId ?? gidFromStore;
  const grupo = useAppStore(s => s.grupos.find(g => g.id === gid));
  const usuario = useAppStore(s => s.usuarioActivo);
  const materias = grupo?.materias ?? [];

  const taskRef = useRef<IHandles | null>(null);
  const addRef = useRef<IHandles | null>(null);
  const [editingTask, setEditingTask] = useState<Tarea | null>(null);
  const [materiaModal, setMateriaModal] = useState(false);

  const [openMateriaId, setOpenMateriaId] = useState<string | number | null>(null);
  const materiaAbierta = useMemo(
    () => materias.find(m => String(m.id) === String(openMateriaId)) ?? null,
    [openMateriaId, materias]
  );

  const handleEditTask = (t: Tarea) => { setEditingTask(t); taskRef.current?.open(); };
  const handleAddTask = () => { setEditingTask(null); taskRef.current?.open(); };

  const handleDeleteTask = (tareaId: string) => {
    if (!gid) return;
    Alert.alert("Eliminar Tarea", "¿Seguro?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Eliminar", style: "destructive", onPress: () => useAppStore.getState().deleteTask(gid, tareaId) },
    ]);
  };

  const handleToggleTaskStatus = (tareaId: string, currentStatus: string) => {
    if (!gid || !usuario) return;
    const next = currentStatus === "pendiente" ? "completada" : "pendiente";
    useAppStore.getState().updateTaskStatus(gid, tareaId, usuario.id, next);
  };

  const handleSaveTask = (taskData: Partial<Tarea>) => {
    const materiaId = taskData.materiaId ?? materiaAbierta?.id;
    if (!materiaId) return;
    const store = useAppStore.getState();
    if (editingTask) {
      store.updateTask(materiaId, taskData);
    } else {
      const newTask: Tarea = {
        ...(taskData as Tarea),
        asignaciones:
          grupo?.miembros.map(m => ({ alumnoId: m.id, estado: "pendiente" as const })) ?? [],
      };
      store.addTask(materiaId, newTask);
    }
  };

  if (!grupo || !gid) {
    return <View style={styles.centered}><Text style={styles.centerText}>Crea un grupo en el menú.</Text></View>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Pressable style={styles.addButton} onPress={() => addRef.current?.open()}>
          <Text style={styles.addButtonText}>＋</Text>
        </Pressable>
        <Text style={styles.headerTitle}>📋 {grupo?.nombre ?? "Grupo"}</Text>
      </View>

      <FlatList
        data={materias}
        keyExtractor={m => String(m.id)}
        numColumns={2}
        columnWrapperStyle={{ gap: 12 }}
        contentContainerStyle={{ padding: 12, gap: 12 }}
        renderItem={({ item }) => {
          const tareasUsuario = (item.tareas ?? [])
            .map(t => {
              if (!t.asignaciones?.length) return { ...t, estado: "pendiente" } as any;
              const a = t.asignaciones.find(x => x.alumnoId === usuario?.id);
              return a ? ({ ...t, estado: a.estado } as any) : { ...t, estado: "pendiente" };
            }) as (Tarea & { estado: string })[];

          return (
            <Pressable style={styles.materiaCard} onPress={() => setOpenMateriaId(item.id)}>
              <Text style={styles.materiaTitle} numberOfLines={1}>{item.nombre}</Text>
              {tareasUsuario.slice(0, 3).map(t => (
                <Text key={String(t.id)} style={styles.taskPreview} numberOfLines={1}>• {t.titulo}</Text>
              ))}
              {tareasUsuario.length === 0 && <Text style={styles.noTareas}>Sin tareas</Text>}
            </Pressable>
          );
        }}
        ListEmptyComponent={<Text style={styles.centerText}>Sin materias</Text>}
      />

      <Modal visible={!!materiaAbierta} transparent animationType="fade" onRequestClose={() => setOpenMateriaId(null)}>
        <Pressable style={styles.backdrop} onPress={() => setOpenMateriaId(null)} />
        <SafeAreaView style={styles.sheet}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>{materiaAbierta?.nombre ?? ""}</Text>
            <Pressable onPress={() => setOpenMateriaId(null)}><Text style={styles.close}>✕</Text></Pressable>
          </View>

          {(() => {
            const tareasUsuario = (materiaAbierta?.tareas ?? [])
              .map(t => {
                if (!t.asignaciones?.length) return { ...t, estado: "pendiente" } as any;
                const a = t.asignaciones.find(x => x.alumnoId === usuario?.id);
                return { ...t, estado: a?.estado ?? "pendiente" } as any;
              }) as (Tarea & { estado: string })[];

            return (
              <FlatList
                data={tareasUsuario}
                keyExtractor={t => String(t.id)}
                contentContainerStyle={{ padding: 12, gap: 12 }}
                renderItem={({ item }) => (
                  <KanbanTaskCard
                    tarea={item}
                    onEdit={handleEditTask}
                    onDelete={handleDeleteTask}
                    onToggleStatus={handleToggleTaskStatus}
                  />
                )}
                ListEmptyComponent={<Text style={styles.centerText}>Sin tareas</Text>}
              />
            );
          })()}

          <View style={{ padding: 12 }}>
            <Pressable style={styles.addTaskBtn} onPress={handleAddTask}>
              <Text style={styles.addTaskText}>＋ Nueva tarea</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </Modal>

      <AddActionSheet
        modalRef={addRef}
        mostrarCrearTarea={materias.length > 0}
        onCrearMateria={() => { addRef.current?.close(); setTimeout(() => setMateriaModal(true), 300); }}
        onCrearTarea={() => { addRef.current?.close(); setTimeout(() => handleAddTask(), 300); }}
      />
      <MateriaModal visible={materiaModal} onClose={() => setMateriaModal(false)} />
      <TaskBottomSheet modalRef={taskRef} editingTask={editingTask} onSave={handleSaveTask} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  centerText: { color: "#666", fontSize: 16, textAlign: "center" },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  addButton: { backgroundColor: "#007AFF", borderRadius: 20, width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  addButtonText: { color: "#fff", fontSize: 24, lineHeight: 28 },
  headerTitle: { fontSize: 24, fontWeight: "bold", color: "#1C1C1E" },
  materiaCard: { flex: 1, minHeight: 96, borderRadius: 12, backgroundColor: "#fff", padding: 12, shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  materiaTitle: { fontSize: 16, fontWeight: "700", marginBottom: 6, color: "#333" },
  taskPreview: { fontSize: 12, color: "#555" },
  noTareas: { fontSize: 12, color: "#999", fontStyle: "italic" },
  backdrop: { position: "absolute", left: 0, right: 0, top: 0, bottom: 0, backgroundColor: "#0006" },
  sheet: { position: "absolute", left: 12, right: 12, top: 24, bottom: 24, borderRadius: 16, backgroundColor: "#fff", elevation: 16 },
  sheetHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#ddd" },
  sheetTitle: { fontSize: 18, fontWeight: "700" },
  close: { fontSize: 18, padding: 6 },
  addTaskBtn: { backgroundColor: "#007AFF", borderRadius: 10, paddingVertical: 12, alignItems: "center" },
  addTaskText: { color: "#fff", fontWeight: "700" },
});
