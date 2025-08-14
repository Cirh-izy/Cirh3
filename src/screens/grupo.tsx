// screens/Grupo.tsx
import React, { useEffect, useRef, useState, useCallback } from "react";
import { StyleSheet, Pressable, View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import TopBar from "../components/topbar";
import KanbanView, { KanbanHandle } from "../components/kanban/kanban_view";
import MosaicoView, { MosaicoHandle } from "../components/mosaico/MosaicoView";
import { getGroupStyle, setGroupStyle, type GroupStyle } from "../lib/storage/groupStyle";
import { useAppStore } from "../store/useAppStore";

export default function Grupo() {
    const grupo = useAppStore(s => s.grupos.find(g => g.id === s.grupoSeleccionadoId));
    const titulo = grupo?.nombre ?? "Grupo";

    const [viewStyle, setViewStyle] = useState<GroupStyle>("kanban");
    const [menuOpen, setMenuOpen] = useState(false);

    const kanbanRef = useRef<KanbanHandle>(null);
    const mosaicoRef = useRef<MosaicoHandle>(null);

    useEffect(() => {
        (async () => {
            const saved = await getGroupStyle();       // ← sin id
            if (saved) setViewStyle(saved);
        })();
    }, []);

    const applyStyle = useCallback(async (s: GroupStyle) => {
        setViewStyle(s);
        setMenuOpen(false);
        await setGroupStyle(s);                      // ← sin id
    }, []);

    const handleAdd = useCallback(() => {
        if (viewStyle === "kanban") kanbanRef.current?.openAdd?.();
        else mosaicoRef.current?.openAdd?.();
    }, [viewStyle]);

    return (
        <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
            {/* TOP BAR COMÚN */}
            <TopBar
                title={titulo}
                onPressLeft={handleAdd}
                onPressRight={() => setMenuOpen(v => !v)}
            />

            {/* CONTENIDO SEGÚN ESTILO */}
            {viewStyle === "kanban" ? (
                <KanbanView ref={kanbanRef} />
            ) : (
                <MosaicoView ref={mosaicoRef} />
            )}

            {/* BACKDROP + MENÚ ESTILOS, anclado arriba derecha bajo la topbar */}
            {menuOpen && (
                <>
                    <Pressable style={styles.backdrop} onPress={() => setMenuOpen(false)} />
                    <View style={styles.menu}>
                        <Text style={styles.menuTitle}>Vista de tareas</Text>
                        <MenuItem label="Kanban" selected={viewStyle === "kanban"} onPress={() => applyStyle("kanban")} />
                        <MenuItem label="Mosaico" selected={viewStyle === "mosaico"} onPress={() => applyStyle("mosaico")} />
                    </View>
                </>
            )}
        </SafeAreaView>
    );
}

function MenuItem({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void; }) {
    return (
        <Pressable onPress={onPress} style={styles.menuItem}>
            <View style={styles.row}>
                <View style={[styles.radio, selected && styles.radioOn]} />
                <Text style={styles.menuText}>{label}</Text>
            </View>
        </Pressable>
    );
}

const BTN = 40;
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F8F9FA" },
    backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "transparent" },
    menu: {
        position: "absolute",
        right: 12,
        top: 66 + 50, // altura topbar aprox (ajusta si cambia)
        minWidth: 200,
        borderRadius: 12,
        backgroundColor: "#fff",
        paddingVertical: 6,
        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 8,
    },
    menuTitle: { fontSize: 12, color: "#666", paddingHorizontal: 12, paddingBottom: 6 },
    menuItem: { paddingHorizontal: 12, paddingVertical: 10 },
    menuText: { fontSize: 16, color: "#1C1C1E" },
    row: { flexDirection: "row", alignItems: "center", gap: 10 },
    radio: { width: 16, height: 16, borderRadius: 10, borderWidth: 2, borderColor: "#555" },
    radioOn: { backgroundColor: "#555" },
});