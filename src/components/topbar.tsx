// components/TopBar.tsx
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

type Props = {
    title: string;
    onPressLeft?: () => void;
    onPressRight?: () => void;
};
export default function TopBar({ title, onPressLeft, onPressRight }: Props) {
    return (
        <View style={styles.topBar}>
            <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Añadir"
                onPress={onPressLeft}
                style={styles.iconButton}
            >
                <Text style={styles.iconButtonText}>＋</Text>
            </TouchableOpacity>

            <Text numberOfLines={1} style={styles.headerTitle}>{title}</Text>

            <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Seleccionar estilo"
                onPress={onPressRight}
                style={styles.iconButton}
            >
                <Text style={styles.iconButtonText}>⋯</Text>
            </TouchableOpacity>
        </View>
    );
}

const BUTTON_SIZE = 40;
const TITLE_SIDE_GUARD = BUTTON_SIZE + 16;

const styles = StyleSheet.create({
    topBar: {
        position: "relative",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 8,
    },
    headerTitle: {
        position: "absolute",
        left: TITLE_SIDE_GUARD,
        right: TITLE_SIDE_GUARD,
        textAlign: "center",
        fontSize: 22,
        fontWeight: "bold",
        color: "#1C1C1E",
    },
    iconButton: {
        backgroundColor: "#007AFF",
        borderRadius: BUTTON_SIZE / 2,
        width: BUTTON_SIZE,
        height: BUTTON_SIZE,
        alignItems: "center",
        justifyContent: "center",
    },
    iconButtonText: { color: "white", fontSize: 24, lineHeight: 28 },
});