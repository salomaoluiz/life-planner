import { useEffect, useState } from "react";

// Spec 105 FR 29: the simulate and preview calls wait 400 ms after the last change.
export const PREVIEW_DEBOUNCE_MS = 400;

function useDebouncedValue<T>(value: T, delay = PREVIEW_DEBOUNCE_MS): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

export default useDebouncedValue;
