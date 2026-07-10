import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Ticket,
  Package,
  RefreshCw,
  MapPin,
  BarChart3,
  Search,
  Moon,
  Sun,
  Bell,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Settings,
  Users,
  ChevronDown,
  Calendar,
  List
} from 'lucide-react'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Tickets from './pages/Tickets'
import Assets from './pages/Assets'
import Loans from './pages/Loans'
import Fields from './pages/Fields'
import Reports from './pages/Reports'
import UsersPage from './pages/Users'
import Visits from './pages/Visits'
import { useNotifications } from './hooks/useNotifications'
import { ToastContainer } from './components/Toast'


function AppContent({ user, onLogout, darkMode, setDarkMode }: any) {
  const location = useLocation()
  const isAdmin = user?.role === 'ADMIN'
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isAdminOpen, setIsAdminOpen] = useState(false)
  const [isFieldsOpen, setIsFieldsOpen] = useState(false)
  const [isNotifOpen, setIsNotifOpen] = useState(false)

  const { notifications, unreadCount, fetchNotifications, markAsRead, markAllAsRead } = useNotifications()

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Tickets', path: '/tickets', icon: <Ticket size={20} /> },
    { name: 'Inventario', path: '/assets', icon: <Package size={20} /> },
    { name: 'Préstamos', path: '/loans', icon: <RefreshCw size={20} /> },
  ]

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#0b1120]">
      {/* Sidebar */}
      <aside className={`${isCollapsed ? 'w-20' : 'w-64'} bg-[#324158] text-white hidden md:flex flex-col transition-all duration-300 relative`}>
        {/* Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label={isCollapsed ? 'Expandir navegacion' : 'Contraer navegacion'}
          className="absolute -right-3 top-10 bg-[#FF6A23] text-white p-1 rounded-full shadow-lg border-2 border-white dark:border-slate-900 z-50 hover:scale-110 transition-transform"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        <div className={`p-6 flex justify-center`}>
          {isCollapsed ? (
            <span className="text-xl font-bold text-[#FF6A23]">P</span>
          ) : (
            <h1 className="text-2xl font-bold tracking-tight">Petro<span className="text-[#FF6A23]">desk</span></h1>
          )}
        </div>


        <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium ${location.pathname === item.path
                  ? 'bg-[#FF6A23] text-white shadow-lg shadow-orange-500/20'
                  : 'hover:bg-slate-700/50 text-slate-300 hover:text-white'
                } ${isCollapsed ? 'justify-center' : ''}`}
              title={isCollapsed ? item.name : ''}
            >
              <span className="opacity-80 shrink-0">{item.icon}</span>
              {!isCollapsed && <span>{item.name}</span>}
            </Link>
          ))}

          {/* Módulo Campos con sub-modulos */}
          <div className="pt-2">
            <button
              onClick={() => !isCollapsed && setIsFieldsOpen(!isFieldsOpen)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium text-slate-300 hover:text-white hover:bg-slate-700/50 ${isCollapsed ? 'justify-center' : 'justify-between'}`}
              title={isCollapsed ? 'Campos' : ''}
            >
              <div className="flex items-center gap-3">
                <MapPin size={20} className="opacity-80 shrink-0" />
                {!isCollapsed && <span>Campos</span>}
              </div>
              {!isCollapsed && <ChevronDown size={14} className={`transition-transform ${isFieldsOpen ? 'rotate-180' : ''}`} />}
            </button>

            {isFieldsOpen && !isCollapsed && (
              <div className="ml-4 mt-2 space-y-1 animate-in slide-in-from-top-2 duration-200 text-xs">
                <Link
                  to="/fields"
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg transition ${location.pathname === '/fields'
                      ? 'text-[#FF6A23] font-bold'
                      : 'text-slate-400 hover:text-white'
                    }`}
                >
                  <List size={14} />
                  Consultar Campos
                </Link>
                <Link
                  to="/visits"
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg transition ${location.pathname === '/visits'
                      ? 'text-[#FF6A23] font-bold'
                      : 'text-slate-400 hover:text-white'
                    }`}
                >
                  <Calendar size={14} />
                  Gestión de Visitas
                </Link>
              </div>
            )}

            {isCollapsed && (
              <div className="flex flex-col gap-1 mt-1 items-center">
                <Link
                  to="/fields"
                  className={`p-3 rounded-xl transition ${location.pathname === '/fields' ? 'bg-[#FF6A23] text-white' : 'text-slate-400 hover:bg-slate-700/50'}`}
                  title="Consultar Campos"
                >
                  <List size={20} />
                </Link>
                <Link
                  to="/visits"
                  className={`p-3 rounded-xl transition ${location.pathname === '/visits' ? 'bg-[#FF6A23] text-white' : 'text-slate-400 hover:bg-slate-700/50'}`}
                  title="Visitas"
                >
                  <Calendar size={20} />
                </Link>
              </div>
            )}
          </div>

          <Link
            to="/reports"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium ${location.pathname === '/reports'
                ? 'bg-[#FF6A23] text-white shadow-lg shadow-orange-500/20'
                : 'hover:bg-slate-700/50 text-slate-300 hover:text-white'
              } ${isCollapsed ? 'justify-center' : ''}`}
            title={isCollapsed ? 'Reportes' : ''}
          >
            <BarChart3 size={20} className="opacity-80 shrink-0" />
            {!isCollapsed && <span>Reportes</span>}
          </Link>

          {/* Administración Accordion */}
          {isAdmin && <div className="pt-2 border-t border-slate-700/50 mt-4">
            <button
              onClick={() => !isCollapsed && setIsAdminOpen(!isAdminOpen)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium text-slate-300 hover:text-white hover:bg-slate-700/50 ${isCollapsed ? 'justify-center' : 'justify-between'}`}
              title={isCollapsed ? 'Administración' : ''}
            >
              <div className="flex items-center gap-3">
                <Settings size={20} className="opacity-80 shrink-0" />
                {!isCollapsed && <span>Administración</span>}
              </div>
              {!isCollapsed && <ChevronDown size={14} className={`transition-transform ${isAdminOpen ? 'rotate-180' : ''}`} />}
            </button>

            {isAdminOpen && !isCollapsed && (
              <div className="ml-4 mt-2 space-y-1 animate-in slide-in-from-top-2 duration-200">
                <Link
                  to="/admin/users"
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition ${location.pathname === '/admin/users'
                      ? 'text-[#FF6A23] font-bold'
                      : 'text-slate-400 hover:text-white'
                    }`}
                >
                  <Users size={16} />
                  Usuarios
                </Link>
              </div>
            )}

            {isCollapsed && (
              <Link
                to="/admin/users"
                className={`flex justify-center p-3 mt-1 rounded-xl transition ${location.pathname === '/admin/users' ? 'bg-[#FF6A23] text-white' : 'text-slate-400 hover:bg-slate-700/50'
                  }`}
                title="Usuarios"
              >
                <Users size={20} />
              </Link>
            )}
          </div>}
        </nav>

        <div className={`p-6 border-t border-slate-700/50 ${isCollapsed ? 'flex flex-col items-center gap-4' : ''}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#FF6A23] flex items-center justify-center font-bold shrink-0">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            {!isCollapsed && (
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-bold truncate">{user?.username}</p>
                <p className="text-xs text-slate-400 capitalize">{user?.role?.toLowerCase().replace('_', ' ')}</p>
              </div>
            )}
          </div>
          <button
            onClick={onLogout}
            className={`w-full mt-6 py-2 text-xs font-bold text-slate-400 hover:text-white uppercase tracking-widest transition flex items-center gap-2 ${isCollapsed ? 'justify-center' : 'justify-center'}`}
            title={isCollapsed ? 'Cerrar Sesión' : ''}
          >
            <LogOut size={14} />
            {!isCollapsed && 'Cerrar Sesión'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-20 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between px-8">
          <div className="flex items-center gap-4">
            <div className="md:hidden text-2xl font-bold text-[#324158] dark:text-white">Petrodesk</div>
            <div className="relative">
              <input type="text" aria-label="Buscar" placeholder="Buscar..." className="pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-full text-sm border-none focus:ring-1 focus:ring-slate-200 outline-none w-64 dark:text-white" />
              <Search size={16} className="absolute left-3 top-2.5 opacity-30 dark:text-white" />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition text-slate-500 dark:text-slate-400"
              title={darkMode ? 'Modo Claro' : 'Modo Oscuro'}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <div className="relative text-slate-500 dark:text-slate-400">
              <button
                onClick={() => {
                  setIsNotifOpen(!isNotifOpen)
                  if (!isNotifOpen) {
                    fetchNotifications()
                  }
                }}
                className="relative p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition text-slate-500 dark:text-slate-400"
                title="Notificaciones"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center text-white font-bold animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {isNotifOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-3 duration-200">
                  <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
                    <span className="font-bold text-sm text-slate-800 dark:text-white">Notificaciones</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={() => markAllAsRead()}
                        className="text-xs font-bold text-[#FF6A23] hover:underline"
                      >
                        Marcar todo leído
                      </button>
                    )}
                  </div>
                  <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 custom-scrollbar">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400 dark:text-slate-500">
                        No tienes notificaciones
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <button
                          type="button"
                          key={notif.id}
                          disabled={Boolean(notif.readAt)}
                          onClick={() => {
                            if (!notif.readAt) markAsRead(notif.id)
                          }}
                          className={`block w-full p-4 text-left text-xs transition hover:bg-slate-50 disabled:cursor-default disabled:hover:bg-transparent dark:hover:bg-slate-800/50 dark:disabled:hover:bg-transparent ${
                            !notif.readAt ? 'bg-orange-50/20 dark:bg-orange-950/5 font-medium' : ''
                          }`}
                        >
                          <div className="text-slate-700 dark:text-slate-300 mb-1 leading-normal">
                            {notif.message}
                          </div>
                          <div className="text-[10px] text-slate-400 dark:text-slate-500">
                            {new Date(notif.createdAt).toLocaleDateString('es-ES', {
                              day: '2-digit',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/tickets" element={<Tickets />} />
            <Route path="/assets" element={<Assets />} />
            <Route path="/loans" element={<Loans />} />
            <Route path="/fields" element={<Fields />} />
            <Route path="/visits" element={<Visits />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/admin/users" element={isAdmin ? <UsersPage /> : <Navigate to="/" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
      <ToastContainer />
    </div>
  )
}

function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'))
  const [user, setUser] = useState<any>(JSON.parse(localStorage.getItem('user') || 'null'))
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark')

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [darkMode])

  const handleLogin = (accessToken: string, userData: any) => {
    setToken(accessToken)
    setUser(userData)
    localStorage.setItem('token', accessToken)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const handleLogout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  if (!token) {
    return <Login onLogin={handleLogin} />
  }

  return (
    <Router>
      <AppContent user={user} onLogout={handleLogout} darkMode={darkMode} setDarkMode={setDarkMode} />
    </Router>
  )
}

export default App
