import { useState, useCallback } from 'react';
import { api } from '../lib/api';
import { showToast } from '../components/Toast';

export function useDashboard() {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<any>(null);

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/dashboard/summary');
      setSummary(response || null);
    } catch (err: any) {
      showToast(err.message || 'Error al cargar resumen del dashboard', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    summary,
    fetchSummary,
  };
}
