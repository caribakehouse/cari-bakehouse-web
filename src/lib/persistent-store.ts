// Store nhỏ lưu trong localStorage, dùng với useSyncExternalStore.
// - Server / lần render hydrate đầu tiên luôn trả về `fallback` → không lệch hydration.
// - Nếu localStorage bị chặn (chế độ riêng tư...) thì giữ tạm trong bộ nhớ.

export interface PersistentStore<T> {
  subscribe: (listener: () => void) => () => void;
  getSnapshot: () => T;
  getServerSnapshot: () => T;
  set: (next: T) => void;
  /** Xóa dữ liệu đã lưu, quay về giá trị mặc định (seed) */
  reset: () => void;
}

export function createPersistentStore<T>(
  key: string,
  fallback: T,
  sanitize: (value: unknown) => T = (value) => value as T,
): PersistentStore<T> {
  const listeners = new Set<() => void>();
  let cachedRaw: string | null = null;
  let cachedValue: T = fallback;
  let hasRead = false;
  let memoryOnly = false;

  const emit = () => listeners.forEach((listener) => listener());

  function getSnapshot(): T {
    if (typeof window === "undefined" || memoryOnly) return cachedValue;

    let raw: string | null;
    try {
      raw = window.localStorage.getItem(key);
    } catch {
      memoryOnly = true;
      return cachedValue;
    }

    // Trả về cùng một tham chiếu khi dữ liệu không đổi (yêu cầu của useSyncExternalStore)
    if (hasRead && raw === cachedRaw) return cachedValue;

    hasRead = true;
    cachedRaw = raw;
    try {
      cachedValue = raw === null ? fallback : sanitize(JSON.parse(raw));
    } catch {
      cachedValue = fallback;
    }
    return cachedValue;
  }

  function set(next: T) {
    cachedValue = next;
    try {
      const raw = JSON.stringify(next);
      window.localStorage.setItem(key, raw);
      cachedRaw = raw;
      hasRead = true;
    } catch {
      memoryOnly = true;
    }
    emit();
  }

  function reset() {
    memoryOnly = false;
    hasRead = false;
    cachedRaw = null;
    cachedValue = fallback;
    try {
      window.localStorage.removeItem(key);
    } catch {
      // localStorage bị chặn: bỏ qua
    }
    emit();
  }

  function subscribe(listener: () => void) {
    listeners.add(listener);
    const onStorage = (e: StorageEvent) => {
      if (e.key === key || e.key === null) listener();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", onStorage);
    };
  }

  return { subscribe, getSnapshot, getServerSnapshot: () => fallback, set, reset };
}
