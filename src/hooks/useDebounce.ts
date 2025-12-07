import { useState, useEffect } from 'react';

/**
 * Debounce hook - delays updating a value until after a specified delay
 * Useful for autosave, search, and other operations that should wait for user to finish typing
 *
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds before updating
 * @returns Debounced value
 *
 * @example
 * const SearchComponent = () => {
 *   const [searchTerm, setSearchTerm] = useState('');
 *   const debouncedSearchTerm = useDebounce(searchTerm, 500);
 *
 *   useEffect(() => {
 *     // API call with debouncedSearchTerm
 *   }, [debouncedSearchTerm]);
 * }
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
