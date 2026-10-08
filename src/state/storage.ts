import Storage from 'expo-sqlite/kv-store';

export function readItem(key: string) {
  try {
    return Storage.getItemSync(key);
  } catch {
    return null;
  }
}

export function writeItem(key: string, value: string | null) {
  try {
    if (value === null) Storage.removeItemSync(key);
    else Storage.setItemSync(key, value);
  } catch {
    // Persisting is best-effort; the in-memory copy still works for this session.
  }
}
