import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useDashboard } from '../hooks/useDashboard'
import {
  Ticket,
  AlertTriangle,
  Package,
  Clock,
  ArrowRight,
  Activity,
  Calendar,
  MapPin,
  RefreshCw
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts'

export default function Dashboard() {
  const { summary, loading, fetchSummary } = useDashboard()

  useEffect(() => {
    fetchSummary()
  }, [fetchSummary])

  if (loading && !summary) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#FF6A23] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Cargando métricas...</p>
        </div>
      </div>
    )
  }

  // Fallback defaults
  const ticketsData = summary?.tickets || {
    byStatus: { OPEN: 0, IN_PROGRESS: 0, CLOSED: 0, ESCALATED: 0 },
    critical: 0,
    total: 0
  }
  const assetsData = summary?.assets || {
    byStatus: { AVAILABLE: 0, IN_USE: 0, MAINTENANCE: 0, RETIRED: 0 },
    total: 0
  }
  const loansData = summary?.loans || { expiringSoon: 0, overdue: 0 }
  const visitsData = summary?.visits || { upcoming: 0, recent: 0 }
  const recentActivities = summary?.recentActivity || []

  // Recharts Data formatting
  const ticketChartData = [
    { name: 'Abiertos', cantidad: ticketsData.byStatus.OPEN, color: '#3b82f6' },
    { name: 'En Progreso', cantidad: ticketsData.byStatus.IN_PROGRESS, color: '#f59e0b' },
    { name: 'Escalados', cantidad: ticketsData.byStatus.ESCALATED, color: '#ef4444' },
    { name: 'Cerrados', cantidad: ticketsData.byStatus.CLOSED, color: '#10b981' }
  ]

  const assetChartData = [
    { name: 'Disponibles', value: assetsData.byStatus.AVAILABLE, color: '#10b981' },
    { name: 'En Uso', value: assetsData.byStatus.IN_USE, color: '#3b82f6' },
    { name: 'Mantenimiento', value: assetsData.byStatus.MAINTENANCE, color: '#f59e0b' },
    { name: 'Retirados', value: assetsData.byStatus.RETIRED, color: '#64748b' }
  ].filter(item => item.value > 0)

  // Fallback if no assets have states
  const displayAssetChartData = assetChartData.length > 0 ? assetChartData : [
    { name: 'Sin Activos', value: 1, color: '#e2e8f0' }
  ]

  const kpis = [
    {
      title: 'Tickets Abiertos',
      value: ticketsData.byStatus.OPEN + ticketsData.byStatus.IN_PROGRESS + ticketsData.byStatus.ESCALATED,
      sub: `${ticketsData.critical} críticos activos`,
      icon: <Ticket className="w-6 h-6 text-blue-500" />,
      bg: 'bg-blue-50/50 dark:bg-blue-950/10 border-blue-100/50 dark:border-blue-900/30',
      link: '/tickets?status=OPEN'
    },
    {
      title: 'Tickets Críticos',
      value: ticketsData.critical,
      sub: 'Requieren atención inmediata',
      icon: <AlertTriangle className="w-6 h-6 text-rose-500" />,
      bg: 'bg-rose-50/50 dark:bg-rose-950/10 border-rose-100/50 dark:border-rose-900/30',
      link: '/tickets?priority=CRITICAL'
    },
    {
      title: 'Activos en Uso',
      value: assetsData.byStatus.IN_USE,
      sub: `De un total de ${assetsData.total} registrados`,
      icon: <Package className="w-6 h-6 text-emerald-500" />,
      bg: 'bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-100/50 dark:border-emerald-900/30',
      link: '/assets?status=IN_USE'
    },
    {
      title: 'Préstamos Vencidos',
      value: loansData.overdue,
      sub: `${loansData.expiringSoon} vencen pronto (≤72h)`,
      icon: <Clock className="w-6 h-6 text-amber-500" />,
      bg: 'bg-amber-50/50 dark:bg-amber-950/10 border-amber-100/50 dark:border-amber-900/30',
      link: '/loans?overdue=true'
    }
  ]

  const getActionLabel = (action: string, oldValue?: string, newValue?: string) => {
    switch (action) {
      case 'CREATED':
        return 'creó el ticket'
      case 'STATUS_CHANGED':
        return `cambió el estado de ${oldValue} a ${newValue}`
      case 'PRIORITY_CHANGED':
        return `cambió la prioridad de ${oldValue} a ${newValue}`
      case 'ASSIGNED':
        return 'asignó el ticket'
      case 'COMMENT_ADDED':
        return 'agregó un comentario'
      default:
        return 'actualizó el ticket'
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight italic uppercase">
            Panel de Operaciones
          </h2>
          <p className="text-slate-500 dark:text-slate-400">
            Resumen en tiempo real del estado de los campos, activos y tickets.
          </p>
        </div>
        <button
          onClick={() => fetchSummary()}
          className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all shadow-sm"
          title="Actualizar datos"
        >
          <RefreshCw size={20} className="animate-hover-spin" />
        </button>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, idx) => (
          <Link
            key={idx}
            to={kpi.link}
            className={`block p-6 rounded-3xl border transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-none bg-white dark:bg-slate-900 ${kpi.bg} group`}
          >
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                  {kpi.title}
                </span>
                <div className="text-3xl font-black text-slate-800 dark:text-white">
                  {kpi.value}
                </div>
              </div>
              <div className="p-3 bg-white dark:bg-slate-850 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-850">
                {kpi.icon}
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs font-semibold text-slate-400 dark:text-slate-500">
              <span>{kpi.sub}</span>
              <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1 text-[#FF6A23]" />
            </div>
          </Link>
        ))}
      </div>

      {/* Visual Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ticket Bar Chart */}
        <div className="lg:col-span-2 p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm flex flex-col space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-extrabold text-lg text-slate-800 dark:text-white tracking-tight">
                Distribución de Tickets
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-500">Tickets de soporte activos y cerrados</p>
            </div>
            <Link to="/tickets" className="text-xs font-bold text-[#FF6A23] hover:underline flex items-center gap-1">
              Ver Tickets <ArrowRight size={12} />
            </Link>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ticketChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:hidden" />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" className="hidden dark:block" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={{ fill: 'rgba(255, 106, 35, 0.04)' }}
                  contentStyle={{
                    borderRadius: '16px',
                    border: 'none',
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                    backgroundColor: '#0f172a',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="cantidad" radius={[8, 8, 0, 0]}>
                  {ticketChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Asset State Chart */}
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm flex flex-col space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-extrabold text-lg text-slate-800 dark:text-white tracking-tight">
                Estado de Activos
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-500">Distribución de inventario tecnológico</p>
            </div>
            <Link to="/assets" className="text-xs font-bold text-[#FF6A23] hover:underline flex items-center gap-1">
              Ver Activos <ArrowRight size={12} />
            </Link>
          </div>
          <div className="h-[280px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={displayAssetChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {displayAssetChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: '16px',
                    border: 'none',
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                    backgroundColor: '#0f172a',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Lower Row: Recent Activity & Visits Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm flex flex-col space-y-6">
          <div>
            <h3 className="font-extrabold text-lg text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
              <Activity size={20} className="text-[#FF6A23]" /> Actividad Reciente
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500">Últimas acciones realizadas en tickets</p>
          </div>

          <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
            {recentActivities.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-slate-400 dark:text-slate-500 text-sm">
                <span>No hay actividad registrada recientemente.</span>
              </div>
            ) : (
              recentActivities.map((act: any) => (
                <div key={act.id} className="flex gap-4 items-start pb-4 border-b border-slate-100 dark:border-slate-800 last:border-0 last:pb-0">
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                    <Ticket size={16} />
                  </div>
                  <div className="space-y-1 flex-1">
                    <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      <span className="font-black text-slate-950 dark:text-white">
                        {act.user?.firstName ? `${act.user.firstName} ${act.user.lastName || ''}` : act.user?.username || 'Sistema'}
                      </span>{' '}
                      {getActionLabel(act.action, act.oldValue, act.newValue)} en{' '}
                      <Link to={`/tickets`} className="text-[#FF6A23] hover:underline font-bold">
                        "{act.ticket?.title}"
                      </Link>
                    </div>
                    <div className="text-xs text-slate-400 dark:text-slate-500">
                      {new Date(act.createdAt).toLocaleString('es-ES', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Visitas & Fields Summary Cards */}
        <div className="space-y-6">
          <div className="p-6 bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl shadow-xl flex flex-col justify-between h-[180px] relative overflow-hidden border border-slate-800/80">
            <div className="absolute top-[-20%] right-[-10%] w-[150px] h-[150px] bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Visitas de Campo</span>
                <h4 className="text-3xl font-black">{visitsData.upcoming}</h4>
                <p className="text-xs text-slate-400">Programadas para los próximos 7 días</p>
              </div>
              <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl">
                <Calendar className="w-5 h-5 text-[#FF6A23]" />
              </div>
            </div>
            <Link to="/visits" className="text-xs font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1 mt-4">
              Ver cronograma <ArrowRight size={12} />
            </Link>
          </div>

          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm flex flex-col justify-between h-[180px]">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Visitas Recientes</span>
                <h4 className="text-3xl font-black text-slate-800 dark:text-white">{visitsData.recent}</h4>
                <p className="text-xs text-slate-400 dark:text-slate-500">Completadas en los últimos 7 días</p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 rounded-2xl">
                <MapPin className="w-5 h-5 text-emerald-500" />
              </div>
            </div>
            <Link to="/visits" className="text-xs font-bold text-[#FF6A23] hover:underline flex items-center gap-1 mt-4">
              Ver reportes de visita <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
