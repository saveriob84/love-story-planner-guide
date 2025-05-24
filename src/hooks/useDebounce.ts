
import { useCallback, useRef } from 'react';

export const useDebounce = (callback: (...args: any[]) => Promise<void>, delay: number) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const activeCallRef = useRef<boolean>(false);

  const debouncedCallback = useCallback(async (...args: any[]) => {
    // If there's already an active call, don't start a new one
    if (activeCallRef.current) {
      console.log("Login already in progress, ignoring duplicate attempt");
      return;
    }

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set up new timeout
    timeoutRef.current = setTimeout(async () => {
      activeCallRef.current = true;
      try {
        await callback(...args);
      } finally {
        activeCallRef.current = false;
      }
    }, delay);
  }, [callback, delay]);

  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    activeCallRef.current = false;
  }, []);

  return { debouncedCallback, cleanup, isActive: () => activeCallRef.current };
};
