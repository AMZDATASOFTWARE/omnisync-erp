import { useEffect, useState } from "react";

const read = (key) => {
  try { return JSON.parse(localStorage.getItem(key)) || null; } catch { return null; }
};

// Carrega dados do cache local imediatamente e atualiza quando a rede responder.
export function useOfflineCache(key, loader) {
  const cached = read(key);
  const [data, setData] = useState(cached?.data ?? null);
  const [fromCache, setFromCache] = useState(!!cached);
  const [updatedAt, setUpdatedAt] = useState(cached?.at || null);
  const [loading, setLoading] = useState(!cached);

  useEffect(() => {
    let alive = true;
    loader()
      .then((fresh) => {
        if (!alive) return;
        const at = new Date().toISOString();
        localStorage.setItem(key, JSON.stringify({ at, data: fresh }));
        setData(fresh);
        setFromCache(false);
        setUpdatedAt(at);
        setLoading(false);
      })
      .catch(() => alive && setLoading(false));
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return { data, loading, fromCache, updatedAt };
}