import { useState, useEffect } from 'react';

export function useSlowFetch(loading: boolean, delayMs = 8000): boolean {
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    if (!loading) { setSlow(false); return; }
    const t = setTimeout(() => setSlow(true), delayMs);
    return () => clearTimeout(t);
  }, [loading, delayMs]);
  return slow;
}
