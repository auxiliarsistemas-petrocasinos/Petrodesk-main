import { useState, useCallback } from 'react';
import { api } from '../lib/api';
import { showToast } from '../components/Toast';

export function useLoans() {
  const [loading, setLoading] = useState(false);
  const [loans, setLoans] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchLoans = useCallback(async (filters: {
    status?: string;
    userId?: string;
    assetId?: string;
    overdue?: boolean;
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

      const response = await api.get(`/loans?${queryParams.toString()}`);
      setLoans(response.data || []);
      setTotalPages(response.totalPages || 1);
      setTotal(response.total || 0);
    } catch (err: any) {
      showToast(err.message || 'Error al cargar préstamos', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  const createLoan = async (data: { assetId: string; userId: string; expectedReturnDate: string; notes?: string }) => {
    setLoading(true);
    try {
      const response = await api.post('/loans', data);
      showToast('Solicitud de préstamo creada', 'success');
      return response;
    } catch (err: any) {
      showToast(err.message || 'Error al solicitar préstamo', 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateLoan = async (id: string, data: { userId: string; expectedReturnDate: string; notes?: string }) => {
    try {
      const response = await api.patch(`/loans/${id}`, data);
      showToast('Prestamo actualizado correctamente', 'success');
      return response;
    } catch (err: any) {
      showToast(err.message || 'Error al actualizar prestamo', 'error');
      throw err;
    }
  };

  const deleteLoan = async (id: string) => {
    try {
      const response = await api.delete(`/loans/${id}`);
      showToast('Prestamo eliminado correctamente', 'success');
      return response;
    } catch (err: any) {
      showToast(err.message || 'Error al eliminar prestamo', 'error');
      throw err;
    }
  };

  const approveLoan = async (id: string) => {
    setLoading(true);
    try {
      const response = await api.post(`/loans/${id}/approve`);
      showToast('Préstamo aprobado', 'success');
      return response;
    } catch (err: any) {
      showToast(err.message || 'Error al aprobar préstamo', 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const rejectLoan = async (id: string, notes: string) => {
    setLoading(true);
    try {
      const response = await api.post(`/loans/${id}/reject`, { notes });
      showToast('Préstamo rechazado', 'success');
      return response;
    } catch (err: any) {
      showToast(err.message || 'Error al rechazar préstamo', 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deliverLoan = async (id: string, notes: string) => {
    setLoading(true);
    try {
      const response = await api.post(`/loans/${id}/deliver`, { notes });
      showToast('Activo entregado', 'success');
      return response;
    } catch (err: any) {
      showToast(err.message || 'Error al entregar activo', 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const returnLoan = async (id: string, condition: string, notes: string) => {
    setLoading(true);
    try {
      const response = await api.post(`/loans/${id}/return`, { condition, notes });
      showToast('Activo devuelto', 'success');
      return response;
    } catch (err: any) {
      showToast(err.message || 'Error al registrar devolución', 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    loans,
    totalPages,
    total,
    fetchLoans,
    createLoan,
    updateLoan,
    deleteLoan,
    approveLoan,
    rejectLoan,
    deliverLoan,
    returnLoan,
  };
}
