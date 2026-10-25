import { useState, useEffect } from "react";

/* Returns the current Date, computed once after mount via a timer effect —
   keeps render pure for the React Compiler while staying current. */
export function useNow() {
  const [now, setNow] = useState(null);
  useEffect(() => {
    const tick = () => setNow(new Date());
    const id = setInterval(tick, 60_000); // also ticks every minute
    tick();
    return () => clearInterval(id);
  }, []);
  return now;
}
