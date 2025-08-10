import React, { useEffect, useState } from "react";
import { SafeAreaView, StyleSheet, Pressable, Modal, View, Text } from "react-native";
import KanbanView from "../components/kanban/kanban_view";
import MosaicoView from "../components/mosaico/MosaicoView";
import { getGroupStyle, setGroupStyle, GroupStyle } from "../lib/storage/groupStyle";

export default function Grupo({ route }: any) {
  const groupId = route?.params?.groupId ?? "default";
  const [viewStyle, setViewStyle] = useState<GroupStyle>("mosaico");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    (async () => {
      const s = await getGroupStyle(groupId);
      if (s) setViewStyle(s);
    })();
  }, [groupId]);

  const applyStyle = async (s: GroupStyle) => {
    setViewStyle(s);
    setMenuOpen(false);
    await setGroupStyle(groupId, s);
  };

  return (
    <SafeAreaView style={styles.container} key={viewStyle}>
      {viewStyle === "kanban" ? <KanbanView /> : <MosaicoView groupId={groupId} />}

      <Pressable onPress={() => setMenuOpen(true)} style={styles.fab}>
        <Text style={{ fontSize: 20 }}>⋮</Text>
      </Pressable>

      <Modal visible={menuOpen} transparent animationType="fade" onRequestClose={() => setMenuOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setMenuOpen(false)} />
        <View style={styles.menu}>
          <Text style={styles.menuTitle}>Vista de tareas</Text>
          <Pressable style={styles.menuItem} onPress={() => applyStyle("mosaico")}>
            <View style={styles.row}>
              <View style={[styles.radio, viewStyle === "mosaico" && styles.radioOn]} />
              <Text style={styles.menuText}>Mosaico</Text>
            </View>
          </Pressable>
          <Pressable style={styles.menuItem} onPress={() => applyStyle("kanban")}>
            <View style={styles.row}>
              <View style={[styles.radio, viewStyle === "kanban" && styles.radioOn]} />
              <Text style={styles.menuText}>Kanban</Text>
            </View>
          </Pressable>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  fab: { position: "absolute", top: 8, right: 12, padding: 8, borderRadius: 16, backgroundColor: "#fff", elevation: 4, zIndex: 50 },
  backdrop: { position: "absolute", left: 0, right: 0, top: 0, bottom: 0, backgroundColor: "#0003" },
  menu: { position: "absolute", top: 44, right: 12, minWidth: 200, borderRadius: 12, backgroundColor: "#fff", paddingVertical: 8, elevation: 8 },
  menuTitle: { fontSize: 12, color: "#666", paddingHorizontal: 12, paddingBottom: 6 },
  menuItem: { paddingHorizontal: 12, paddingVertical: 10 },
  menuText: { fontSize: 16 },
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  radio: { width: 16, height: 16, borderRadius: 10, borderWidth: 2, borderColor: "#555" },
  radioOn: { backgroundColor: "#555" },
});
