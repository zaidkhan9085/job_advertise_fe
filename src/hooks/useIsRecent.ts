import { useState, useEffect } from "react";

const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

// Date.now() is impure and can't be called during render — defer the "is this
// recent" check to an effect instead (checking current time is a side effect).
export function useIsRecent(dateString: string) {
  const [isRecent, setIsRecent] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reading the current time (an external, non-React source) on mount, not duplicated React state
    setIsRecent(Date.now() - new Date(dateString).getTime() < THREE_DAYS_MS);
  }, [dateString]);

  return isRecent;
}
