import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Plus, Search, ChevronLeft, ChevronRight, Ticket as TicketIcon,
  MessageSquare, Clock, User, Send, Eye, Pencil, Trash2, X
} from 'lucide-react'
import Modal from '../components/Modal'
import { useTickets } from '../hooks/useTickets'
import { api } from '../lib/api'
import { showToast } from '../components/Toast'

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  OPEN: { label: 'Abierto', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900/50' },
  IN_PROGRESS: { label: 'En Progreso', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50' },
  ESCALATED: { label: 'Escalado', color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/50' },
  CLOSED: { label: 'Cerrado', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/50' },
}

const priorityConfig: Record<string, { label: string; color: string; bg: string }> = {
  LOW: { label: 'Baja', color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700' },
  MEDIUM: { label: 'Media', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900/50' },
  HIGH: { label: 'Alta', color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-900/50' },
  CRITICAL: { label: 'Crítica', color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/50' },
}

function StatusBadge({ status }: { status: string }) {
  const cfg = statusConfig[status] || statusConfig.OPEN
  return <span className={`inline-flex items-center px-2.5 py-1 text-xs font-bold rounded-lg border ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>
}

function PriorityBadge({ priority }: { priority: string }) {
  const cfg = priorityConfig[priority] || priorityConfig.LOW
  return <span className={`inline-flex items-center px-2.5 py-1 text-xs font-bold rounded-lg border ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>
}

export default function Tickets() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { tickets, loading, totalPages, total, fetchTickets, createTicket, updateTicket, deleteTicket, assignTicket, addComment } = useTickets()

  // Filters
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '')
  const [priorityFilter, setPriorityFilter] = useState(searchParams.get('priority') || '')
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')
  const [page, setPage] = useState(1)

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<any>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)

  // Create Form
  const emptyForm = { title: '', description: '', priority: 'LOW', fieldId: '', status: 'OPEN', assignedToId: '' }
  const [createForm, setCreateForm] = useState(emptyForm)

  // Detail state
  const [newComment, setNewComment] = useState('')
  const [users, setUsers] = useState<any[]>([])
  const [fields, setFields] = useState<any[]>([])

  // Load reference data
  useEffect(() => {
    api.get('/users/options').then(data => setUsers(Array.isArray(data) ? data : [])).catch(() => {})
    api.get('/fields').then(data => setFields(Array.isArray(data) ? data : [])).catch(() => {})
    api.get('/tickets/permissions').then(data => setIsAdmin(data?.canManage === true)).catch(() => setIsAdmin(false))
  }, [])

  const loadTickets = useCallback(() => {
    fetchTickets({ status: statusFilter, priority: priorityFilter, search: searchQuery, page, pageSize: 15 })
  }, [fetchTickets, statusFilter, priorityFilter, searchQuery, page])

  useEffect(() => { loadTickets() }, [loadTickets])

  // Sync filters to URL
  useEffect(() => {
    const params: Record<string, string> = {}
    if (statusFilter) params.status = statusFilter
    if (priorityFilter) params.priority = priorityFilter
    if (searchQuery) params.search = searchQuery
    setSearchParams(params, { replace: true })
  }, [statusFilter, priorityFilter, searchQuery, setSearchParams])

  const openDetail = async (id: string) => {
    setDetailLoading(true)
    try {
      const data = await api.get(`/tickets/${id}`)
      setSelectedTicket(data)
    } catch (err: any) {
      showToast(err.message || 'Error al cargar ticket', 'error')
    } finally {
      setDetailLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingId) await updateTicket(editingId, createForm)
      else await createTicket(createForm)
      setCreateForm(emptyForm)
      setEditingId(null)
      setIsCreateOpen(false)
      loadTickets()
    } catch {}
  }

  const openCreate = () => {
    setEditingId(null)
    setCreateForm(emptyForm)
    setIsCreateOpen(true)
  }

  const openEdit = (ticket: any) => {
    setEditingId(ticket.id)
    setCreateForm({
      title: ticket.title || '',
      description: ticket.description || '',
      priority: ticket.priority || 'LOW',
      fieldId: ticket.fieldId || '',
      status: ticket.status || 'OPEN',
      assignedToId: ticket.assignedToId || '',
    })
    setSelectedTicket(null)
    setIsCreateOpen(true)
  }

  const closeForm = () => {
    setIsCreateOpen(false)
    setEditingId(null)
    setCreateForm(emptyForm)
  }

  const handleDelete = async (ticket: any) => {
    if (!window.confirm(`¿Eliminar definitivamente el ticket "${ticket.title}"?`)) return
    setDeletingId(ticket.id)
    try {
      await deleteTicket(ticket.id)
      setSelectedTicket(null)
      loadTickets()
    } catch {} finally {
      setDeletingId(null)
    }
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateTicket(id, { status: newStatus })
      loadTickets()
      if (selectedTicket?.id === id) openDetail(id)
    } catch {}
  }

  const handleAssign = async (ticketId: string, userId: string) => {
    try {
      await assignTicket(ticketId, userId)
      loadTickets()
      if (selectedTicket?.id === ticketId) openDetail(ticketId)
    } catch {}
  }

  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedTicket) return
    try {
      await addComment(selectedTicket.id, newComment)
      setNewComment('')
      openDetail(selectedTicket.id)
    } catch {}
  }

  const getUserDisplayName = (u: any) =>
    u ? (u.firstName ? `${u.firstName} ${u.lastName || ''}`.trim() : u.username) : 'Sin asignar'

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight italic uppercase">Tickets de Soporte</h2>
          <p className="text-slate-500 dark:text-slate-400">Gestión de solicitudes de soporte técnico y operativo</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#FF6A23] hover:bg-[#e55a1d] text-white font-bold rounded-2xl shadow-lg shadow-orange-500/20 transition-all hover:scale-[1.02]"
        >
          <Plus size={18} /> Nuevo Ticket
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row gap-3 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setPage(1) }}
            placeholder="Buscar por título o descripción..."
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF6A23]/30 focus:border-[#FF6A23] transition-all"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
          className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#FF6A23]/30"
        >
          <option value="">Todos los estados</option>
          <option value="OPEN">Abierto</option>
          <option value="IN_PROGRESS">En Progreso</option>
          <option value="ESCALATED">Escalado</option>
          <option value="CLOSED">Cerrado</option>
        </select>
        <select
          value={priorityFilter}
          onChange={e => { setPriorityFilter(e.target.value); setPage(1) }}
          className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#FF6A23]/30"
        >
          <option value="">Todas las prioridades</option>
          <option value="LOW">Baja</option>
          <option value="MEDIUM">Media</option>
          <option value="HIGH">Alta</option>
          <option value="CRITICAL">Crítica</option>
        </select>
        {(statusFilter || priorityFilter || searchQuery) && (
          <button
            onClick={() => { setStatusFilter(''); setPriorityFilter(''); setSearchQuery(''); setPage(1) }}
            className="px-4 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors flex items-center gap-1"
          >
            <X size={14} /> Limpiar
          </button>
        )}
      </div>

      {/* Content */}
      {loading && tickets.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-[#FF6A23] border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-500 dark:text-slate-400 font-medium">Cargando tickets...</p>
          </div>
        </div>
      ) : tickets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 bg-orange-100 dark:bg-orange-950/30 rounded-full flex items-center justify-center text-[#FF6A23] mb-4">
            <TicketIcon size={40} />
          </div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">No hay tickets</h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-6">
            {searchQuery || statusFilter || priorityFilter
              ? 'No se encontraron tickets con los filtros seleccionados.'
              : 'Aún no se han creado tickets. Crea el primero.'}
          </p>
          {!searchQuery && !statusFilter && !priorityFilter && (
            <button
              onClick={openCreate}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#FF6A23] hover:bg-[#e55a1d] text-white font-bold rounded-2xl shadow-lg shadow-orange-500/20 transition-all"
            >
              <Plus size={18} /> Crear Ticket
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Tickets Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800">
                    <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Título</th>
                    <th className="text-left px-4 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Estado</th>
                    <th className="text-left px-4 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Prioridad</th>
                    <th className="text-left px-4 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Asignado a</th>
                    <th className="text-left px-4 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Creado</th>
                    <th className="text-right px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((ticket: any) => (
                    <tr
                      key={ticket.id}
                      onClick={() => openDetail(ticket.id)}
                      className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 cursor-pointer transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-800 dark:text-white group-hover:text-[#FF6A23] transition-colors">{ticket.title}</div>
                        <div className="text-xs text-slate-400 dark:text-slate-500 line-clamp-1 mt-0.5">{ticket.description}</div>
                      </td>
                      <td className="px-4 py-4"><StatusBadge status={ticket.status} /></td>
                      <td className="px-4 py-4"><PriorityBadge priority={ticket.priority} /></td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-xs font-bold text-slate-500 dark:text-slate-400">
                            {ticket.assignedTo ? (ticket.assignedTo.firstName?.[0] || ticket.assignedTo.username[0]).toUpperCase() : '?'}
                          </div>
                          <span className="text-slate-600 dark:text-slate-300 text-sm">{getUserDisplayName(ticket.assignedTo)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap">
                        {new Date(ticket.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button type="button" onClick={event => { event.stopPropagation(); openDetail(ticket.id) }} className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition-colors" title="Ver ticket" aria-label={`Ver ticket ${ticket.title}`}><Eye size={16} /></button>
                          {isAdmin && <>
                            <button type="button" onClick={event => { event.stopPropagation(); openEdit(ticket) }} className="p-2 text-slate-400 hover:text-[#FF6A23] hover:bg-orange-50 dark:hover:bg-orange-950/30 rounded-lg transition-colors" title="Editar ticket" aria-label={`Editar ticket ${ticket.title}`}><Pencil size={16} /></button>
                            <button type="button" disabled={deletingId === ticket.id} onClick={event => { event.stopPropagation(); handleDelete(ticket) }} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors disabled:opacity-40" title="Eliminar ticket" aria-label={`Eliminar ticket ${ticket.title}`}><Trash2 size={16} /></button>
                          </>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-800">
                <span className="text-sm text-slate-500 dark:text-slate-400">{total} tickets en total</span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage(p => p - 1)}
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 disabled:opacity-30 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300 px-3">{page} / {totalPages}</span>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage(p => p + 1)}
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 disabled:opacity-30 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Create Modal */}
      <Modal isOpen={isCreateOpen} onClose={closeForm} title={editingId ? 'Editar Ticket' : 'Nuevo Ticket'}>
        <form onSubmit={handleCreate} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Título *</label>
            <input
              required
              value={createForm.title}
              onChange={e => setCreateForm(f => ({ ...f, title: e.target.value }))}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A23]/30 focus:border-[#FF6A23] text-slate-800 dark:text-white"
              placeholder="Ej: Error en impresora de oficina"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Descripción *</label>
            <textarea
              required
              rows={4}
              value={createForm.description}
              onChange={e => setCreateForm(f => ({ ...f, description: e.target.value }))}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A23]/30 focus:border-[#FF6A23] text-slate-800 dark:text-white resize-none"
              placeholder="Describe el problema o solicitud con detalle..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Prioridad</label>
              <select
                value={createForm.priority}
                onChange={e => setCreateForm(f => ({ ...f, priority: e.target.value }))}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A23]/30 text-slate-800 dark:text-white"
              >
                <option value="LOW">Baja</option>
                <option value="MEDIUM">Media</option>
                <option value="HIGH">Alta</option>
                <option value="CRITICAL">Crítica</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Campo (opcional)</label>
              <select
                value={createForm.fieldId}
                onChange={e => setCreateForm(f => ({ ...f, fieldId: e.target.value }))}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A23]/30 text-slate-800 dark:text-white"
              >
                <option value="">Sin campo</option>
                {fields.map((f: any) => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
            </div>
          </div>
          {editingId && <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Estado</label>
              <select value={createForm.status} onChange={e => setCreateForm(f => ({ ...f, status: e.target.value }))} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white">
                <option value="OPEN">Abierto</option><option value="IN_PROGRESS">En Progreso</option><option value="ESCALATED">Escalado</option><option value="CLOSED">Cerrado</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Asignar a</label>
              <select value={createForm.assignedToId} onChange={e => setCreateForm(f => ({ ...f, assignedToId: e.target.value }))} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white">
                <option value="">Sin asignar</option>{users.map((u: any) => <option key={u.id} value={u.id}>{getUserDisplayName(u)}</option>)}
              </select>
            </div>
          </div>}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button type="button" onClick={closeForm} className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl transition-all">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="px-5 py-2.5 bg-[#FF6A23] hover:bg-[#e55a1d] text-white font-bold rounded-xl shadow-lg shadow-orange-500/10 transition-all disabled:opacity-50">
              {editingId ? 'Guardar Cambios' : 'Crear Ticket'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Detail Modal */}
      <Modal isOpen={!!selectedTicket} onClose={() => setSelectedTicket(null)} title={selectedTicket?.title || 'Detalle del Ticket'}>
        {detailLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-10 h-10 border-4 border-[#FF6A23] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : selectedTicket ? (
          <div className="space-y-6">
            {/* Badges */}
            <div className="flex items-center gap-3 flex-wrap">
              <StatusBadge status={selectedTicket.status} />
              <PriorityBadge priority={selectedTicket.priority} />
              {selectedTicket.field && (
                <span className="inline-flex items-center px-2.5 py-1 text-xs font-bold rounded-lg border bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                  📍 {selectedTicket.field.name}
                </span>
              )}
            </div>

            {/* Description */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{selectedTicket.description}</p>
            </div>

            {/* Meta */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <User size={14} />
                <span>Creado por: <b className="text-slate-700 dark:text-slate-200">{getUserDisplayName(selectedTicket.createdBy)}</b></span>
              </div>
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <Clock size={14} />
                <span>{new Date(selectedTicket.createdAt).toLocaleString('es-ES')}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div className="flex-1 min-w-[140px]">
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Estado</label>
                <select
                  value={selectedTicket.status}
                  onChange={e => handleStatusChange(selectedTicket.id, e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A23]/30 text-slate-800 dark:text-white"
                >
                  <option value="OPEN">Abierto</option>
                  <option value="IN_PROGRESS">En Progreso</option>
                  <option value="ESCALATED">Escalado</option>
                  <option value="CLOSED">Cerrado</option>
                </select>
              </div>
              <div className="flex-1 min-w-[140px]">
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Asignar a</label>
                <select
                  value={selectedTicket.assignedToId || ''}
                  onChange={e => handleAssign(selectedTicket.id, e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A23]/30 text-slate-800 dark:text-white"
                >
                  <option value="">Sin asignar</option>
                  {users.map((u: any) => <option key={u.id} value={u.id}>{getUserDisplayName(u)}</option>)}
                </select>
              </div>
            </div>

            {isAdmin && <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => openEdit(selectedTicket)} className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-[#FF6A23] hover:bg-orange-50 dark:hover:bg-orange-950/20 rounded-xl transition-colors"><Pencil size={15} /> Editar ticket</button>
              <button type="button" disabled={deletingId === selectedTicket.id} onClick={() => handleDelete(selectedTicket)} className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-colors disabled:opacity-40"><Trash2 size={15} /> Eliminar ticket</button>
            </div>}

            {/* Comments */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <MessageSquare size={16} className="text-[#FF6A23]" /> Comentarios ({selectedTicket.comments?.length || 0})
              </h4>

              <div className="max-h-[250px] overflow-y-auto space-y-3 pr-1 custom-scrollbar">
                {(selectedTicket.comments || []).map((c: any) => (
                  <div key={c.id} className="flex gap-3 items-start">
                    <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-xs font-bold text-slate-500 dark:text-slate-400 shrink-0">
                      {(c.user?.firstName?.[0] || c.user?.username?.[0] || '?').toUpperCase()}
                    </div>
                    <div className="flex-1 bg-slate-50 dark:bg-slate-800/50 rounded-2xl px-4 py-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{getUserDisplayName(c.user)}</span>
                        <span className="text-xs text-slate-400 dark:text-slate-500">
                          {new Date(c.createdAt).toLocaleString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-300">{c.comment}</p>
                    </div>
                  </div>
                ))}
                {(!selectedTicket.comments || selectedTicket.comments.length === 0) && (
                  <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-4">No hay comentarios aún.</p>
                )}
              </div>

              {/* Add Comment */}
              <div className="flex gap-2">
                <input
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddComment() } }}
                  placeholder="Escribe un comentario..."
                  className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A23]/30 text-slate-800 dark:text-white"
                />
                <button
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                  className="p-2.5 bg-[#FF6A23] hover:bg-[#e55a1d] text-white rounded-xl transition-all disabled:opacity-30 shadow-lg shadow-orange-500/10"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  )
}
