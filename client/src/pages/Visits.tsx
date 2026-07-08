import { useState, useEffect } from 'react'
import { Calendar, Plus, FileText, DollarSign, ArrowRight, ChevronLeft, Upload, LayoutGrid, List as ListIcon, Trash2 } from 'lucide-react'
import Modal from '../components/Modal'

interface Visit {
  id: string
  fieldId: string
  field: { name: string }
  startDate: string
  endDate: string
  description: string
  expensesTotal: number
  reportPath?: string
}

interface Field {
  id: string
  name: string
}

export default function Visits() {
  const [visits, setVisits] = useState<Visit[]>([])
  const [fields, setFields] = useState<Field[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [userRole] = useState(() => JSON.parse(localStorage.getItem('user') || '{}').role)
  const [uploading, setUploading] = useState(false)

  const [formData, setFormData] = useState({
    fieldId: '',
    startDate: '',
    endDate: '',
    description: '',
    expensesTotal: 0
  })

  const fetchVisits = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/visits`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
      if (res.ok) {
        const data = await res.json()
        setVisits(data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchFields = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/fields`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
      if (res.ok) {
        const data = await res.json()
        setFields(data)
      }
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchVisits()
    fetchFields()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/visits`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        setIsModalOpen(false)
        setFormData({ fieldId: '', startDate: '', endDate: '', description: '', expensesTotal: 0 })
        fetchVisits()
        alert('Visita programada con éxito.')
      } else {
        const errData = await res.json()
        alert(`Error al programar visita: ${errData.message || res.statusText}`)
      }
    } catch (err) {
      console.error(err)
      alert('Error de conexión al programar visita.')
    }
  }

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    if (!confirm('¿Está seguro de eliminar esta visita?')) return

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/visits/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })

      if (res.ok) {
        fetchVisits()
        if (selectedVisit?.id === id) setSelectedVisit(null)
      } else {
        alert('No tiene permisos para eliminar visitas o hubo un error.')
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.type !== 'application/pdf') {
      alert('Solo se permiten archivos en formato PDF.')
      return
    }

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/visits/${selectedVisit?.id}/report`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      })

      if (res.ok) {
        const updatedVisit = await res.json()
        setSelectedVisit(updatedVisit)
        setVisits(prev => prev.map(v => v.id === updatedVisit.id ? updatedVisit : v))
        alert('Informe cargado con éxito.')
      } else {
        const errData = await res.json()
        alert(`Error al cargar el archivo: ${errData.message || res.statusText}`)
      }
    } catch (err) {
      console.error(err)
      alert('Error de conexión al cargar el informe.')
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteReport = async (visitId: string) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/visits/${visitId}/report`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (res.ok) {
        const updatedVisit = await res.json()
        setSelectedVisit(updatedVisit)
        setVisits(prev => prev.map(v => v.id === updatedVisit.id ? updatedVisit : v))
        alert('Informe eliminado con éxito.')
      } else {
        const errData = await res.json()
        alert(`Error al eliminar el informe: ${errData.message || res.statusText}`)
      }
    } catch (err) {
      console.error(err)
      alert('Error de conexión al eliminar el informe.')
    }
  }

  // View: Visit Details (Report & Expenses)
  if (selectedVisit) {
    return (
      <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
        <div className="flex justify-between items-center">
          <button onClick={() => setSelectedVisit(null)} className="flex items-center gap-2 text-slate-500 hover:text-[#FF6A23] transition-colors">
            <ChevronLeft size={18} /> Volver al listado
          </button>
          {userRole === 'ADMIN' && (
            <button 
              onClick={() => handleDelete(selectedVisit.id)}
              className="flex items-center gap-2 text-red-500 hover:bg-red-50 px-4 py-2 rounded-xl transition-all font-bold text-sm"
            >
              <Trash2 size={18} /> Eliminar Visita
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-slate-800 dark:text-white">{selectedVisit.field?.name}</h2>
                  <p className="text-slate-500 flex items-center gap-2 mt-1 text-sm">
                    <Calendar size={16} /> 
                    {new Date(selectedVisit.startDate).toLocaleDateString('es-ES')} - {new Date(selectedVisit.endDate).toLocaleDateString('es-ES')}
                  </p>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full uppercase tracking-wider">Activa</span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-50 dark:border-slate-800 pt-6 text-sm">
                <span className="font-bold block mb-1">Descripción:</span>
                {selectedVisit.description || 'Sin descripción.'}
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
              <h4 className="font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                <FileText size={20} className="text-[#FF6A23]" /> Informe de la Visita
              </h4>
              
              {selectedVisit.reportPath ? (
                <div className="space-y-4">
                  <div className="flex flex-col md:flex-row items-center justify-between p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-red-50 dark:bg-red-950/30 rounded-xl flex items-center justify-center text-red-500">
                        <FileText size={24} />
                      </div>
                      <div className="text-left">
                        <h5 className="font-bold text-slate-800 dark:text-white text-sm">Informe Técnico.pdf</h5>
                        <p className="text-xs text-slate-400">Visita al campo {selectedVisit.field?.name}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                      <a 
                        href={`${import.meta.env.VITE_API_URL || '/api'}${selectedVisit.reportPath}`} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="flex-1 md:flex-none text-center bg-[#FF6A23] hover:bg-[#e55a1d] text-white px-4 py-2 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-2"
                      >
                        Ver / Descargar
                      </a>
                      <button 
                        onClick={() => {
                          if (confirm('¿Está seguro de eliminar el informe?')) {
                            handleDeleteReport(selectedVisit.id);
                          }
                        }}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-colors"
                        title="Eliminar informe"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="relative">
                    <input 
                      type="file" 
                      accept=".pdf" 
                      onChange={handleFileUpload} 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                      disabled={uploading}
                    />
                    <button className="w-full py-3 border border-dashed border-slate-200 dark:border-slate-800 hover:border-[#FF6A23] rounded-xl text-xs font-bold text-slate-500 dark:text-slate-400 transition-colors">
                      {uploading ? 'Subiendo...' : 'Reemplazar archivo PDF'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="relative border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center group hover:border-[#FF6A23] transition-colors cursor-pointer">
                  <input 
                    type="file" 
                    accept=".pdf" 
                    onChange={handleFileUpload} 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={uploading}
                  />
                  <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Upload size={32} className="text-slate-400" />
                  </div>
                  <p className="text-sm font-bold dark:text-white">
                    {uploading ? 'Subiendo informe...' : 'Cargar Informe Final'}
                  </p>
                  <p className="text-xs text-slate-400 mt-2">Haz clic para buscar un archivo PDF</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
              <h4 className="font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                <DollarSign size={20} className="text-green-500" /> Relación de Gastos
              </h4>
              <div className="space-y-4">
                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <span className="font-bold text-slate-400 uppercase text-[10px]">Total Gastos</span>
                  <span className="text-2xl font-black text-[#324158] dark:text-white">${selectedVisit.expensesTotal?.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // View: Main List
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Gestión de Visitas</h2>
          <p className="text-slate-500 dark:text-slate-400">Planifica y documenta las salidas a campo</p>
        </div>
        <div className="flex gap-4">
           <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
             <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 text-[#FF6A23] shadow-sm' : 'text-slate-400'}`}>
               <ListIcon size={20} />
             </button>
             <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 text-[#FF6A23] shadow-sm' : 'text-slate-400'}`}>
               <LayoutGrid size={20} />
             </button>
           </div>
           <button onClick={() => setIsModalOpen(true)} className="bg-[#FF6A23] hover:bg-[#e55a1d] text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-orange-500/20 transition-all flex items-center gap-2 hover:scale-[1.02] active:scale-95">
              <Plus size={18} /> Programar Visita
           </button>
        </div>
      </div>

      {loading ? (
        <p className="text-center py-12 text-slate-400">Cargando visitas...</p>
      ) : visits.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
          <Calendar size={48} className="mx-auto text-slate-200 mb-4" />
          <p className="text-slate-400 font-medium">No hay visitas programadas</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-slate-400 text-[10px] uppercase tracking-widest bg-slate-50/50 dark:bg-slate-800/50">
                  <th className="px-6 py-4 font-bold">Campo</th>
                  <th className="px-6 py-4 font-bold">Fecha Inicio</th>
                  <th className="px-6 py-4 font-bold">Fecha Fin</th>
                  <th className="px-6 py-4 font-bold">Gastos</th>
                  <th className="px-6 py-4 font-bold text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {visits.map((visit) => (
                  <tr key={visit.id} onClick={() => setSelectedVisit(visit)} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer group">
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-3">
                          <Calendar size={16} className="text-[#FF6A23]" />
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-700 dark:text-slate-200">{visit.field?.name}</span>
                            {visit.reportPath && (
                              <span className="text-[10px] text-red-500 font-semibold flex items-center gap-1 mt-0.5">
                                <FileText size={10} /> PDF cargado
                              </span>
                            )}
                          </div>
                       </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                       {new Date(visit.startDate).toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                       {new Date(visit.endDate).toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-white">
                       ${visit.expensesTotal?.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-center">
                       <div className="flex justify-center gap-2">
                         <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-400 group-hover:text-[#FF6A23] transition-all">
                           <ArrowRight size={16} />
                         </div>
                         {userRole === 'ADMIN' && (
                           <button onClick={(e) => handleDelete(visit.id, e)} className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-all">
                             <Trash2 size={16} />
                           </button>
                         )}
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL PARA CREAR VISITA */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Programar Nueva Visita">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Seleccionar Campo</label>
            <select 
              required
              value={formData.fieldId}
              onChange={(e) => setFormData({...formData, fieldId: e.target.value})}
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border-none outline-none focus:ring-2 focus:ring-[#FF6A23] dark:text-white appearance-none"
            >
              <option value="">-- Seleccionar Campo --</option>
              {fields.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Fecha Inicio</label>
              <input type="date" required value={formData.startDate} onChange={(e) => setFormData({...formData, startDate: e.target.value})} className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border-none outline-none focus:ring-2 focus:ring-[#FF6A23] dark:text-white" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Fecha Fin</label>
              <input type="date" required value={formData.endDate} onChange={(e) => setFormData({...formData, endDate: e.target.value})} className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border-none outline-none focus:ring-2 focus:ring-[#FF6A23] dark:text-white" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Propósito</label>
            <textarea rows={3} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border-none outline-none focus:ring-2 focus:ring-[#FF6A23] dark:text-white" placeholder="Objetivo de la visita..."></textarea>
          </div>
          <button type="submit" className="w-full py-4 bg-[#FF6A23] text-white font-bold rounded-xl shadow-lg shadow-orange-500/20 hover:bg-[#e55a1d] transition-all">
            Confirmar Programación
          </button>
        </form>
      </Modal>
    </div>
  )
}

