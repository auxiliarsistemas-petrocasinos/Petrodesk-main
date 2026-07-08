import { useState } from 'react'

export default function Login({ onLogin }: { onLogin: (token: string, user: any) => void }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [tempData, setTempData] = useState<any>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (response.ok) {
        if (data.user.mustChangePassword) {
          setShowChangePassword(true)
          setTempData(data)
        } else {
          onLogin(data.access_token, data.user)
        }
      } else {
        setError(data.message || 'Credenciales incorrectas')
      }
    } catch (err) {
      setError('Error de conexión con el servidor')
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }
    if (newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/users/${tempData.user.id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tempData.access_token}`
        },
        body: JSON.stringify({ 
          password: newPassword,
          mustChangePassword: false 
        }),
      })

      if (response.ok) {
        const updatedUser = { ...tempData.user, mustChangePassword: false }
        onLogin(tempData.access_token, updatedUser)
      } else {
        setError('No se pudo actualizar la contraseña')
      }
    } catch (err) {
      setError('Error al conectar con el servidor')
    } finally {
      setLoading(false)
    }
  }

  if (showChangePassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#324158] px-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-8 space-y-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Cambio Obligatorio</h1>
            <p className="mt-2 text-sm text-slate-500">Por seguridad, debes establecer una nueva contraseña en tu primer ingreso.</p>
          </div>

          <form className="space-y-6" onSubmit={handleChangePassword}>
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-100 rounded-lg text-center font-medium">
                {error}
              </div>
            )}
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Nueva Contraseña</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-[#FF6A23] outline-none"
                placeholder="••••••••"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Confirmar Contraseña</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-[#FF6A23] outline-none"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#FF6A23] text-white font-bold rounded-xl shadow-lg hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? 'Actualizando...' : 'Actualizar y Entrar'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#324158] px-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-8 space-y-8 transform transition-all hover:scale-[1.01]">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-[#324158] dark:text-white tracking-tight">
            Petro<span className="text-[#FF6A23]">desk</span>
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Ingresa a tu portal de soporte IT
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-100 dark:bg-red-900/30 rounded-lg text-center font-medium">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Nombre de Usuario</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-[#FF6A23] focus:border-transparent outline-none transition-all"
              placeholder="Ej: usuario1"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Contraseña</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-[#FF6A23] focus:border-transparent outline-none transition-all"
              placeholder="••••••••"
            />
          </div>



          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-[#FF6A23] hover:bg-[#e55a1d] text-white font-bold rounded-xl shadow-lg shadow-orange-500/30 transform transition-active active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="text-center text-xs text-slate-400 uppercase tracking-widest pt-4">
          Internal Systems Only
        </div>
      </div>
    </div>
  )
}
