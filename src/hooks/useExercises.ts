import { useEffect, useState } from 'react';
import { fetchExercises, readCachedExercises, type Catalog } from '../services/exercises';

export function useExercises() {
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    setLoading(true); setError('');
    async function load() {
      try {
        const result = await fetchExercises(controller.signal);
        if (active) setCatalog(result);
      } catch (e) {
        if (!active) return;
        const cached = await readCachedExercises().catch(() => null);
        if (!active) return;
        setCatalog(cached);
        setError(controller.signal.aborted ? 'A consulta demorou mais que o esperado. Verifique sua conexão.'
          : e instanceof Error ? e.message : 'Verifique sua conexão e tente novamente.');
      } finally {
        clearTimeout(timeout);
        if (active) setLoading(false);
      }
    }
    void load();
    return () => { active = false; clearTimeout(timeout); controller.abort(); };
  }, [attempt]);
  return { catalog, loading, error, retry: () => setAttempt(value => value + 1) };
}
