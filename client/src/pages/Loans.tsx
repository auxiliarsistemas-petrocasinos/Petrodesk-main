import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowUpRight,
  Calendar,
  CheckCircle,
  Clock,
  CornerDownLeft,
  Package,
  Plus,
  RefreshCw,
  Truck,
  User,
  X,
  XCircle,
} from 'lucide-react'
import Modal from '../components/Modal'
import { showToast } from '../components/Toast'
import { useLoans } from '../hooks/useLoans'
import { api } from '../lib/api'

type LoanStatus = 'REQUESTED' | 'APPROVED' | 'DELIVERED' | 'RETURNED' | 'REJECTED'
type LoanAction = 'reject' | 'deliver' | 'return'

const statusConfig: Record<string, { label: string; className: string; icon: any }> = {
  REQUESTED: {
    label: 'Solicitado',
    className: 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/30 dark:text-yellow-300 dark:border-yellow-900/50',
    icon: Clock,
  },
  APPROVED: {
    label: 'Aprobado',
    className: 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50',
    icon: CheckCircle,
  },
  DELIVERED: {
    label: 'Entregado',
    className: 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/50',
    icon: Truck,
  },
  RETURNED: {
    label: 'Devuelto',
    className: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
    icon: CornerDownLeft,
  },
  REJECTED: {
    label: 'Denegado',
    className: 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/50',
    icon: XCircle,
  },
  OVERDUE: {
    label: 'Vencido',
    className: 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/50',
    icon: AlertTriangle,
  },
}

function getUserDisplayName(user: any) {
  if (!user) return '-'
  return user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.username
}

function formatDate(value?: string | Date | null) {
  if (!value) return '-'
  return new Date(value).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' })
}

function formatDateOnly(value?: string | Date | null) {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('es-CO', { dateStyle: 'medium' })
}

function isOverdue(loan: any) {
  return loan.status === 'DELIVERED' && new Date(loan.expectedReturnDate) < new Date()
}

function isExpiringSoon(loan: any) {
  if (loan.status !== 'DELIVERED') return false
  const diff = new Date(loan.expectedReturnDate).getTime() - Date.now()
  return diff > 0 && diff <= 72 * 60 * 60 * 1000
}

