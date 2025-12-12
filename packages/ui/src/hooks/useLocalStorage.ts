"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Hook for reading and writing to localStorage with SSR safety.
 * Automatically syncs across tabs via the storage event.
 *
 * @param key - The localStorage key
 * @param initialValue - The initial value if nothing is stored
 * @returns A tuple of [storedValue, setValue, removeValue]
 *
 * @example
 * ```tsx
 * const [theme, setTheme, removeTheme] = useLocalStorage("theme", "light");
 * ```
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: T | ((val: T) => T)) => void, () => void] {
  // Get initial value from localStorage or use provided initial value
  const readValue = useCallback((): T => {
    // SSR safety check
    if (typeof window === "undefined") {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  }, [initialValue, key]);

  const [storedValue, setStoredValue] = useState<T>(initialValue);

  // Read the actual value after mount (SSR safety)
  useEffect(() => {
    setStoredValue(readValue());
  }, [readValue]);

  // Setter function that persists to localStorage
  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        // Allow value to be a function for same API as useState
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);

        if (typeof window !== "undefined") {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
          // Dispatch storage event for cross-tab sync
          window.dispatchEvent(
            new StorageEvent("storage", {
              key,
              newValue: JSON.stringify(valueToStore),
            }),
          );
        }
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue],
  );

  // Remove the key from localStorage
  const removeValue = useCallback(() => {
    try {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(key);
        window.dispatchEvent(
          new StorageEvent("storage", {
            key,
            newValue: null,
          }),
        );
      }
      setStoredValue(initialValue);
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  }, [initialValue, key]);

  // Sync across tabs
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key && event.newValue !== null) {
        try {
          setStoredValue(JSON.parse(event.newValue) as T);
        } catch {
          // Ignore parse errors
        }
      } else if (event.key === key && event.newValue === null) {
        setStoredValue(initialValue);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [initialValue, key]);

  return [storedValue, setValue, removeValue];
}
