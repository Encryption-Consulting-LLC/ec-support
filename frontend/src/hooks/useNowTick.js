import { useEffect, useState } from "react";

/**
 * Force a re-render on an interval so relative timestamps ("5m ago")
 * stay honest on a page left open — a support portal is a park-it-and-
 * watch page. Without this the text freezes at load time while sorting
 * (which uses the raw ISO values) stays correct, so the list looks fine
 * and reads wrong: the hardest kind of stale to notice.
 *
 * One interval per COMPONENT, not per timestamp — a 200-row table with
 * two date columns would otherwise spin up 400 timers.
 */
export function useNowTick(intervalMs = 60000) {
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
}
