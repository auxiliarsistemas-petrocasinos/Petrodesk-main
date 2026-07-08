import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, User as UserIcon, Phone, Mail, CheckCircle, XCircle } from 'lucide-react'
import Modal from '../components/Modal'

interface User {
  id: string
  username: string
  email: string
  firstName: string | null
  lastName: string | null
  phoneNumber: string | null
  role: string
  isActive: boolean
  mustChangePassword: boolean
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    role: 'END_USER',
    isActive: true,
    mustChangePassword: false
  })

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [userToDelete, setUserToDelete] = useState<string | null>(null)

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/users`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
      if (!res.ok) throw new Error('Error al cargar usuarios')
      const data = await res.json()
      setUsers(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error(err)
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const url = editingId ? `${import.meta.env.VITE_API_URL || '/api'}/users/${editingId}` : `${import.meta.env.VITE_API_URL || '/api'}/users`
    const method = editingId ? 'PATCH' : 'POST'

    if (!editingId && !formData.password) {
      alert('La contraseña es obligatoria para nuevos usuarios')
      return
    }

    try {
      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        setIsModalOpen(false)
        resetForm()
        fetchUsers()
      } else {
        const error = await res.json()
        alert(`Error: ${error.message || 'No se pudo guardar el usuario'}`)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      phoneNumber: '',
      role: 'END_USER',
      isActive: true,
      mustChangePassword: false
    })
    setEditingId(null)
  }

  const handleEdit = (user: User) => {
    setEditingId(user.id)
    setFormData({
      username: user.username,
      email: user.email,
      password: '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      phoneNumber: user.phoneNumber || '',
      role: user.role,
      isActive: user.isActive,
      mustChangePassword: user.mustChangePassword
    })
    setIsModalOpen(true)
  }

  const confirmDelete = (id: string) => {
    setUserToDelete(id)
    setShowDeleteModal(true)
  }

  const handleDelete = async () => {
    if (!userToDelete) return

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/users/${userToDelete}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })

      if (res.ok) {
        fetchUsers()
        setShowDeleteModal(false)
        setUserToDelete(null)
      } else {
        await res.json()
        alert(`No se puede eliminar: El usuario tiene historial activo (tickets, préstamos o activos) en el sistema.`)
        setShowDeleteModal(false)
      }

    } catch (err) {
      console.error(err)
      alert('Error de conexión al intentar eliminar.')
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Gestión de Usuarios</h2>
          <p className="text-slate-500 dark:text-slate-400">Control de acceso y perfiles de personal</p>
        </div>
        <button 
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="bg-[#324158] dark:bg-white dark:text-[#324158] text-white px-6 py-2.5 rounded-xl font-bold shadow-lg transition-all flex items-center gap-2 hover:scale-[1.02] active:scale-95"
        >
          <Plus size={18} /> Crear Usuario
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-slate-400 text-[10px] uppercase tracking-widest bg-slate-50/50 dark:bg-slate-800/50">
              <th className="px-6 py-4 font-bold">Usuario / Nombre</th>
              <th className="px-6 py-4 font-bold">Contacto</th>
              <th className="px-6 py-4 font-bold">Rol</th>
              <th className="px-6 py-4 font-bold">Estado</th>
              <th className="px-6 py-4 font-bold text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
            {loading ? (
              <tr><td colSpan={5} className="text-center py-12 text-slate-400">Cargando...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-12 text-slate-400 italic">No hay usuarios registrados</td></tr>
            ) : users.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[#FF6A23]">
                      <UserIcon size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-700 dark:text-slate-200">{user.username}</p>
                      <p className="text-xs text-slate-400">{user.firstName} {user.lastName}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-500">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2"><Mail size={12} className="opacity-40" /> {user.email}</div>
                    <div className="flex items-center gap-2"><Phone size={12} className="opacity-40" /> {user.phoneNumber || 'N/A'}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800 uppercase">
                    {user.role.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {user.isActive ? (
                      <CheckCircle size={16} className="text-green-500" />
                    ) : (
                      <XCircle size={16} className="text-red-500" />
                    )}
                    <span className={`text-xs font-medium ${user.isActive ? 'text-green-600' : 'text-red-600'}`}>
                      {user.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex justify-center gap-2">
                    <button onClick={() => handleEdit(user)} className="text-slate-400 hover:text-blue-500 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                      <Pencil size={18} />
                    </button>
                    <button onClick={() => confirmDelete(user.id)} className="text-slate-400 hover:text-red-500 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL DE ELIMINACION PERSONALIZADO */}
      <Modal 
        isOpen={showDeleteModal} 
        onClose={() => setShowDeleteModal(false)}
        title="Confirmar Eliminación"
      >
        <div className="space-y-6 text-center">
          <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-full flex items-center justify-center mx-auto">
            <Trash2 size={40} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">¿Estás absolutamente seguro?</h3>
            <p className="text-slate-500 dark:text-slate-400 mt-2">
              Esta acción no se puede deshacer. El usuario será eliminado permanentemente de la base de datos si no tiene registros asociados.
            </p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => setShowDeleteModal(false)}
              className="flex-1 px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 transition-colors"
            >
              Cancelar
            </button>
            <button 
              onClick={handleDelete}
              className="flex-1 px-6 py-3 bg-red-500 text-white font-bold rounded-xl shadow-lg shadow-red-500/20 hover:bg-red-600 transition-colors"
            >
              Sí, Eliminar
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? "Editar Usuario" : "Nuevo Usuario"}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Nombres</label>
              <input 
                type="text" 
                required
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border-none outline-none focus:ring-2 focus:ring-[#FF6A23] dark:text-white" 
                placeholder="Ej: Juan"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Apellidos</label>
              <input 
                type="text" 
                required
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border-none outline-none focus:ring-2 focus:ring-[#FF6A23] dark:text-white" 
                placeholder="Ej: Pérez"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Correo Electrónico</label>
              <input 
                type="email" 
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border-none outline-none focus:ring-2 focus:ring-[#FF6A23] dark:text-white" 
                placeholder="juan@empresa.com"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Celular</label>
              <input 
                type="text" 
                value={formData.phoneNumber}
                onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border-none outline-none focus:ring-2 focus:ring-[#FF6A23] dark:text-white" 
                placeholder="300 123 4567"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Nombre de Usuario (Login)</label>
              <input 
                type="text" 
                required
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border-none outline-none focus:ring-2 focus:ring-[#FF6A23] dark:text-white" 
                placeholder="juan.perez"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Rol del Sistema</label>
              <select 
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border-none outline-none focus:ring-2 focus:ring-[#FF6A23] dark:text-white"
              >
                <option value="ADMIN">Administrador</option>
                <option value="IT_SUPPORT">Soporte IT</option>
                <option value="END_USER">Usuario Final</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
              {editingId ? "Contraseña (dejar vacío para no cambiar)" : "Contraseña Inicial"}
            </label>
            <input 
              type="password" 
              required={!editingId}
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border-none outline-none focus:ring-2 focus:ring-[#FF6A23] dark:text-white" 
              placeholder="••••••••"
            />
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={formData.mustChangePassword}
                  onChange={(e) => setFormData({...formData, mustChangePassword: e.target.checked})}
                />
                <div className="w-10 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF6A23]"></div>
              </div>
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-white transition-colors">
                Obligar a cambiar contraseña al primer ingreso
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                />
                <div className="w-10 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
              </div>
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-white transition-colors">
                Usuario Activo
              </span>
            </label>
          </div>

          <button type="submit" className="w-full py-4 bg-[#FF6A23] text-white font-bold rounded-xl shadow-lg shadow-orange-500/20 hover:bg-[#e55a1d] transition-all">
            {editingId ? "Guardar Cambios" : "Crear Usuario"}
          </button>
        </form>
      </Modal>
    </div>
  )
}
