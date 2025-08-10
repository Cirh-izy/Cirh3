import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  View, SafeAreaView, StyleSheet, Pressable, Text,
  Platform, ActionSheetIOS, Modal
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, RouteProp } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import KanbanView from "../components/kanban/kanban_view";
import MosaicoView from "../components/mosaico/MosaicoView";

type GroupStyle = "mosaico" | "kanban";
type RootStackParamList = { Grupo: { groupId: string; nombre?: string } };

export default function Grupo({ route }: { route: RouteProp<RootStackParamList, "Grupo"> }) {
  const groupId = route?.params?.groupId ?? "default";
  const nombre = route?.params?.nombre ?? groupId;

  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const headerH = useHeaderHeight();

  const [uiStyle, setUiStyle] = useState<GroupStyle>("mosaico");
  const [menuOpen, setMenuOpen] = useState(false);
  const saving = useRef(false);

  // Cargar preferencia
  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem(`groupStyle:${groupId}`);
      if (saved === "mosaico" || saved === "kanban") setUiStyle(saved as GroupStyle);
    })();
  }, [groupId]);

  // Guardar preferencia
  useEffect(() => {
    if (saving.current) return;
    saving.current = true;
    AsyncStorage.setItem(`groupStyle:${groupId}`, uiStyle).finally(() => (saving.current = false));
  }, [uiStyle, groupId]);

  // Botón en el header
  useLayoutEffect(() => {
    navigation?.setOptions({
      headerTitle: nombre,
      headerRight: () => (
        <Pressable onPress={openMenu} hitSlop={12} style={styles.styleBtnNav}>
          <Text style={{ fontSize: 20 }}>⋮</Text>
        </Pressable>
      ),
    });
  }, [navigation, nombre, uiStyle]);

  const choose = (s: GroupStyle) => { setUiStyle(s); setMenuOpen(false); };

  function openMenu() {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        { options: ["Mosaico", "Kanban", "Cancelar"], cancelButtonIndex: 2, userInterfaceStyle: "dark" },
        (i) => { if (i === 0) choose("mosaico"); if (i === 1) choose("kanban"); }
      );
    } else setMenuOpen(true);
  }

  return (
    <SafeAreaView style={styles.container}>
      {uiStyle === "mosaico" && <MosaicoView groupId={groupId} />}
      {uiStyle === "kanban"  && <KanbanView  groupId={groupId} />}

      {/* Menú Android */}
      <Modal visible={menuOpen} transparent animationType="fade" onRequestClose={() => setMenuOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setMenuOpen(false)}>
          <View style={[styles.menu, { top: (insets.top || 0) + headerH - 8, right: 12 }]}>
            <MenuItem label={`Mosaico ${uiStyle === "mosaico" ? "✓" : ""}`} onPress={() => choose("mosaico")} />
            <MenuItem label={`Kanban ${uiStyle === "kanban" ? "✓" : ""}`}   onPress={() => choose("kanban")} />
          </View>
        </Pressable>
      </Modal>

      {/* FAB añadir materia (conéctalo a tu modal/pantalla) */}
      <Pressable onPress={() => console.log("Añadir materia", groupId)} style={styles.fab}>
        <Text style={styles.fabText}>＋</Text>
      </Pressable>
    </SafeAreaView>
  );
}

function MenuItem({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}>
      <Text style={styles.itemText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container:{ flex:1, backgroundColor:"#F8F9FA" },
  styleBtnNav:{ paddingHorizontal:12, paddingVertical:6, borderRadius:12, backgroundColor:"#f2f2f7", marginRight:8 },
  backdrop:{ flex:1, backgroundColor:"rgba(0,0,0,0.2)" },
  menu:{ position:"absolute", width:190, borderRadius:12, paddingVertical:6, backgroundColor:"#1f1f1f", elevation:6 },
  item:{ paddingVertical:10, paddingHorizontal:14 },
  itemPressed:{ backgroundColor:"#2a2a2a" },
  itemText:{ color:"#fff", fontSize:16 },
  fab:{ position:"absolute", right:16, bottom:24, zIndex:50, width:56, height:56, borderRadius:28, alignItems:"center", justifyContent:"center", backgroundColor:"#2f80ed", elevation:5 },
  fabText:{ color:"#fff", fontSize:28, lineHeight:28, fontWeight:"600" },
});