function StatusBadge({ loan, status }: { loan?: any; status?: string }) {
  const key = loan && isOverdue(loan) ? 'OVERDUE' : status || loan?.status || 'REQUESTED'
  const cfg = statusConfig[key] || statusConfig.REQUESTED
  const Icon = cfg.icon

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-bold ${cfg.className}`}>
      <Icon size={12} />
      {cfg.label}
    </span>
  )
}

export default function Loans() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { loans, loading, fetchLoans, createLoan, approveLoan, rejectLoan, deliverLoan, returnLoan } = useLoans()

  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '')
  const [overdueFilter, setOverdueFilter] = useState(searchParams.get('overdue') === 'true')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [selectedLoan, setSelectedLoan] = useState<any>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [users, setUsers] = useState<any[]>([])
  const [availableAssets, setAvailableAssets] = useState<any[]>([])
  const [createForm, setCreateForm] = useState({ assetId: '', userId: '', expectedReturnDate: '', notes: '' })
  const [actionModal, setActionModal] = useState<{ action: LoanAction; loan: any } | null>(null)
  const [actionComments, setActionComments] = useState('')
  const [returnCondition, setReturnCondition] = useState('GOOD')

  const loadReferenceData = useCallback(() => {
    api.get('/users').then((data) => setUsers(Array.isArray(data) ? data.filter((u: any) => u.isActive !== false) : [])).catch(() => {})
    api.get('/assets?status=AVAILABLE&pageSize=100').then((data) => setAvailableAssets(data.data || [])).catch(() => {})
  }, [])

  const loadLoans = useCallback(() => {
    fetchLoans({ status: statusFilter as LoanStatus, overdue: overdueFilter || undefined, page: 1, pageSize: 100 })
  }, [fetchLoans, statusFilter, overdueFilter])

  useEffect(() => {
    loadReferenceData()
  }, [loadReferenceData])

  useEffect(() => {
    loadLoans()
  }, [loadLoans])

  useEffect(() => {
    const params: Record<string, string> = {}
    if (statusFilter) params.status = statusFilter
    if (overdueFilter) params.overdue = 'true'
    setSearchParams(params, { replace: true })
  }, [statusFilter, overdueFilter, setSearchParams])

  const activeLoans = useMemo(
    () => loans.filter((loan: any) => ['REQUESTED', 'APPROVED', 'DELIVERED'].includes(loan.status)),
    [loans],
  )
  const returnedLoans = useMemo(
    () => loans.filter((loan: any) => loan.status === 'RETURNED').slice(0, 20),
    [loans],
  )
  const rejectedLoans = useMemo(
    () => loans.filter((loan: any) => loan.status === 'REJECTED').slice(0, 20),
    [loans],
  )

  const refreshAll = useCallback(() => {
    loadLoans()
    loadReferenceData()
  }, [loadLoans, loadReferenceData])

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault()
    try {
      await createLoan(createForm)
      setCreateForm({ assetId: '', userId: '', expectedReturnDate: '', notes: '' })
      setIsCreateOpen(false)
      refreshAll()
    } catch {}
  }

  const openDetail = async (id: string) => {
    setDetailLoading(true)
    try {
      setSelectedLoan(await api.get(`/loans/${id}`))
    } catch (err: any) {
      showToast(err.message || 'Error al cargar prestamo', 'error')
    } finally {
      setDetailLoading(false)
    }
  }

  const closeActionModal = () => {
    setActionModal(null)
    setActionComments('')
    setReturnCondition('GOOD')
  }

  const openActionModal = (loan: any, action: LoanAction) => {
    setSelectedLoan(null)
    setActionModal({ loan, action })
    setActionComments('')
    setReturnCondition('GOOD')
  }

  const runAction = async (loan: any, action: 'approve' | LoanAction, comments?: string) => {
    try {
      if (action === 'approve') await approveLoan(loan.id)
      if (action === 'reject') await rejectLoan(loan.id, comments || '')
      if (action === 'deliver') await deliverLoan(loan.id, comments || '')
      if (action === 'return') await returnLoan(loan.id, returnCondition, comments || '')
      refreshAll()
      if (selectedLoan?.id === loan.id) openDetail(loan.id)
      closeActionModal()
    } catch {}
  }

  const handleActionSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!actionModal) return
    const comments = actionComments.trim()
    if (!comments) {
      showToast('Debe diligenciar los comentarios', 'error')
      return
    }
    await runAction(actionModal.loan, actionModal.action, comments)
  }

  const selectedAsset = availableAssets.find((asset) => asset.id === createForm.assetId)
  const today = new Date().toISOString().slice(0, 10)

  const loanTitle = (loan: any) => `${loan.asset?.internalCode || '-'} - ${loan.asset?.brand || ''} ${loan.asset?.model || ''}`.trim()
  const actionTitle = actionModal?.action === 'deliver'
    ? 'Registrar entrega'
    : actionModal?.action === 'reject'
    ? 'Rechazar prestamo'
    : 'Registrar devolución'
  const actionButtonLabel = actionModal?.action === 'deliver'
    ? 'Registrar entrega'
    : actionModal?.action === 'reject'
    ? 'Rechazar prestamo'
    : 'Registrar devolución'

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-black uppercase italic tracking-tight text-slate-800 dark:text-white">Prestamos de Activos</h2>
          <p className="text-slate-500 dark:text-slate-400">Solicitud, aprobacion, entrega y devolucion de activos.</p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 rounded-2xl bg-[#FF6A23] px-5 py-2.5 font-bold text-white shadow-lg shadow-orange-500/20 transition-all hover:scale-[1.02] hover:bg-[#e55a1d]"
        >
          <Plus size={18} />
          Solicitar Prestamo
        </button>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/60 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:flex-row">
        <select
          value={statusFilter}
          onChange={(event) => {
            setStatusFilter(event.target.value)
            setOverdueFilter(false)
          }}
          className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF6A23]/30 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
        >
          <option value="">Todos los estados</option>
          <option value="REQUESTED">Solicitado</option>
          <option value="APPROVED">Aprobado</option>
          <option value="DELIVERED">Entregado</option>
          <option value="RETURNED">Devuelto</option>
          <option value="REJECTED">Denegado</option>
        </select>
        <button
          onClick={() => {
            setOverdueFilter(!overdueFilter)
            setStatusFilter('')
          }}
          className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold transition-all ${
            overdueFilter
              ? 'border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-400'
              : 'border-slate-200 bg-slate-50 text-slate-500 hover:border-rose-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400'
          }`}
        >
          <AlertTriangle size={14} />
          Vencidos
        </button>
        {(statusFilter || overdueFilter) && (
          <button
            onClick={() => {
              setStatusFilter('')
              setOverdueFilter(false)
            }}
            className="flex items-center gap-1 px-4 py-2.5 text-sm font-bold text-slate-500 transition-colors hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            <X size={14} />
            Limpiar
          </button>
        )}
      </div>

      {loading && loans.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-20">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#FF6A23] border-t-transparent" />
          <p className="font-medium text-slate-500 dark:text-slate-400">Cargando prestamos...</p>
        </div>
      ) : loans.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-orange-100 text-[#FF6A23] dark:bg-orange-950/30">
            <RefreshCw size={40} />
          </div>
          <h3 className="mb-2 text-xl font-bold text-slate-800 dark:text-white">No hay prestamos</h3>
          <p className="max-w-sm text-slate-500 dark:text-slate-400">
            {statusFilter || overdueFilter ? 'No se encontraron prestamos con los filtros seleccionados.' : 'Solicita el primer prestamo de activo.'}
          </p>
        </div>
      ) : (
        <>
          <section>
            <h3 className="mb-3 font-bold text-slate-800 dark:text-white">Prestamos abiertos</h3>
            <div className="space-y-3">
              {activeLoans.map((loan: any) => (
                <div key={loan.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <button onClick={() => openDetail(loan.id)} className="min-w-0 flex-1 text-left">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <p className="font-bold text-slate-800 transition-colors hover:text-[#FF6A23] dark:text-white">{loanTitle(loan)}</p>
                      <StatusBadge loan={loan} />
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {getUserDisplayName(loan.user)} / devolucion {formatDateOnly(loan.expectedReturnDate)}
                      {isExpiringSoon(loan) && ' / vence pronto'}
                    </p>
                  </button>
                  <div className="flex flex-wrap gap-2">
                    {loan.status === 'REQUESTED' && (
                      <>
                        <button onClick={() => runAction(loan, 'approve')} className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-600">Aprobar</button>
                        <button onClick={() => openActionModal(loan, 'reject')} className="rounded-lg bg-rose-500 px-4 py-2 text-sm font-bold text-white hover:bg-rose-600">Rechazar</button>
                      </>
                    )}
                    {loan.status === 'APPROVED' && (
                      <button onClick={() => openActionModal(loan, 'deliver')} className="rounded-lg bg-[#FF6A23] px-4 py-2 text-sm font-bold text-white hover:bg-[#e55a1d]">Registrar entrega</button>
                    )}
                    {loan.status === 'DELIVERED' && (
                      <button onClick={() => openActionModal(loan, 'return')} className="rounded-lg bg-orange-100 px-4 py-2 text-sm font-bold text-[#FF6A23] hover:brightness-95 dark:bg-orange-950/30">Registrar devolucion</button>
                    )}
                  </div>
                </div>
              ))}
              {activeLoans.length === 0 && <p className="text-sm text-slate-400">No hay prestamos abiertos en este momento.</p>}
            </div>
          </section>

          <section>
            <h3 className="mb-3 font-bold text-slate-800 dark:text-white">Ultimas devoluciones</h3>
            <div className="space-y-2">
              {returnedLoans.map((loan: any) => (
                <button key={loan.id} onClick={() => openDetail(loan.id)} className="flex w-full items-center justify-between gap-3 rounded-xl border border-slate-100 bg-white px-4 py-3 text-left text-sm dark:border-slate-800 dark:bg-slate-900">
                  <span>
                    <span className="font-medium text-slate-800 dark:text-white">{loanTitle(loan)}</span>
                    {' / '}
                    {getUserDisplayName(loan.user)}
                    {' / devuelto el '}
                    {formatDate(loan.actualReturnDate)}
                  </span>
                  <ArrowUpRight size={16} className="text-slate-300" />
                </button>
              ))}
              {returnedLoans.length === 0 && <p className="text-sm text-slate-400">Aun no hay devoluciones registradas.</p>}
            </div>
          </section>

          {rejectedLoans.length > 0 && (
            <section>
              <h3 className="mb-3 font-bold text-slate-800 dark:text-white">Solicitudes denegadas</h3>
              <div className="space-y-2">
                {rejectedLoans.map((loan: any) => (
                  <button key={loan.id} onClick={() => openDetail(loan.id)} className="flex w-full items-center justify-between gap-3 rounded-xl border border-slate-100 bg-white px-4 py-3 text-left text-sm dark:border-slate-800 dark:bg-slate-900">
                    <span>
                      <span className="font-medium text-slate-800 dark:text-white">{loanTitle(loan)}</span>
                      {' / '}
                      {getUserDisplayName(loan.user)}
                    </span>
                    <StatusBadge status="REJECTED" />
                  </button>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Solicitar Prestamo">
        <form onSubmit={handleCreate} className="space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-bold text-slate-700 dark:text-slate-300">Activo disponible *</label>
            <select
              required
              value={createForm.assetId}
              onChange={(event) => setCreateForm((form) => ({ ...form, assetId: event.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF6A23]/30 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value="">Activo disponible...</option>
              {availableAssets.map((asset: any) => (
                <option key={asset.id} value={asset.id}>
                  {asset.internalCode} - {[asset.brand, asset.model].filter(Boolean).join(' / ') || 'sin referencia'}
                </option>
              ))}
            </select>
            {availableAssets.length === 0 && <p className="mt-2 text-xs text-amber-600">No hay activos disponibles para prestar.</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-bold text-slate-700 dark:text-slate-300">Solicitante *</label>
            <select
              required
              value={createForm.userId}
              onChange={(event) => setCreateForm((form) => ({ ...form, userId: event.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF6A23]/30 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value="">Solicitante...</option>
              {users.map((user: any) => (
                <option key={user.id} value={user.id}>
                  {getUserDisplayName(user)}{user.email ? ` (${user.email})` : ''}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-bold text-slate-700 dark:text-slate-300">Fecha esperada de devolucion *</label>
            <input
              required
              type="date"
              min={today}
              value={createForm.expectedReturnDate}
              onChange={(event) => setCreateForm((form) => ({ ...form, expectedReturnDate: event.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF6A23]/30 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
          <textarea
            required
            rows={3}
            placeholder="Comentarios *"
            value={createForm.notes}
            onChange={(event) => setCreateForm((form) => ({ ...form, notes: event.target.value }))}
            className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF6A23]/30 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
          {selectedAsset && (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Seleccionado: {selectedAsset.internalCode} / {selectedAsset.brand} {selectedAsset.model}
            </p>
          )}
          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
            <button type="button" onClick={() => setIsCreateOpen(false)} className="rounded-xl bg-slate-100 px-5 py-2.5 font-bold text-slate-700 transition-all hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">Cancelar</button>
            <button type="submit" disabled={loading || availableAssets.length === 0} className="rounded-xl bg-[#FF6A23] px-5 py-2.5 font-bold text-white shadow-lg shadow-orange-500/10 transition-all hover:bg-[#e55a1d] disabled:opacity-50">
              Solicitar Prestamo
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!actionModal} onClose={closeActionModal} title={actionTitle}>
        {actionModal && (
          <form onSubmit={handleActionSubmit} className="space-y-5">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm dark:border-slate-800 dark:bg-slate-800/50">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <p className="font-bold text-slate-800 dark:text-white">{loanTitle(actionModal.loan)}</p>
                <StatusBadge loan={actionModal.loan} />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                  <User size={14} />
                  <span>Solicitante: <b className="text-slate-700 dark:text-slate-200">{getUserDisplayName(actionModal.loan.user)}</b></span>
                </div>
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                  <Calendar size={14} />
                  <span>Devolucion esperada: <b className="text-slate-700 dark:text-slate-200">{formatDateOnly(actionModal.loan.expectedReturnDate)}</b></span>
                </div>
                {actionModal.loan.deliveryDate && (
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <Truck size={14} />
                    <span>Entrega: <b className="text-slate-700 dark:text-slate-200">{formatDate(actionModal.loan.deliveryDate)}</b></span>
                  </div>
                )}
              </div>
            </div>

            {actionModal.action === 'return' && (
              <div>
                <label className="mb-1.5 block text-sm font-bold text-slate-700 dark:text-slate-300">Condicion del activo</label>
                <select
                  value={returnCondition}
                  onChange={(event) => setReturnCondition(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF6A23]/30 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="GOOD">Buena condición</option>
                  <option value="DAMAGED">Con daños</option>
                  <option value="NEEDS_REPAIR">Requiere reparaciÓn</option>
                </select>
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-sm font-bold text-slate-700 dark:text-slate-300">Comentarios *</label>
              <textarea
                required
                rows={4}
                value={actionComments}
                onChange={(event) => setActionComments(event.target.value)}
                placeholder="Escribe los comentarios de la accion..."
                className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF6A23]/30 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
              <button type="button" onClick={closeActionModal} className="rounded-xl bg-slate-100 px-5 py-2.5 font-bold text-slate-700 transition-all hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">Cancelar</button>
              <button type="submit" disabled={loading} className="rounded-xl bg-[#FF6A23] px-5 py-2.5 font-bold text-white shadow-lg shadow-orange-500/10 transition-all hover:bg-[#e55a1d] disabled:opacity-50">
                {actionButtonLabel}
              </button>
            </div>
          </form>
        )}
      </Modal>

      <Modal isOpen={!!selectedLoan} onClose={() => setSelectedLoan(null)} title="Detalle del Prestamo">
        {detailLoading ? (
          <div className="flex justify-center py-12">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#FF6A23] border-t-transparent" />
          </div>
        ) : selectedLoan ? (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge loan={selectedLoan} />
              {isExpiringSoon(selectedLoan) && <StatusBadge status="DELIVERED" />}
            </div>
            <div className="grid gap-4 text-sm sm:grid-cols-2">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <Package size={14} />
                <span>Activo: <b className="text-slate-700 dark:text-slate-200">{loanTitle(selectedLoan)}</b></span>
              </div>
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <User size={14} />
                <span>Solicitante: <b className="text-slate-700 dark:text-slate-200">{getUserDisplayName(selectedLoan.user)}</b></span>
              </div>
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <Calendar size={14} />
                <span>Entrega: <b className="text-slate-700 dark:text-slate-200">{formatDate(selectedLoan.deliveryDate)}</b></span>
              </div>
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <Calendar size={14} />
                <span>Devolucion esperada: <b className="text-slate-700 dark:text-slate-200">{formatDateOnly(selectedLoan.expectedReturnDate)}</b></span>
              </div>
            </div>
            {selectedLoan.notes && <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600 dark:bg-slate-800/50 dark:text-slate-300">{selectedLoan.notes}</p>}
            <div className="flex flex-wrap gap-2">
              {selectedLoan.status === 'REQUESTED' && (
                <>
                  <button onClick={() => runAction(selectedLoan, 'approve')} className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-600">Aprobar</button>
                  <button onClick={() => openActionModal(selectedLoan, 'reject')} className="rounded-lg bg-rose-500 px-4 py-2 text-sm font-bold text-white hover:bg-rose-600">Rechazar</button>
                </>
              )}
              {selectedLoan.status === 'APPROVED' && <button onClick={() => openActionModal(selectedLoan, 'deliver')} className="rounded-lg bg-[#FF6A23] px-4 py-2 text-sm font-bold text-white hover:bg-[#e55a1d]">Registrar entrega</button>}
              {selectedLoan.status === 'DELIVERED' && <button onClick={() => openActionModal(selectedLoan, 'return')} className="rounded-lg bg-orange-100 px-4 py-2 text-sm font-bold text-[#FF6A23] hover:brightness-95 dark:bg-orange-950/30">Registrar devolucion</button>}
            </div>
            <div>
              <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                <Clock size={16} className="text-[#FF6A23]" />
                Historial
              </h4>
              <div className="max-h-[220px] space-y-2 overflow-y-auto pr-1">
                {(selectedLoan.history || []).map((item: any) => (
                  <div key={item.id} className="border-b border-slate-50 pb-2 text-sm last:border-0 dark:border-slate-800">
                    <p className="font-bold text-slate-700 dark:text-slate-200">{item.action}</p>
                    {item.notes && <p className="text-slate-500 dark:text-slate-400">{item.notes}</p>}
                    <p className="text-xs text-slate-400 dark:text-slate-500">{formatDate(item.createdAt)}</p>
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
