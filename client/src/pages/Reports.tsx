import { useEffect, useState } from 'react'
import {
  Download, Package, Ticket, RefreshCw
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'
import { api } from '../lib/api'
import { showToast } from '../components/Toast'

type ReportType = 'tickets' | 'assets' | 'loans'

export default function Reports() {
  const [activeReport, setActiveReport] = useState<ReportType>('tickets')
  const [loading, setLoading] = useState(false)
  const [ticketsSummary, setTicketsSummary] = useState<any>(null)
  const [assetsSummary, setAssetsSummary] = useState<any>(null)
  const [loansSummary, setLoansSummary] = useState<any>(null)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const fetchReport = async () => {
    setLoading(true)
    try {
      switch (activeReport) {
        case 'tickets': {
          const params = new URLSearchParams()
          if (dateFrom) params.append('from', dateFrom)
          if (dateTo) params.append('to', dateTo)
          const data = await api.get(`/reports/tickets-summary?${params.toString()}`)
          setTicketsSummary(data)
          break
        }
        case 'assets': {
          const data = await api.get('/reports/assets-summary')
          setAssetsSummary(data)
          break
        }
        case 'loans': {
          const data = await api.get('/reports/loans-summary')
          setLoansSummary(data)
          break
        }
      }
    } catch (err: any) {
      showToast(err.message || 'Error al cargar reporte', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchReport() }, [activeReport])

  const handleExportCsv = async (type: string) => {
    try {
      const csv = await api.get(`/reports/${type}/csv`)
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${type}_${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      URL.revokeObjectURL(url)
      showToast('CSV descargado exitosamente', 'success')
    } catch (err: any) {
      showToast(err.message || 'Error al exportar CSV', 'error')
    }
  }

  const reportTabs = [
    { key: 'tickets' as ReportType, label: 'Tickets', icon: Ticket },
    { key: 'assets' as ReportType, label: 'Activos', icon: Package },
    { key: 'loans' as ReportType, label: 'Préstamos', icon: RefreshCw },
  ]

  const COLORS = ['#3b82f6', '#f59e0b', '#ef4444', '#10b981', '#8b5cf6', '#64748b']

  const renderTicketsReport = () => {
    if (!ticketsSummary) return null
    const statusData = Object.entries(ticketsSummary.byStatus || {}).map(([name, value]) => ({
      name: { OPEN: 'Abiertos', IN_PROGRESS: 'En Progreso', ESCALATED: 'Escalados', CLOSED: 'Cerrados' }[name] || name,
      cantidad: value as number,
    }))
    const priorityData = Object.entries(ticketsSummary.byPriority || {}).map(([name, value]) => ({
      name: { LOW: 'Baja', MEDIUM: 'Media', HIGH: 'Alta', CRITICAL: 'Crítica' }[name] || name,
      value: value as number,
    }))

    return (
      <div className="space-y-6">
        {/* Date filters */}
        <div className="flex flex-wrap items-end gap-4 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800">
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Desde</label>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF6A23]/30" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Hasta</label>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF6A23]/30" />
          </div>
          <button onClick={fetchReport}
            className="px-4 py-2 bg-[#FF6A23] hover:bg-[#e55a1d] text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-orange-500/10">
            Aplicar
          </button>
        </div>

        {/* KPI Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800">
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Total Tickets</div>
            <div className="text-2xl font-black text-slate-800 dark:text-white mt-1">{ticketsSummary.total || 0}</div>
          </div>
          <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800">
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Abiertos</div>
            <div className="text-2xl font-black text-blue-500 mt-1">{ticketsSummary.byStatus?.OPEN || 0}</div>
          </div>
          <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800">
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Cerrados</div>
            <div className="text-2xl font-black text-emerald-500 mt-1">{ticketsSummary.byStatus?.CLOSED || 0}</div>
          </div>
          <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800">
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Críticos</div>
            <div className="text-2xl font-black text-rose-500 mt-1">{ticketsSummary.byPriority?.CRITICAL || 0}</div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-slate-800 shadow-sm">
            <h3 className="font-extrabold text-lg text-slate-800 dark:text-white mb-4">Tickets por Estado</h3>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', backgroundColor: '#0f172a', color: '#fff', fontSize: '12px' }} />
                  <Bar dataKey="cantidad" radius={[8, 8, 0, 0]}>
                    {statusData.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-slate-800 shadow-sm">
            <h3 className="font-extrabold text-lg text-slate-800 dark:text-white mb-4">Tickets por Prioridad</h3>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={priorityData.filter(d => d.value > 0)} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={4} dataKey="value">
                    {priorityData.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', backgroundColor: '#0f172a', color: '#fff', fontSize: '12px' }} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderAssetsReport = () => {
    if (!assetsSummary) return null
    const statusData = Object.entries(assetsSummary.byStatus || {}).map(([name, value]) => ({
      name: { AVAILABLE: 'Disponibles', IN_USE: 'En Uso', MAINTENANCE: 'Mantenimiento', RETIRED: 'Retirados' }[name] || name,
      value: value as number,
    }))

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800">
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Total Activos</div>
            <div className="text-2xl font-black text-slate-800 dark:text-white mt-1">{assetsSummary.total || 0}</div>
          </div>
          {statusData.map((s, i) => (
            <div key={i} className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800">
              <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">{s.name}</div>
              <div className="text-2xl font-black mt-1" style={{ color: COLORS[i] }}>{s.value}</div>
            </div>
          ))}
        </div>
        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-slate-800 shadow-sm">
          <h3 className="font-extrabold text-lg text-slate-800 dark:text-white mb-4">Distribución de Activos</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData.filter(d => d.value > 0)} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={4} dataKey="value">
                  {statusData.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', backgroundColor: '#0f172a', color: '#fff', fontSize: '12px' }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    )
  }

  const renderLoansReport = () => {
    if (!loansSummary) return null
    const statusData = Object.entries(loansSummary.byStatus || {}).map(([name, value]) => ({
      name: { REQUESTED: 'Solicitados', APPROVED: 'Aprobados', DELIVERED: 'Entregados', RETURNED: 'Devueltos', REJECTED: 'Rechazados' }[name] || name,
      cantidad: value as number,
    }))

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800">
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Total Préstamos</div>
            <div className="text-2xl font-black text-slate-800 dark:text-white mt-1">{loansSummary.total || 0}</div>
          </div>
          <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800">
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Activos en Préstamo</div>
            <div className="text-2xl font-black text-amber-500 mt-1">{loansSummary.byStatus?.DELIVERED || 0}</div>
          </div>
          <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800">
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Vencidos</div>
            <div className="text-2xl font-black text-rose-500 mt-1">{loansSummary.overdue || 0}</div>
          </div>
          <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800">
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Por Vencer</div>
            <div className="text-2xl font-black text-amber-500 mt-1">{loansSummary.expiringSoon || 0}</div>
          </div>
        </div>
        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-slate-800 shadow-sm">
          <h3 className="font-extrabold text-lg text-slate-800 dark:text-white mb-4">Préstamos por Estado</h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', backgroundColor: '#0f172a', color: '#fff', fontSize: '12px' }} />
                <Bar dataKey="cantidad" radius={[8, 8, 0, 0]}>
                  {statusData.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight italic uppercase">Reportes</h2>
          <p className="text-slate-500 dark:text-slate-400">Análisis visual y exportación de datos operativos</p>
        </div>
        <button onClick={() => handleExportCsv(activeReport)}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02]">
          <Download size={18} /> Exportar CSV
        </button>
      </div>

      {/* Tab Selector */}
      <div className="flex bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm w-fit">
        {reportTabs.map(tab => {
          const Icon = tab.icon
          return (
            <button key={tab.key} onClick={() => setActiveReport(tab.key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                activeReport === tab.key
                  ? 'bg-[#FF6A23] text-white shadow-lg shadow-orange-500/20'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}>
              <Icon size={16} /> {tab.label}
            </button>
          )
        })}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-[#FF6A23] border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-500 dark:text-slate-400 font-medium">Generando reporte...</p>
          </div>
        </div>
      ) : (
        <>
          {activeReport === 'tickets' && renderTicketsReport()}
          {activeReport === 'assets' && renderAssetsReport()}
          {activeReport === 'loans' && renderLoansReport()}
        </>
      )}
    </div>
  )
}
