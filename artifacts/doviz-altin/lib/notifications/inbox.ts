import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "inbox_v1";
const MAX_ITEMS = 60;

export type InboxItem = {
  id: string;
  title: string;
  body: string;
  type: string;
  data?: Record<string, unknown>;
  ts: number;
  read: boolean;
};

let memCache: InboxItem[] | null = null;
const listeners = new Set<() => void>();

function notify(): void {
  for (const fn of listeners) fn();
}

export function subscribeInbox(fn: () => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

async function load(): Promise<InboxItem[]> {
  if (memCache) return memCache;
  try {
    const raw = await AsyncStorage.getItem(KEY);
    memCache = raw ? (JSON.parse(raw) as InboxItem[]) : [];
  } catch {
    memCache = [];
  }
  return memCache;
}

async function save(list: InboxItem[]): Promise<void> {
  memCache = list;
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(list));
  } catch {}
}

export async function addInboxItem(item: Omit<InboxItem, "read">): Promise<void> {
  if (!item.title && !item.body) return;
  if (item.type === "widget_refresh") return; // sessiz mesajlar inbox'a düşmesin
  const list = await load();
  // Aynı id varsa güncelle
  const existing = list.findIndex((x) => x.id === item.id);
  const next: InboxItem = { ...item, read: false };
  if (existing >= 0) {
    list[existing] = next;
  } else {
    list.unshift(next);
  }
  if (list.length > MAX_ITEMS) list.length = MAX_ITEMS;
  await save(list);
  notify();
}

export async function listInbox(): Promise<InboxItem[]> {
  return load();
}

export async function unreadCount(): Promise<number> {
  const list = await load();
  return list.filter((x) => !x.read).length;
}

export async function markAllRead(): Promise<void> {
  const list = await load();
  let changed = false;
  for (const x of list) {
    if (!x.read) {
      x.read = true;
      changed = true;
    }
  }
  if (changed) {
    await save(list);
    notify();
  }
}

export async function markRead(id: string): Promise<void> {
  const list = await load();
  const it = list.find((x) => x.id === id);
  if (it && !it.read) {
    it.read = true;
    await save(list);
    notify();
  }
}

export async function clearInbox(): Promise<void> {
  await save([]);
  notify();
}

export async function removeInboxItem(id: string): Promise<void> {
  const list = await load();
  const next = list.filter((x) => x.id !== id);
  if (next.length !== list.length) {
    await save(next);
    notify();
  }
}
