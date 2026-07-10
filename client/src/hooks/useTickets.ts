import { useState, useCallback } from 'react';
import { api } from '../lib/api';
import { showToast } from '../components/Toast';

export function useTickets() {
  const [loading, setLoading] = useState(false);
  const [tickets, setTickets] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchTickets = useCallback(async (filters: {
    status?: string;
    priority?: string;
    assignedToId?: string;
    fieldId?: string;
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

      const response = await api.get(`/tickets?${queryParams.toString()}`);
      setTickets(response.data || []);
      setTotalPages(response.totalPages || 1);
      setTotal(response.total || 0);
    } catch (err: any) {
      showToast(err.message || 'Error al cargar tickets', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  const createTicket = async (data: { title: string; description: string; priority: string; fieldId?: string }) => {
    setLoading(true);
    try {
      const response = await api.post('/tickets', data);
      showToast('Ticket creado exitosamente', 'success');
      return response;
    } catch (err: any) {
      showToast(err.message || 'Error al crear ticket', 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateTicket = async (id: string, data: { title?: string; description?: string; status?: string; priority?: string; fieldId?: string; assignedToId?: string }) => {
    setLoading(true);
    try {
      const response = await api.patch(`/tickets/${id}`, data);
      showToast('Ticket actualizado exitosamente', 'success');
      return response;
    } catch (err: any) {
      showToast(err.message || 'Error al actualizar ticket', 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteTicket = async (id: string) => {
    try {
      const response = await api.delete(`/tickets/${id}`);
      showToast('Ticket eliminado correctamente', 'success');
      return response;
    } catch (err: any) {
      showToast(err.message || 'Error al eliminar ticket', 'error');
      throw err;
    }
  };

  const assignTicket = async (id: string, assignedToId: string) => {
    setLoading(true);
    try {
      const response = await api.post(`/tickets/${id}/assign`, { assignedToId });
      showToast('Ticket asignado exitosamente', 'success');
      return response;
    } catch (err: any) {
      showToast(err.message || 'Error al asignar ticket', 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addComment = async (id: string, comment: string) => {
    try {
      const response = await api.post(`/tickets/${id}/comments`, { comment });
      return response;
    } catch (err: any) {
      showToast(err.message || 'Error al agregar comentario', 'error');
      throw err;
    }
  };

  return {
    loading,
    tickets,
    totalPages,
    total,
    fetchTickets,
    createTicket,
    updateTicket,
    deleteTicket,
    assignTicket,
    addComment,
  };
}
