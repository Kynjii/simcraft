import { useEffect } from 'react';

declare global {
  interface Window {
    $WowheadPower?: { refreshLinks: () => void };
  }
}

export function useWowheadTooltips(deps: unknown[] = []) {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.$WowheadPower?.refreshLinks();
    }, 100);
    return () => clearTimeout(timer);
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps
}
