import { useEffect } from 'react';
import { useLocation } from 'wouter';

export function usePageTracking() {
  const [location] = useLocation();

  useEffect(() => {
    fetch('/api/track-visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: location,
        userAgent: navigator.userAgent,
      }),
    }).catch(console.error);
  }, [location]);
}
