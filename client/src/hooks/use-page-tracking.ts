import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { queryClient } from '@/lib/queryClient';

const VISIT_TRACKED_STORAGE_KEY = 'avolink:visit-tracked';

export function usePageTracking() {
  const [location] = useLocation();

  useEffect(() => {
    const currentPath = `${window.location.pathname}${window.location.search}` || location || '/';

    const notifyStats = () => {
      queryClient.invalidateQueries({ queryKey: ['/api/analytics/stats'] });
      try {
        window.localStorage.setItem(VISIT_TRACKED_STORAGE_KEY, JSON.stringify({
          path: currentPath,
          timestamp: Date.now(),
        }));
      } catch {
        // Ignore storage errors and continue.
      }
    };

    const trackVisit = () => {
      fetch('/api/analytics/visit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: currentPath,
          userAgent: navigator.userAgent,
        }),
      })
        .then(() => {
          notifyStats();
        })
        .catch((error) => {
          console.error(error);
          notifyStats();
        });
    };

    const timer = window.setTimeout(trackVisit, 250);
    return () => window.clearTimeout(timer);
  }, [location]);
}
