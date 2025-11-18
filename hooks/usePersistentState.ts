import React, { useState, useEffect } from 'react';

export function usePersistentState<T,>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    try {
      const storedValue = window.localStorage.getItem(key);
      if (storedValue) {
        const parsed = JSON.parse(storedValue);
        // If parsed value is null, but initial value is not, it's a potential corruption.
        // Fallback to initialValue to prevent app crash.
        if (parsed === null && initialValue !== null) {
          return initialValue;
        }
        return parsed;
      }
      return initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key “${key}”:`, error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing to localStorage key “${key}”:`, error);
    }
  }, [key, value]);

  return [value, setValue];
}
