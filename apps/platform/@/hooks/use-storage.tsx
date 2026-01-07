"use client";

import { useSyncExternalStore } from "react";

type StorageType = "localStorage" | "sessionStorage";

function useStorage<T>(
  key: string,
  initialValue: T,
  storageType: StorageType = "localStorage"
) {
  // keep cached snapshot across calls
  let cached: T = initialValue;

  // subscribe never changes
  const subscribe = (callback: () => void) => {
    if (typeof window === "undefined") return () => {};

    const onStorageChange = (event: StorageEvent) => {
      if (event.key === key && event.storageArea === window[storageType]) {
        callback();
      }
    };
    window.addEventListener("storage", onStorageChange);
    return () => window.removeEventListener("storage", onStorageChange);
  };

  // stable snapshot getter with caching
  const getSnapshot = (): T => {
    if (typeof window === "undefined") return cached;

    try {
      const storage = window[storageType];
      const item = storage.getItem(key);
      if (item === null) return cached;

      let next: T;

      if (typeof initialValue === "string") next = item as T;
      else if (typeof initialValue === "number") {
        const parsed = Number(item);
        next = (isNaN(parsed) ? initialValue : parsed) as T;
      } else if (typeof initialValue === "boolean") {
        next = (item === "true") as T;
      } else {
        next = JSON.parse(item) as T;
      }

      // ✅ only update cached ref if actually different
      if (JSON.stringify(next) !== JSON.stringify(cached)) {
        cached = next;
      }

      return cached;
    } catch {
      return cached;
    }
  };

  const value = useSyncExternalStore(subscribe, getSnapshot, () => initialValue);

  const setValue = (newValue: T | ((prev: T) => T)) => {
    if (typeof window === "undefined") return;

    try {
      const storage = window[storageType];
      const valueToStore =
        typeof newValue === "function"
          ? (newValue as (prev: T) => T)(value)
          : newValue;

      let serialized: string;
      if (typeof valueToStore === "string") serialized = valueToStore;
      else if (
        typeof valueToStore === "number" ||
        typeof valueToStore === "boolean"
      )
        serialized = String(valueToStore);
      else serialized = JSON.stringify(valueToStore);

      storage.setItem(key, serialized);

      // update cache immediately
      cached = valueToStore;

      // trigger update for this tab
      window.dispatchEvent(
        new StorageEvent("storage", {
          key,
          newValue: serialized,
          storageArea: storage,
        })
      );
    } catch (e) {
      console.error(`Error storing value for key "${key}":`, e);
    }
  };

  return [value, setValue] as const;
}

export default useStorage;
