import { useState, useCallback } from 'react';
import { api } from '../lib/api';
import { showToast } from '../components/Toast';

export function useAssets() {
  const [loading, setLoading] = useState(false);
  const [assets, setAssets] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchAssets = useCallback(async (filters: {
    status?: string;
    brand?: string;
    fieldId?: string;
    assignedUserId?: string;
    search?: string;
    page?: number;
    pageSize?: number;
  } = {}) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          queryParams.append(key, val.toString());
        }
      });

      const response = await api.get(`/assets?${queryParams.toString()}`);
      setAssets(response.data || []);
      setTotalPages(response.totalPages || 1);
      setTotal(response.total || 0);
    } catch (err: any) {
      showToast(err.message || 'Error al cargar activos', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  const createAsset = async (data: { internalCode: string; serial: string; brand: string; model: string; status?: string; fieldId?: string; assignedUserId?: string }) => {
    setLoading(true);
    try {
      const response = await api.post('/assets', data);
      showToast('Activo creado exitosamente', 'success');
      return response;
    } catch (err: any) {
      showToast(err.message || 'Error al crear activo', 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateAsset = async (id: string, data: { internalCode?: string; serial?: string; brand?: string; model?: string; status?: string; fieldId?: string; assignedUserId?: string }) => {
    setLoading(true);
    try {
      const response = await api.patch(`/assets/${id}`, data);
      showToast('Activo actualizado exitosamente', 'success');
      return response;
    } catch (err: any) {
      showToast(err.message || 'Error al actualizar activo', 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const changeAssetStatus = async (id: string, status: string) => {
    setLoading(true);
    try {
      const response = await api.patch(`/assets/${id}/status`, { status });
      showToast('Estado del activo actualizado', 'success');
      return response;
    } catch (err: any) {
      showToast(err.message || 'Error al cambiar estado del activo', 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const assignAsset = async (id: string, body: { assignedUserId?: string; fieldId?: string }) => {
    setLoading(true);
    try {
      const response = await api.post(`/assets/${id}/assign`, body);
      showToast('Asignación del activo actualizada', 'success');
      return response;
    } catch (err: any) {
      showToast(err.message || 'Error al asignar activo', 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    assets,
    totalPages,
    total,
    fetchAssets,
    createAsset,
    updateAsset,
    changeAssetStatus,
    assignAsset,
  };
}
