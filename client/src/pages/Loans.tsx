import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Plus, RefreshCw, ChevronLeft, ChevronRight, ArrowUpRight,
  X, Clock, AlertTriangle, CheckCircle, XCircle, Truck, CornerDownLeft,
  Package, User, Calendar
} from 'lucide-react'
import Modal from '../components/Modal'
import { useLoans } from '../hooks/useLoans'
import { api } from '../lib/api'
import { showToast } from '../components/Toast'

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  REQUESTED: { label: 'Solicitado', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900/50', icon: Clock },
  APPROVED: { label: 'Aprobado', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/50', icon: CheckCircle },
  DELIVERED: { label: 'Entregado', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50', icon: Truck },
  RETURNED: { label: 'Devuelto', color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700', icon: CornerDownLeft },
  REJECTED: { label: 'Rechazado', color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/50', icon: XCircle },
}

function StatusBadge({ status }: { status: string }) {
  const cfg = statusConfig[status] || statusConfig.REQUESTED
  const Icon = cfg.icon
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg border ${cfg.bg} ${cfg.color}`}>
      <Icon size={12} /> {cfg.label}
    </span>
  )
}

function isOverdue(loan: any) {
  if (loan.status !== 'DELIVERED') return false
  return new Date(loan.expectedReturnDate) < new Date()
}

function isExpiringSoon(loan: any) {
  if (loan.status !== 'DELIVERED') return false
  const now = new Date()
  const expected = new Date(loan.expectedReturnDate)
  const diff = expected.getTime() - now.getTime()
  return diff > 0 && diff <= 72 * 60 * 60 * 1000
}

export default function Loans() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { loans, loading, totalPages, total, fetchLoans, createLoan, approveLoan, rejectLoan, deliverLoan, returnLoan } = useLoans()

  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '')
  const [overdueFilter, setOverdueFilter] = useState(searchParams.get('overdue') === 'true')
  const [page, setPage] = useState(1)

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [selectedLoan, setSelectedLoan] = useState<any>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  const [createForm, setCreateForm] = useState({ assetId: '', userId: '', expectedReturnDate: '', notes: '' })
  const [actionNotes, setActionNotes] = useState('')
  const [returnCondition, setReturnCondition] = useState('GOOD')

  const [users, setUsers] = useState<any[]>([])
  const [availableAssets, setAvailableAssets] = useState<any[]>([])

  useEffect(() => {
    api.get('/users').then(data => setUsers(Array.isArray(data) ? data : [])).catch(() => {})
    api.get('/assets?status=AVAILABLE&pageSize=100').then(data => setAvailableAssets(data.data || [])).catch(() => {})
  }, [])

  const loadLoans = useCallback(() => {
    fetchLoans({ status: statusFilter, overdue: overdueFilter || undefined, page, pageSize: 15 })
  }, [fetchLoans, statusFilter, overdueFilter, page])

  useEffect(() => { loadLoans() }, [loadLoans])

  useEffect(() => {
    const params: Record<string, string> = {}
    if (statusFilter) params.status = statusFilter
    if (overdueFilter) params.overdue = 'true'
    setSearchParams(params, { replace: true })
  }, [statusFilter, overdueFilter, setSearchParams])

  const openDetail = async (id: string) => {
    setDetailLoading(true)
    try {
      const data = await api.get(`/loans/${id}`)
      setSelectedLoan(data)
    } catch (err: any) {
      showToast(err.message || 'Error al cargar préstamo', 'error')
    } finally {
      setDetailLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createLoan(createForm)
      setCreateForm({ assetId: '', userId: '', expectedReturnDate: '', notes: '' })
      setIsCreateOpen(false)
      loadLoans()
      // Refresh available assets
      api.get('/assets?status=AVAILABLE&pageSize=100').then(data => setAvailableAssets(data.data || [])).catch(() => {})
    } catch {}
  }

  const handleAction = async (action: string) => {
    if (!selectedLoan) return
    try {
      switch (action) {
        case 'approve':
          await approveLoan(selectedLoan.id)
          break
        case 'reject':
          await rejectLoan(selectedLoan.id, actionNotes)
          break
        case 'deliver':
          await deliverLoan(selectedLoan.id, actionNotes)
          break
        case 'return':
          await returnLoan(selectedLoan.id, returnCondition, actionNotes)
          break
      }
      setActionNotes('')
      loadLoans()
      openDetail(selectedLoan.id)
    } catch {}
  }

  const getUserDisplayName = (u: any) =>
    u ? (u.firstName ? `${u.firstName} ${u.lastName || ''}`.trim() : u.username) : '—'

  const getActionButtons = (loan: any) => {
    switch (loan.status) {
      case 'REQUESTED':
        return (
          <div className="space-y-3">
            <textarea value={actionNotes} onChange={e => setActionNotes(e.target.value)}
              placeholder="Notas (requerido para rechazo)..."
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#FF6A23]/30 text-slate-800 dark:text-white" rows={2} />
            <div className="flex gap-3">
              <button onClick={() => handleAction('approve')}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/10">
                <CheckCircle size={16} /> Aprobar
              </button>
              <button onClick={() => handleAction('reject')} disabled={!actionNotes.trim()}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-rose-500/10 disabled:opacity-50">
                <XCircle size={16} /> Rechazar
              </button>
            </div>
          </div>
        )
      case 'APPROVED':
        return (
          <div className="space-y-3">
            <textarea value={actionNotes} onChange={e => setActionNotes(e.target.value)}
              placeholder="Notas de entrega (opcional)..."
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#FF6A23]/30 text-slate-800 dark:text-white" rows={2} />
            <button onClick={() => handleAction('deliver')}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#FF6A23] hover:bg-[#e55a1d] text-white font-bold rounded-xl transition-all shadow-lg shadow-orange-500/10">
              <Truck size={16} /> Registrar Entrega
            </button>
          </div>
        )
      case 'DELIVERED':
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Condición del activo</label>
              <select value={returnCondition} onChange={e => setReturnCondition(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF6A23]/30">
                <option value="GOOD">Buena condición</option>
                <option value="DAMAGED">Con daños</option>
                <option value="NEEDS_REPAIR">Requiere reparación</option>
              </select>
            </div>
            <textarea value={actionNotes} onChange={e => setActionNotes(e.target.value)}
              placeholder="Notas de devolución (opcional)..."
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#FF6A23]/30 text-slate-800 dark:text-white" rows={2} />
            <button onClick={() => handleAction('return')}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/10">
              <CornerDownLeft size={16} /> Registrar Devolución
            </button>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight italic uppercase">Préstamos de Activos</h2>
          <p className="text-slate-500 dark:text-slate-400">Control del flujo de préstamos: solicitud → aprobación → entrega → devolución</p>
        </div>
        <button onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#FF6A23] hover:bg-[#e55a1d] text-white font-bold rounded-2xl shadow-lg shadow-orange-500/20 transition-all hover:scale-[1.02]">
          <Plus size={18} /> Solicitar Préstamo
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm">
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
          className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#FF6A23]/30 flex-1">
          <option value="">Todos los estados</option>
          <option value="REQUESTED">Solicitado</option>
          <option value="APPROVED">Aprobado</option>
          <option value="DELIVERED">Entregado</option>
          <option value="RETURNED">Devuelto</option>
          <option value="REJECTED">Rechazado</option>
        </select>
        <button
          onClick={() => { setOverdueFilter(!overdueFilter); setPage(1) }}
          className={`px-4 py-2.5 rounded-xl text-sm font-bold border transition-all flex items-center gap-2 ${
            overdueFilter
              ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/50'
              : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-rose-300'
          }`}
        >
          <AlertTriangle size={14} /> Vencidos
        </button>
        {(statusFilter || overdueFilter) && (
          <button onClick={() => { setStatusFilter(''); setOverdueFilter(false); setPage(1) }}
            className="px-4 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors flex items-center gap-1">
            <X size={14} /> Limpiar
          </button>
        )}
      </div>

      {/* Content */}
      {loading && loans.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-[#FF6A23] border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-500 dark:text-slate-400 font-medium">Cargando préstamos...</p>
          </div>
        </div>
      ) : loans.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 bg-orange-100 dark:bg-orange-950/30 rounded-full flex items-center justify-center text-[#FF6A23] mb-4">
            <RefreshCw size={40} />
          </div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">No hay préstamos</h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-6">
            {statusFilter || overdueFilter ? 'No se encontraron préstamos con los filtros seleccionados.' : 'Solicita el primer préstamo de activo.'}
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Activo</th>
                  <th className="text-left px-4 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Estado</th>
                  <th className="text-left px-4 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Usuario</th>
                  <th className="text-left px-4 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Fecha Devolución</th>
                  <th className="text-left px-4 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Alerta</th>
                  <th className="text-right px-6 py-4"></th>
                </tr>
              </thead>
              <tbody>
                {loans.map((loan: any) => (
                  <tr key={loan.id} onClick={() => openDetail(loan.id)}
                    className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 cursor-pointer transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800 dark:text-white group-hover:text-[#FF6A23] transition-colors">
                        {loan.asset?.internalCode || '—'}
                      </div>
                      <div className="text-xs text-slate-400 dark:text-slate-500">{loan.asset?.brand} {loan.asset?.model}</div>
                    </td>
                    <td className="px-4 py-4"><StatusBadge status={loan.status} /></td>
                    <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{getUserDisplayName(loan.user)}</td>
                    <td className="px-4 py-4 text-slate-500 dark:text-slate-400 text-sm whitespace-nowrap">
                      {new Date(loan.expectedReturnDate).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-4">
                      {isOverdue(loan) && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-500">
                          <AlertTriangle size={12} /> Vencido
                        </span>
                      )}
                      {isExpiringSoon(loan) && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-500">
                          <Clock size={12} /> Pronto
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <ArrowUpRight size={16} className="text-slate-300 dark:text-slate-600 group-hover:text-[#FF6A23] transition-colors inline-block" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-800">
              <span className="text-sm text-slate-500 dark:text-slate-400">{total} préstamos en total</span>
              <div className="flex items-center gap-2">
                <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 disabled:opacity-30 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  <ChevronLeft size={16} />
                </button>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300 px-3">{page} / {totalPages}</span>
                <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 disabled:opacity-30 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create Modal */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Solicitar Préstamo">
        <form onSubmit={handleCreate} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Activo *</label>
            <select required value={createForm.assetId} onChange={e => setCreateForm(f => ({ ...f, assetId: e.target.value }))}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF6A23]/30">
              <option value="">Seleccionar activo disponible...</option>
              {availableAssets.map((a: any) => (
                <option key={a.id} value={a.id}>{a.internalCode} — {a.brand} {a.model}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Usuario *</label>
            <select required value={createForm.userId} onChange={e => setCreateForm(f => ({ ...f, userId: e.target.value }))}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF6A23]/30">
              <option value="">Seleccionar usuario...</option>
              {users.map((u: any) => <option key={u.id} value={u.id}>{getUserDisplayName(u)}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Fecha esperada de devolución *</label>
            <input type="date" required value={createForm.expectedReturnDate}
              onChange={e => setCreateForm(f => ({ ...f, expectedReturnDate: e.target.value }))}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF6A23]/30" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Notas (opcional)</label>
            <textarea rows={3} value={createForm.notes} onChange={e => setCreateForm(f => ({ ...f, notes: e.target.value }))}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm resize-none text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF6A23]/30"
              placeholder="Razón del préstamo..." />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button type="button" onClick={() => setIsCreateOpen(false)} className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl transition-all">Cancelar</button>
            <button type="submit" disabled={loading} className="px-5 py-2.5 bg-[#FF6A23] hover:bg-[#e55a1d] text-white font-bold rounded-xl shadow-lg shadow-orange-500/10 transition-all disabled:opacity-50">
              Solicitar Préstamo
            </button>
          </div>
        </form>
      </Modal>

      {/* Detail Modal */}
      <Modal isOpen={!!selectedLoan} onClose={() => { setSelectedLoan(null); setActionNotes('') }} title="Detalle del Préstamo">
        {detailLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-10 h-10 border-4 border-[#FF6A23] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : selectedLoan ? (
          <div className="space-y-6">
            <div className="flex items-center gap-3 flex-wrap">
              <StatusBadge status={selectedLoan.status} />
              {isOverdue(selectedLoan) && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50">
                  <AlertTriangle size={12} /> VENCIDO
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <Package size={14} />
                <span>Activo: <b className="text-slate-700 dark:text-slate-200">{selectedLoan.asset?.internalCode} — {selectedLoan.asset?.brand} {selectedLoan.asset?.model}</b></span>
              </div>
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <User size={14} />
                <span>Usuario: <b className="text-slate-700 dark:text-slate-200">{getUserDisplayName(selectedLoan.user)}</b></span>
              </div>
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <User size={14} />
                <span>Solicitado por: <b className="text-slate-700 dark:text-slate-200">{getUserDisplayName(selectedLoan.requestedBy)}</b></span>
              </div>
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <Calendar size={14} />
                <span>Devolución: <b className="text-slate-700 dark:text-slate-200">{new Date(selectedLoan.expectedReturnDate).toLocaleDateString('es-ES')}</b></span>
              </div>
            </div>

            {selectedLoan.notes && (
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                <p className="text-sm text-slate-600 dark:text-slate-300">{selectedLoan.notes}</p>
              </div>
            )}

            {/* Action Buttons */}
            {getActionButtons(selectedLoan)}

            {/* History */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Clock size={16} className="text-[#FF6A23]" /> Historial ({selectedLoan.history?.length || 0})
              </h4>
              <div className="max-h-[200px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {(selectedLoan.history || []).map((h: any) => (
                  <div key={h.id} className="flex gap-3 items-start text-sm pb-2 border-b border-slate-50 dark:border-slate-800 last:border-0">
                    <div className="w-2 h-2 rounded-full bg-[#FF6A23] mt-2 shrink-0" />
                    <div className="flex-1">
                      <span className="font-bold text-slate-700 dark:text-slate-200">{h.action}</span>
                      {h.notes && <span className="text-slate-500 dark:text-slate-400 ml-1">— {h.notes}</span>}
                      <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                        {new Date(h.createdAt).toLocaleString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  )
}
