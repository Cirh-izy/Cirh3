import React, { useEffect, useState, useCallback } from "react";
import { StyleSheet, Pressable, View, Text } from "react-native";
import KanbanView from "../components/kanban/kanban_view";
import MosaicoView from "../components/mosaico/MosaicoView";
import { GroupStyle, getGroupStyle, setGroupStyle } from "../lib/storage/groupStyle";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Grupo({ route }: any) {
    const groupId = route?.params?.groupId ?? "default";

    // ✅ Default en "kanban"
    const [viewStyle, setViewStyle] = useState<GroupStyle>("kanban");
    const [menuOpen, setMenuOpen] = useState(false);

    // Cargar preferencia guardada (si existe)
    useEffect(() => {
        (async () => {
            const saved = await getGroupStyle(groupId);
            if (saved) setViewStyle(saved); // si no hay, queda "kanban"
        })();
    }, [groupId]);

    const applyStyle = useCallback(
        async (s: GroupStyle) => {
            setViewStyle(s);
            setMenuOpen(false);
            await setGroupStyle(groupId, s);
        },
        [groupId]
    );

    return (
        <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
            {/* Contenido */}
            {viewStyle === "kanban" ? (
                <KanbanView />
            ) : (
                <MosaicoView />
            )}

            {/* Botón de selector (arriba derecha) */}
            <View style={styles.selectorAnchor}>
                <Pressable
                    onPress={() => setMenuOpen((v) => !v)}
                    accessibilityLabel="Cambiar estilo de vista"
                    accessibilityRole="button"
                    style={styles.triggerBtn}
                >
                    <Text style={styles.triggerIcon}>⋯</Text>
                </Pressable>

                {/* Backdrop para cerrar al tocar fuera */}
                {menuOpen && (
                    <Pressable style={styles.backdrop} onPress={() => setMenuOpen(false)} />
                )}

                {/* Mini panel de estilos */}
                {menuOpen && (
                    <View style={styles.menu}>
                        <Text style={styles.menuTitle}>Vista de tareas</Text>

                        <MenuItem
                            label="Kanban"
                            selected={viewStyle === "kanban"}
                            onPress={() => applyStyle("kanban")}
                        />
                        <MenuItem
                            label="Mosaico"
                            selected={viewStyle === "mosaico"}
                            onPress={() => applyStyle("mosaico")}
                        />

                        {/* Aquí luego puedes agregar más estilos:
            <MenuItem label="Calendario" selected={viewStyle==='calendario'} onPress={() => applyStyle('calendario' as GroupStyle)} />
            */}
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
}

function MenuItem({
    label,
    selected,
    onPress,
}: {
    label: string;
    selected: boolean;
    onPress: () => void;
}) {
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

    // Ancla del selector (esquina superior derecha)
    selectorAnchor: {
        position: "absolute",
        top: 66,
        right: 12,
        zIndex: 50,
    },

    // Botón circular azul (trigger)
    triggerBtn: {
        width: BTN,
        height: BTN,
        borderRadius: BTN / 2,
        backgroundColor: "#007AFF",
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 4,
    },
    triggerIcon: {
        color: "#fff",
        fontSize: 22,
        lineHeight: 22,
        marginTop: 1, // ajuste visual
    },

    // Backdrop para cerrar tocando fuera
    backdrop: {
        position: "absolute",
        top: -8,     // cubre toda la pantalla detrás del menú (compensa el offset del anchor)
        right: -12,
        left: -9999,
        bottom: -9999,
        backgroundColor: "transparent",
    },

    // Mini panel
    menu: {
        position: "absolute",
        // top: BTN + 6, // justo debajo del botón
        right: 10,
        top: 50,
        minWidth: 200,
        borderRadius: 12,
        backgroundColor: "#fff",
        paddingVertical: 6,
        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 8,
    },
    menuTitle: {
        fontSize: 12,
        color: "#666",
        paddingHorizontal: 12,
        paddingBottom: 6,
    },
    menuItem: {
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    menuText: {
        fontSize: 16,
        color: "#1C1C1E",
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    radio: {
        width: 16,
        height: 16,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: "#555",
    },
    radioOn: {
        backgroundColor: "#555",
    },
});