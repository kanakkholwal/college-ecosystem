"use client";

import { useCallback, useRef, useSyncExternalStore } from "react";

type StorageType = "localStorage" | "sessionStorage";

function useStorage<T>(
  key: string,
  initialValue: T,
  storageType: StorageType = "localStorage"
) {
  const cachedRef = useRef<T>(initialValue);

  const subscribe = useCallback(
    (callback: () => void) => {
      if (typeof window === "undefined") return () => {};

      const onStorageChange = (event: StorageEvent) => {
        if (event.key === key && event.storageArea === window[storageType]) {
          const item = window[storageType].getItem(key);
          if (item !== null) {
            try {
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
              cachedRef.current = next;
            } catch {
              // keep current cached value
            }
          }
          callback();
        }
      };
      window.addEventListener("storage", onStorageChange);
      return () => window.removeEventListener("storage", onStorageChange);
    },
    [key, storageType, initialValue]
  );

  const getSnapshot = useCallback((): T => {
    if (typeof window === "undefined") return cachedRef.current;

    try {
      const storage = window[storageType];
      const item = storage.getItem(key);
      if (item === null) return cachedRef.current;

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

      if (JSON.stringify(next) !== JSON.stringify(cachedRef.current)) {
        cachedRef.current = next;
      }

      return cachedRef.current;
    } catch {
      return cachedRef.current;
    }
  }, [key, storageType, initialValue]);

  const value = useSyncExternalStore(
    subscribe,
    getSnapshot,
    () => initialValue
  );

  const setValue = useCallback(
    (newValue: T | ((prev: T) => T)) => {
      if (typeof window === "undefined") return;

      try {
        const storage = window[storageType];
        const valueToStore =
          typeof newValue === "function"
            ? (newValue as (prev: T) => T)(cachedRef.current)
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

        cachedRef.current = valueToStore;

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
    },
    [key, storageType]
  );

  return [value, setValue] as const;
}

export default useStorage;
