import { useEffect, useRef } from 'react';

/**
 * A hook that automatically resets loading state after a timeout
 * to prevent pages from getting stuck in loading state
 */
export function useTimeoutLoading(
  loading: boolean,
  setLoading: (loading: boolean) => void,
  timeoutMs: number = 5000
) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (loading) {
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Set new timeout
      timeoutRef.current = setTimeout(() => {
        console.log(`⏰ useTimeoutLoading - Loading timeout triggered after ${timeoutMs}ms, forcing loading to false`);
        setLoading(false);
      }, timeoutMs);
    } else {
      // Clear timeout when loading is false
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }
    
    // Cleanup function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [loading, setLoading, timeoutMs]);
}