"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Hook for reading and writing to localStorage with SSR safety.
 * Automatically syncs across tabs via the storage event.
 *
 * @param key - The localStorage key (pass null to disable)
 * @param initialValue - The initial value if nothing is stored
 * @returns A tuple of [storedValue, setValue, removeValue, isLoaded]
 *
 * **Breaking Change (v0.16+):** Return type changed from 3-tuple to 4-tuple.
 * The `isLoaded` boolean is now the 4th element, indicating when localStorage
 * has been read and state is hydrated. This is important for SSR compatibility.
 *
 * @example
 * ```tsx
 * // Destructure the 4-tuple
 * const [theme, setTheme, removeTheme, isLoaded] = useLocalStorage("theme", "light");
 * 
 * // Only render when loaded (SSR safe)
 * if (!isLoaded) return <Skeleton />;
 * ```
 */
export function useLocalStorage<T>(
  key: string | null | undefined,
  initialValue: T,
): [T, (value: T | ((val: T) => T)) => void, () => void, boolean] {
  // Get initial value from localStorage or use provided initial value
  const readValue = useCallback((): T => {
    // SSR safety check
    if (typeof window === "undefined" || !key) {
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
  const [isLoaded, setIsLoaded] = useState(false);

  // Read the actual value after mount (SSR safety)
  useEffect(() => {
    setStoredValue(readValue());
    setIsLoaded(true);
  }, [readValue]);

  // Setter function that persists to localStorage
  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        setStoredValue((prevStoredValue) => {
          // Allow value to be a function for same API as useState
          const valueToStore =
            value instanceof Function ? value(prevStoredValue) : value;

          if (typeof window !== "undefined" && key) {
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
            // Dispatch storage event for cross-tab sync
            // Note: This fires synchronously but in the state updater, ensuring
            // the value has been set before other tabs are notified.
            // Cross-tab synchronization is validated through the storage event listener below.
            window.dispatchEvent(
              new StorageEvent("storage", {
                key,
                newValue: JSON.stringify(valueToStore),
              }),
            );
          }

          return valueToStore;
        });
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key],
  );

  // Remove the key from localStorage
  const removeValue = useCallback(() => {
    try {
      if (typeof window !== "undefined" && key) {
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
    if (!key) return;

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

  return [storedValue, setValue, removeValue, isLoaded];
}
