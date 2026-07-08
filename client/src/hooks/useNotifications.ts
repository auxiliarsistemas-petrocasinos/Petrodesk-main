import { useState, useCallback, useEffect } from 'react';
import { api } from '../lib/api';
import { showToast } from '../components/Toast';

export function useNotifications(pollIntervalMs = 30000) {
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/notifications');
      setNotifications(response || []);
    } catch (err: any) {
      showToast(err.message || 'Error al cargar notificaciones', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await api.get('/notifications/unread-count');
      setUnreadCount(response?.count || 0);
    } catch (err: any) {
      console.error('Error al cargar conteo de notificaciones', err);
    }
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err: any) {
      showToast(err.message || 'Error al marcar notificación como leída', 'error');
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.post('/notifications/read-all');
      setNotifications((prev) =>
        prev.map((n) => (!n.readAt ? { ...n, readAt: new Date().toISOString() } : n))
      );
      setUnreadCount(0);
      showToast('Todas las notificaciones marcadas como leídas', 'success');
    } catch (err: any) {
      showToast(err.message || 'Error al marcar todas las notificaciones', 'error');
    }
  };

  // Set up polling
  useEffect(() => {
    fetchUnreadCount();
    
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, pollIntervalMs);

    return () => clearInterval(interval);
  }, [fetchUnreadCount, pollIntervalMs]);

  return {
    loading,
    notifications,
    unreadCount,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
  };
}
