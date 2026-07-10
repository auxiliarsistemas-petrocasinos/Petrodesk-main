import { useEffect, useState } from 'react'
import { MapPin, Plus, UserCheck, Briefcase, LayoutGrid, List as ListIcon, Globe, Eye, Pencil, Trash2 } from 'lucide-react'
import Modal from '../components/Modal'
import { api } from '../lib/api'
import { showToast } from '../components/Toast'

interface Field {
  id: string
  name: string
  location: string
  description?: string
  supervisorName?: string
  supervisorPhone?: string
  coordinatorName?: string
  coordinatorPhone?: string
  hseName?: string
  hsePhone?: string
}

export default function Fields() {
  const [fields, setFields] = useState<Field[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [selectedField, setSelectedField] = useState<Field | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  
  // State for form
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    description: '',
    supervisorName: '',
    supervisorPhone: '',
    coordinatorName: '',
    coordinatorPhone: '',
    hseName: '',
    hsePhone: ''
  })
  const [editingId, setEditingId] = useState<string | null>(null)

  const fetchFields = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/fields`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
      
      if (!res.ok) {
        throw new Error('Error al cargar campos')
      }

      const data = await res.json()
      if (Array.isArray(data)) {
        setFields(data)
      } else {
        setFields([])
      }
    } catch (err) {
      console.error(err)
      setFields([])
    } finally {
      setLoading(false)
    }
  }


  useEffect(() => {
    fetchFields()
    api.get('/fields/permissions').then(data => setIsAdmin(data?.canManage === true)).catch(() => setIsAdmin(false))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const url = editingId ? `${import.meta.env.VITE_API_URL || '/api'}/fields/${editingId}` : `${import.meta.env.VITE_API_URL || '/api'}/fields`
    const method = editingId ? 'PATCH' : 'POST'

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
        setFormData({ 
          name: '', location: '', description: '', 
          supervisorName: '', supervisorPhone: '',
          coordinatorName: '', coordinatorPhone: '',
          hseName: '', hsePhone: ''
        })
        setEditingId(null)
        fetchFields()
        showToast(editingId ? 'Campo actualizado correctamente' : 'Campo creado correctamente', 'success')
      } else {
        const error = await res.json().catch(() => ({}))
        showToast(error.message || 'No se pudo guardar el campo', 'error')
      }
    } catch (err) {
      console.error(err)
      showToast('No se pudo guardar el campo', 'error')
    }
  }

  const handleEdit = (field: Field) => {
    setEditingId(field.id)
    setFormData({
      name: field.name,
      location: field.location,
      description: field.description || '',
      supervisorName: field.supervisorName || '',
      supervisorPhone: field.supervisorPhone || '',
      coordinatorName: field.coordinatorName || '',
      coordinatorPhone: field.coordinatorPhone || '',
      hseName: field.hseName || '',
      hsePhone: field.hsePhone || ''
    })
    setIsModalOpen(true)
  }



  const handleDelete = async (id: string) => {
    if (!confirm('¿Está seguro de eliminar este campo?')) return

    try {
      setDeletingId(id)
      const res = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/fields/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })

      if (res.ok) {
        setSelectedField(null)
        fetchFields()
        showToast('Campo eliminado correctamente', 'success')
      } else {
        const error = await res.json().catch(() => ({}))
        showToast(error.message || 'No se pudo eliminar el campo porque tiene registros asociados', 'error')
      }
    } catch (err) {
      console.error(err)
      showToast('No se pudo eliminar el campo', 'error')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Campos y Sedes</h2>
          <p className="text-slate-500 dark:text-slate-400">Administración de ubicaciones geográficas y personal a cargo</p>
        </div>
        <div className="flex gap-4">
           <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
             <button 
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 text-[#FF6A23] shadow-sm' : 'text-slate-400'}`}
                title="Vista de Lista"
             >
               <ListIcon size={20} />
             </button>
             <button 
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 text-[#FF6A23] shadow-sm' : 'text-slate-400'}`}
                title="Vista de Cards"
             >
               <LayoutGrid size={20} />
             </button>
           </div>
           {isAdmin && <button
              onClick={() => {
                setEditingId(null)
                setFormData({ 
                  name: '', location: '', description: '', 
                  supervisorName: '', supervisorPhone: '',
                  coordinatorName: '', coordinatorPhone: '',
                  hseName: '', hsePhone: ''
                })
                setIsModalOpen(true)
              }}
              className="bg-[#324158] dark:bg-white dark:text-[#324158] text-white px-6 py-2.5 rounded-xl font-bold shadow-lg transition-all flex items-center gap-2 hover:scale-[1.02] active:scale-95"
            >
              <Plus size={18} /> Agregar Campo
            </button>}
        </div>
      </div>

      {loading ? (
        <p className="text-center text-slate-400 py-12">Cargando campos...</p>
      ) : fields.length === 0 ? (
        <p className="text-center text-slate-400 py-12 italic">No hay campos registrados aún.</p>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {fields.map((field) => (
            <div key={field.id} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6 flex items-center gap-6 group hover:border-[#FF6A23] transition-all relative">
              <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-[#324158] dark:text-blue-400 group-hover:scale-105 transition-transform">
                <MapPin size={32} />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white group-hover:text-[#FF6A23] transition-colors">{field.name}</h3>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setSelectedField(field)} className="p-1.5 text-slate-400 hover:text-blue-500 transition-colors" title="Ver campo" aria-label={`Ver campo ${field.name}`}><Eye size={14} /></button>
                    {isAdmin && <>
                      <button type="button" onClick={() => handleEdit(field)} className="p-1.5 text-slate-400 hover:text-[#FF6A23] transition-colors" title="Editar campo" aria-label={`Editar campo ${field.name}`}><Pencil size={14} /></button>
                      <button type="button" disabled={deletingId === field.id} onClick={() => handleDelete(field.id)} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors disabled:opacity-40" title="Eliminar campo" aria-label={`Eliminar campo ${field.name}`}><Trash2 size={14} /></button>
                    </>}
                  </div>
                </div>
                <p className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                  <Briefcase size={14} className="opacity-40" /> {field.location}
                </p>
                <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-50 dark:border-slate-800 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                      <UserCheck size={14} />
                    </div>
                    <div>
                      <p className="text-slate-400 uppercase text-[9px] font-bold">Supervisor</p>
                      <p className="font-bold dark:text-slate-200">{field.supervisorName || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                      <UserCheck size={14} />
                    </div>
                    <div>
                      <p className="text-slate-400 uppercase text-[9px] font-bold">Coordinador</p>
                      <p className="font-bold dark:text-slate-200">{field.coordinatorName || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-slate-400 text-[10px] uppercase tracking-widest bg-slate-50/50 dark:bg-slate-800/50">
                  <th className="px-6 py-4 font-bold">Nombre del Campo</th>
                  <th className="px-6 py-4 font-bold">Ubicación</th>
                  <th className="px-6 py-4 font-bold">Supervisor</th>
                  <th className="px-6 py-4 font-bold">Coordinador</th>
                  <th className="px-6 py-4 font-bold text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {fields.map((field) => (
                  <tr key={field.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-3">
                          <MapPin size={16} className="text-[#FF6A23]" />
                          <span className="font-bold text-slate-700 dark:text-slate-200">{field.name}</span>
                       </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                       <div className="flex items-center gap-2">
                          <Globe size={14} className="opacity-40" />
                          {field.location}
                       </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-600 dark:text-slate-400">
                       {field.supervisorName || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-600 dark:text-slate-400">
                       {field.coordinatorName || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-center">
                       <div className="flex justify-center gap-2">
                         <button type="button" onClick={() => setSelectedField(field)} className="text-slate-400 hover:text-blue-500 p-2 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition-colors" title="Ver campo" aria-label={`Ver campo ${field.name}`}><Eye size={18} /></button>
                         {isAdmin && <>
                           <button type="button" onClick={() => handleEdit(field)} className="text-slate-400 hover:text-[#FF6A23] p-2 hover:bg-orange-50 dark:hover:bg-orange-950/30 rounded-lg transition-colors" title="Editar campo" aria-label={`Editar campo ${field.name}`}><Pencil size={18} /></button>
                           <button type="button" disabled={deletingId === field.id} onClick={() => handleDelete(field.id)} className="text-slate-400 hover:text-red-500 p-2 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors disabled:opacity-40" title="Eliminar campo" aria-label={`Eliminar campo ${field.name}`}><Trash2 size={18} /></button>
                         </>}
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal isOpen={!!selectedField} onClose={() => setSelectedField(null)} title={selectedField?.name || 'Detalle del Campo'}>
        {selectedField && <div className="space-y-5 text-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FieldDetail label="Ubicación" value={selectedField.location} />
            <FieldDetail label="Descripción" value={selectedField.description} />
            <FieldDetail label="Coordinador" value={selectedField.coordinatorName} />
            <FieldDetail label="Teléfono coordinador" value={selectedField.coordinatorPhone} />
            <FieldDetail label="Supervisor" value={selectedField.supervisorName} />
            <FieldDetail label="Teléfono supervisor" value={selectedField.supervisorPhone} />
            <FieldDetail label="Responsable HSE" value={selectedField.hseName} />
            <FieldDetail label="Teléfono HSE" value={selectedField.hsePhone} />
          </div>
          {isAdmin && <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button type="button" onClick={() => { const field = selectedField; setSelectedField(null); handleEdit(field) }} className="flex items-center gap-2 px-4 py-2 font-bold text-[#FF6A23] hover:bg-orange-50 dark:hover:bg-orange-950/20 rounded-xl"><Pencil size={15} /> Editar campo</button>
            <button type="button" disabled={deletingId === selectedField.id} onClick={() => handleDelete(selectedField.id)} className="flex items-center gap-2 px-4 py-2 font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl disabled:opacity-40"><Trash2 size={15} /> Eliminar campo</button>
          </div>}
        </div>}
      </Modal>

      {/* MODAL CRUD CAMPO */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? "Editar Campo" : "Agregar Nueva Sede o Campo"}
      >
        <form onSubmit={handleSubmit} className="space-y-6 max-h-[75vh] overflow-y-auto pr-2 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Nombre del Campo</label>
              <input 
                type="text" 
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border-none outline-none focus:ring-2 focus:ring-[#FF6A23] dark:text-white" 
                placeholder="Ej: Campo Petrolero Norte" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Ubicación / Ciudad</label>
              <div className="relative">
                <MapPin size={16} className="absolute left-3 top-3.5 text-slate-400" />
                <input 
                  type="text" 
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className="w-full p-3 pl-10 bg-slate-50 dark:bg-slate-800 rounded-xl border-none outline-none focus:ring-2 focus:ring-[#FF6A23] dark:text-white" 
                  placeholder="Ej: Casanare, Colombia" 
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Descripción e Indicaciones</label>
            <textarea 
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border-none outline-none focus:ring-2 focus:ring-[#FF6A23] dark:text-white" 
              placeholder="Instrucciones para llegar, requisitos de ingreso, etc."
            ></textarea>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Personal a Cargo</h4>
            
            <div className="space-y-6">
              {/* Coordinador */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/50 dark:bg-slate-800/30 p-4 rounded-2xl">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Coordinador</label>
                  <input 
                    type="text" 
                    value={formData.coordinatorName}
                    onChange={(e) => setFormData({...formData, coordinatorName: e.target.value})}
                    className="w-full p-2.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-[#FF6A23] dark:text-white text-sm" 
                    placeholder="Nombre completo" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Teléfono Coordinador</label>
                  <input 
                    type="text" 
                    value={formData.coordinatorPhone}
                    onChange={(e) => setFormData({...formData, coordinatorPhone: e.target.value})}
                    className="w-full p-2.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-[#FF6A23] dark:text-white text-sm" 
                    placeholder="Ej: +57 300..." 
                  />
                </div>
              </div>

              {/* Supervisor */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/50 dark:bg-slate-800/30 p-4 rounded-2xl">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Supervisor</label>
                  <input 
                    type="text" 
                    value={formData.supervisorName}
                    onChange={(e) => setFormData({...formData, supervisorName: e.target.value})}
                    className="w-full p-2.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-[#FF6A23] dark:text-white text-sm" 
                    placeholder="Nombre completo" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Teléfono Supervisor</label>
                  <input 
                    type="text" 
                    value={formData.supervisorPhone}
                    onChange={(e) => setFormData({...formData, supervisorPhone: e.target.value})}
                    className="w-full p-2.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-[#FF6A23] dark:text-white text-sm" 
                    placeholder="Ej: +57 300..." 
                  />
                </div>
              </div>

              {/* HSE */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/50 dark:bg-slate-800/30 p-4 rounded-2xl">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Responsable HSE</label>
                  <input 
                    type="text" 
                    value={formData.hseName}
                    onChange={(e) => setFormData({...formData, hseName: e.target.value})}
                    className="w-full p-2.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-[#FF6A23] dark:text-white text-sm" 
                    placeholder="Nombre completo" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Teléfono HSE</label>
                  <input 
                    type="text" 
                    value={formData.hsePhone}
                    onChange={(e) => setFormData({...formData, hsePhone: e.target.value})}
                    className="w-full p-2.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-[#FF6A23] dark:text-white text-sm" 
                    placeholder="Ej: +57 300..." 
                  />
                </div>
              </div>
            </div>
          </div>

          <button type="submit" className="w-full py-4 bg-[#FF6A23] text-white font-bold rounded-xl shadow-lg shadow-orange-500/20 hover:bg-[#e55a1d] transition-all sticky bottom-0">
            {editingId ? "Guardar Cambios" : "Registrar Campo"}
          </button>
        </form>
      </Modal>
    </div>
  )
}

function FieldDetail({ label, value }: { label: string; value?: string }) {
  return <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
    <span className="block text-xs font-bold uppercase text-slate-400 mb-1">{label}</span>
    <span className="font-medium text-slate-700 dark:text-slate-200">{value || 'N/A'}</span>
  </div>
}

