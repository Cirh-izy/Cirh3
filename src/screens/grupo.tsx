import React, { useEffect, useState } from "react";
import { View, Text, Pressable, Modal, StyleSheet } from "react-native";
import KanbanView from "../components/kanban/kanban_view";
import MosaicoView from "../components/mosaico/MosaicoView";
import {
  type GroupStyle,
  getGroupStyle,
  setGroupStyle,
} from "../lib/storage/groupStyle";

interface RouteParams { groupId: string; nombre?: string }
interface Props { route?: { params?: RouteParams } }

export default function Grupo({ route }: Props) {
  const groupId = route?.params?.groupId ?? "default";
  const title = route?.params?.nombre ?? "Grupo";
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
    <View style={{ flex: 1 }}>
      {/* Header propio porque dijiste que no usas navigator */}
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.right}>
          <Text style={styles.user}>cirh</Text>
          <Pressable
            onPress={() => setMenuOpen(true)}
            style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.7 }]}
            android_ripple={{ color: "#00000022", borderless: true }}
          >
            <Text style={styles.icon}>⋮</Text>
          </Pressable>
        </View>
      </View>

      {viewStyle === "kanban"
        ? <KanbanView groupId={groupId} />
        : <MosaicoView groupId={groupId} />}

      {/* Menú */}
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
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 56, paddingHorizontal: 16, flexDirection: "row",
    alignItems: "center", justifyContent: "space-between",
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#ddd", backgroundColor: "#fff",
  },
  title: { fontSize: 18, fontWeight: "600" },
  right: { flexDirection: "row", alignItems: "center", gap: 8 },
  user: { fontSize: 14, color: "#555" },
  iconBtn: { padding: 6, borderRadius: 16 },
  icon: { fontSize: 20 },
  backdrop: { position: "absolute", left: 0, right: 0, top: 0, bottom: 0, backgroundColor: "#00000033" },
  menu: {
    position: "absolute", top: 58, right: 12, minWidth: 200, borderRadius: 12,
    backgroundColor: "#fff", paddingVertical: 8, elevation: 8,
    shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 12, shadowOffset: { width: 0, height: 6 },
  },
  menuTitle: { fontSize: 12, color: "#666", paddingHorizontal: 12, paddingBottom: 6 },
  menuItem: { paddingHorizontal: 12, paddingVertical: 10 },
  menuText: { fontSize: 16 },
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  radio: { width: 16, height: 16, borderRadius: 10, borderWidth: 2, borderColor: "#555" },
  radioOn: { backgroundColor: "#555" },
});