import AsyncStorage from "@react-native-async-storage/async-storage";

export type GroupStyle = "mosaico" | "kanban";
const key = (id: string) => `group_style:${id}`;

export async function getGroupStyle(id: string): Promise<GroupStyle | null> {
  const v = await AsyncStorage.getItem(key(id));
  return v === "mosaico" || v === "kanban" ? v : null;
}

export async function setGroupStyle(id: string, s: GroupStyle) {
  await AsyncStorage.setItem(key(id), s);
}
