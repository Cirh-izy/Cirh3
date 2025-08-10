import AsyncStorage from "@react-native-async-storage/async-storage";

export type GroupStyle = "mosaico" | "kanban";

const key = (id: string) => `groupStyle:${id}`;

export async function getGroupStyle(groupId: string): Promise<GroupStyle | null> {
  try {
    const stored = await AsyncStorage.getItem(key(groupId));
    if (stored === "mosaico" || stored === "kanban") {
      return stored;
    }
  } catch {
    // ignore
  }
  return null;
}

export async function setGroupStyle(groupId: string, style: GroupStyle): Promise<void> {
  try {
    await AsyncStorage.setItem(key(groupId), style);
  } catch {
    // ignore
  }
}
