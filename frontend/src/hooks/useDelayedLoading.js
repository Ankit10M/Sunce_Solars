import { useState, useEffect, useRef } from 'react';

/**
 * useDelayedLoading — Ensures a minimum display time for skeleton loaders.
 *
 * When data fetches complete in <400ms on fast connections, skeletons flash
 * so quickly they feel broken. This hook keeps `isLoading` true for at least
 * `minDuration` ms after it first becomes true, giving the skeleton time to
 * render and animate before content appears.
 *
 * Usage:
 *   const showSkeleton = useDelayedLoading(loading, 400);
 *   if (showSkeleton) return <Skeleton />;
 *
 * @param {boolean} loading - The real loading state from your data fetch
 * @param {number}  minDuration - Minimum ms to keep skeleton visible (default 400)
 * @returns {boolean} - Whether to show the skeleton
 */
export function useDelayedLoading(loading, minDuration = 400) {
  const [showSkeleton, setShowSkeleton] = useState(loading);
  const startTimeRef = useRef(null);

  useEffect(() => {
    if (loading) {
      // Loading just started — record the timestamp and show skeleton
      startTimeRef.current = Date.now();
      setShowSkeleton(true);
    } else if (startTimeRef.current) {
      // Loading finished — wait for remaining minimum duration
      const elapsed = Date.now() - startTimeRef.current;
      const remaining = Math.max(0, minDuration - elapsed);

      if (remaining === 0) {
        setShowSkeleton(false);
      } else {
        const timer = setTimeout(() => setShowSkeleton(false), remaining);
        return () => clearTimeout(timer);
      }
    } else {
      // Never started loading (initial state is false)
      setShowSkeleton(false);
    }
  }, [loading, minDuration]);

  return showSkeleton;
}
