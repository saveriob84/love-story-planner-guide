
import { useCallback, useRef, useEffect } from 'react';

export const useDebounce = (callback: (...args: any[]) => Promise<void>, delay: number) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const activeCallRef = useRef<boolean>(false);
  const mountedRef = useRef<boolean>(true);

  // Track component mount status
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const debouncedCallback = useCallback(async (...args: any[]) => {
    // If component is unmounted, don't proceed
    if (!mountedRef.current) {
      return;
    }

    // If there's already an active call, don't start a new one
    if (activeCallRef.current) {
      console.log("Call already in progress, ignoring duplicate attempt");
      return;
    }

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // Set up new timeout
    timeoutRef.current = setTimeout(async () => {
      if (!mountedRef.current) {
        return;
      }
      
      activeCallRef.current = true;
      try {
        await callback(...args);
      } finally {
        if (mountedRef.current) {
          activeCallRef.current = false;
        }
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

  // Auto cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return { 
    debouncedCallback, 
    cleanup, 
    isActive: () => activeCallRef.current 
  };
};
