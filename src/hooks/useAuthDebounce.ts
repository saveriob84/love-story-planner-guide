
import { useCallback, useRef } from 'react';

export const useAuthDebounce = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 300
): T => {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const lastCallRef = useRef<number>(0);

  return useCallback(
    ((...args: Parameters<T>) => {
      const now = Date.now();
      
      // If called too frequently, use debouncing
      if (now - lastCallRef.current < delay) {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        
        timeoutRef.current = setTimeout(() => {
          lastCallRef.current = Date.now();
          callback(...args);
        }, delay);
      } else {
        // Execute immediately if enough time has passed
        lastCallRef.current = now;
        callback(...args);
      }
    }) as T,
    [callback, delay]
  );
};
