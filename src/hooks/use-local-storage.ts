import { useState, useCallback } from 'react';

/**
 * Persist state to localStorage with automatic serialization.
 * Falls back to initialValue if localStorage is unavailable or contains invalid data.
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((prev) => {
        const valueToStore = value instanceof Function ? value(prev) : value;
        try {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch {
          console.warn(`Failed to save to localStorage key "${key}"`);
        }
        return valueToStore;
      });
    },
    [key]
  );

  return [storedValue, setValue];
}
