import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  Modal,
  StyleSheet,
  RefreshControl,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Materia = { id: string; nombre: string };
type Tarea = { id: string; titulo: string; venceEn?: string; done?: boolean };
type Props = { groupId: string };

export default function MosaicoView({ groupId }: Props) {
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [loading, setLoading] = useState(false);
  const [sel, setSel] = useState<Materia | null>(null);
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [loadingTareas, setLoadingTareas] = useState(false);

  const materiasKey = `materias:${groupId}`;
  const tareasKey = (mid: string) => `tareas:${groupId}:${mid}`;

  const loadMaterias = useCallback(async () => {
    setLoading(true);
    try {
      const raw = await AsyncStorage.getItem(materiasKey);
      const data: Materia[] = raw ? JSON.parse(raw) : [];
      setMaterias(data);
    } finally {
      setLoading(false);
    }
  }, [materiasKey]);

  const loadTareas = useCallback(
    async (mid: string) => {
      setLoadingTareas(true);
      try {
        const raw = await AsyncStorage.getItem(tareasKey(mid));
        const data: Tarea[] = raw ? JSON.parse(raw) : [];
        setTareas(data);
      } finally {
        setLoadingTareas(false);
      }
    },
    [tareasKey] // <— importante
  );

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const raw = await AsyncStorage.getItem(materiasKey);
        const data: Materia[] = raw ? JSON.parse(raw) : [];
        if (alive) setMaterias(data);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [materiasKey]);

  async function openMateria(m: Materia) {
    setSel(m);
    await loadTareas(m.id);
  }

  return (
    <View style={{ flex: 1, padding: 12 }}>
      <FlatList
        data={materias}
        keyExtractor={(m) => m.id}
        numColumns={2}
        columnWrapperStyle={{ gap: 12 }}
        contentContainerStyle={{ gap: 12, paddingBottom: 24 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadMaterias} />}
        renderItem={({ item }) => (
          <Pressable onPress={() => openMateria(item)} style={({ pressed }) => [s.tile, pressed && s.tilePressed]}>
            <Text style={s.tileTitle} numberOfLines={1}>{item.nombre}</Text>
          </Pressable>
        )}
        ListEmptyComponent={!loading ? <Text style={s.empty}>Sin materias. Usa ＋ para crear una.</Text> : null}
      />

      <Modal visible={!!sel} animationType="slide" onRequestClose={() => setSel(null)}>
        <View style={{ flex: 1, padding: 12 }}>
          <View style={s.header}>
            <Pressable onPress={() => setSel(null)}><Text style={s.back}>←</Text></Pressable>
            <Text style={s.headerTitle} numberOfLines={1}>{sel?.nombre || "Materia"}</Text>
            <View style={{ width: 24 }} />
          </View>

          <FlatList
            data={tareas}
            keyExtractor={(t) => t.id}
            ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
            refreshControl={<RefreshControl refreshing={loadingTareas} onRefresh={() => sel && loadTareas(sel.id)} />}
            renderItem={({ item }) => (
              <View style={s.card}>
                <Text style={s.cardTitle} numberOfLines={2}>{item.titulo}</Text>
                {!!item.venceEn && <Text style={s.cardMeta}>vence {item.venceEn}</Text>}
              </View>
            )}
            ListEmptyComponent={!loadingTareas ? <Text style={s.empty}>Sin tareas</Text> : null}
            contentContainerStyle={{ paddingVertical: 8 }}
          />
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  tile: { flex: 1, height: 96, borderRadius: 14, borderWidth: 1, borderColor: "#2b2b2b", backgroundColor: "#1e1e1e", justifyContent: "center", paddingHorizontal: 12 },
  tilePressed: { opacity: 0.8 },
  tileTitle: { color: "#fff", fontSize: 16, fontWeight: "600" },
  header: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  back: { color: "#fff", fontSize: 22 },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "700", flex: 1, textAlign: "center" },
  card: { padding: 12, borderRadius: 12, backgroundColor: "#2a2a2a" },
  cardTitle: { color: "#fff", fontSize: 15, fontWeight: "600" },
  cardMeta: { color: "#bdbdbd", marginTop: 4, fontSize: 12 },
  empty: { color: "#bdbdbd", textAlign: "center", marginTop: 20 },
});