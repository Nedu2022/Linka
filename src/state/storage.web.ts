export function readItem(key: string) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeItem(key: string, value: string | null) {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch {
    // Storage can be unavailable (private mode, static render); keep the in-memory copy.
  }
}
