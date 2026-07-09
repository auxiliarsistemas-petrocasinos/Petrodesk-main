import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Plus, Search, Package, ChevronLeft, ChevronRight, ArrowUpRight,
  X, Clock, Hash, Edit3
} from 'lucide-react'
import Modal from '../components/Modal'
import { api } from '../lib/api'
import { showToast } from '../components/Toast'

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  AVAILABLE: { label: 'Disponible', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/50' },
  IN_USE: { label: 'En Uso', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900/50' },
  MAINTENANCE: { label: 'Mantenimiento', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50' },
  RETIRED: { label: 'Retirado', color: 'text-slate-500 dark:text-slate-400', bg: 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700' },
}

const defaultOptions = {
  brand: ['Dell', 'HP', 'Lenovo', 'Asus', 'Acer', 'Apple'],
  screenBrand: ['Dell', 'HP', 'Lenovo', 'Samsung', 'LG', 'AOC'],
  equipmentType: ['Portatil', 'Desktop', 'All in One', 'Workstation', 'Servidor'],
  operatingSystem: ['Windows 10', 'Windows 11', 'macOS', 'Linux', 'Sin sistema operativo'],
  ram: ['4 GB', '8 GB', '12 GB', '16 GB', '24 GB', '32 GB', '64 GB'],
  ssdStorage: ['No aplica', '128 GB', '256 GB', '512 GB', '1 TB', '2 TB'],
  hddStorage: ['No aplica', '500 GB', '1 TB', '2 TB', '4 TB'],
  screenSize: ['No aplica', '19"', '20"', '21.5"', '22"', '24"', '27"', '32"'],
  antivirus: ['Windows Defender', 'ESET', 'Kaspersky', 'Bitdefender', 'McAfee', 'Norton', 'Sin antivirus'],
}

type AssetForm = {
  fieldId: string
  assignedUserId: string
  brand: string
  model: string
  serial: string
  equipmentType: string
  operatingSystem: string
  processor: string
  ram: string
  ssdStorage: string
  hddStorage: string
  screenCode: string
  screenBrand: string
  screenSerial: string
  screenSize: string
  antivirus: string
  observations: string
  status: string
}

const emptyForm: AssetForm = {
  fieldId: '',
  assignedUserId: '',
  brand: '',
  model: '',
  serial: '',
  equipmentType: '',
  operatingSystem: '',
  processor: '',
  ram: '',
  ssdStorage: '',
  hddStorage: '',
  screenCode: '',
  screenBrand: '',
  screenSerial: '',
  screenSize: '',
  antivirus: '',
  observations: '',
  status: 'AVAILABLE',
}

function StatusBadge({ status }: { status: string }) {
  const cfg = statusConfig[status] || statusConfig.AVAILABLE
  return <span className={`inline-flex items-center px-2.5 py-1 text-xs font-bold rounded-lg border ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>
}

function uniqueOptions(defaults: string[], dynamic: string[] = []) {
  return [...new Set([...defaults, ...dynamic].filter(Boolean))].sort((a, b) => a.localeCompare(b))
}

const inputClass = 'w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A23]/30 focus:border-[#FF6A23] text-slate-800 dark:text-white'
const labelClass = 'block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5'

export default function Assets() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [assets, setAssets] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '')
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')
  const [page, setPage] = useState(1)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [selectedAsset, setSelectedAsset] = useState<any>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [createForm, setCreateForm] = useState<AssetForm>(emptyForm)
  const [editMode, setEditMode] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [customEquipmentType, setCustomEquipmentType] = useState('')
  const [users, setUsers] = useState<any[]>([])
  const [fields, setFields] = useState<any[]>([])
  const [formOptions, setFormOptions] = useState<Record<string, string[]>>({})

  const getFormOptions = useCallback(async () => {
    try {
      const data = await api.get('/assets/form-options')
      setFormOptions(data || {})
    } catch {
      setFormOptions({})
    }
  }, [])

  useEffect(() => {
    api.get('/users').then(data => setUsers(Array.isArray(data) ? data : [])).catch(() => {})
    api.get('/fields').then(data => setFields(Array.isArray(data) ? data : [])).catch(() => {})
    getFormOptions()
  }, [getFormOptions])

  const options = useMemo(() => ({
    brand: uniqueOptions(defaultOptions.brand, formOptions.brand),
    screenBrand: uniqueOptions(defaultOptions.screenBrand, formOptions.screenBrand),
    equipmentType: uniqueOptions(defaultOptions.equipmentType, formOptions.equipmentType),
    operatingSystem: uniqueOptions(defaultOptions.operatingSystem, formOptions.operatingSystem),
    ram: uniqueOptions(defaultOptions.ram, formOptions.ram),
    ssdStorage: uniqueOptions(defaultOptions.ssdStorage, formOptions.ssdStorage),
    hddStorage: uniqueOptions(defaultOptions.hddStorage, formOptions.hddStorage),
    screenSize: uniqueOptions(defaultOptions.screenSize, formOptions.screenSize),
    antivirus: uniqueOptions(defaultOptions.antivirus, formOptions.antivirus),
  }), [formOptions])

  const fetchAssets = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter) params.append('status', statusFilter)
      if (searchQuery) params.append('search', searchQuery)
      params.append('page', page.toString())
      params.append('pageSize', '15')
      const res = await api.get(`/assets?${params.toString()}`)
      setAssets(res.data || [])
      setTotal(res.total || 0)
      setTotalPages(res.totalPages || 1)
    } catch (err: any) {
      showToast(err.message || 'Error al cargar activos', 'error')
    } finally {
      setLoading(false)
    }
  }, [statusFilter, searchQuery, page])

  useEffect(() => { fetchAssets() }, [fetchAssets])

  useEffect(() => {
    const params: Record<string, string> = {}
    if (statusFilter) params.status = statusFilter
    if (searchQuery) params.search = searchQuery
    setSearchParams(params, { replace: true })
  }, [statusFilter, searchQuery, setSearchParams])

  const openDetail = async (id: string) => {
    setDetailLoading(true)
    try {
      const data = await api.get(`/assets/${id}`)
      setSelectedAsset(data)
    } catch (err: any) {
      showToast(err.message || 'Error al cargar activo', 'error')
    } finally {
      setDetailLoading(false)
    }
  }

  const resetForm = () => {
    setCreateForm(emptyForm)
    setCustomEquipmentType('')
    setIsCreateOpen(false)
    setEditMode(false)
    setEditingId(null)
  }

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault()
    const payload = {
      ...createForm,
      equipmentType: customEquipmentType.trim() || createForm.equipmentType,
      assignedUserId: createForm.assignedUserId || undefined,
      fieldId: createForm.fieldId || undefined,
    }
    try {
      if (editMode && editingId) {
        await api.patch(`/assets/${editingId}`, payload)
        showToast('Activo actualizado', 'success')
      } else {
        await api.post('/assets', payload)
        showToast('Activo creado exitosamente', 'success')
      }
      resetForm()
      fetchAssets()
      getFormOptions()
    } catch (err: any) {
      showToast(err.message || 'Error', 'error')
    }
  }

  const openEditModal = (asset: any) => {
    const savedType = asset.equipmentType || ''
    const typeExists = !savedType || options.equipmentType.includes(savedType)
    setEditMode(true)
    setEditingId(asset.id)
    setCreateForm({
      fieldId: asset.fieldId || '',
      assignedUserId: asset.assignedUserId || '',
      brand: asset.brand || '',
      model: asset.model || '',
      serial: asset.serial || '',
      equipmentType: typeExists ? savedType : '__custom',
      operatingSystem: asset.operatingSystem || '',
      processor: asset.processor || '',
      ram: asset.ram || '',
      ssdStorage: asset.ssdStorage || '',
      hddStorage: asset.hddStorage || '',
      screenCode: asset.screenCode || '',
      screenBrand: asset.screenBrand || '',
      screenSerial: asset.screenSerial || '',
      screenSize: asset.screenSize || '',
      antivirus: asset.antivirus || '',
      observations: asset.observations || '',
      status: asset.status || 'AVAILABLE',
    })
    setCustomEquipmentType(typeExists ? '' : savedType)
    setIsCreateOpen(true)
    setSelectedAsset(null)
  }

  const handleStatusChange = async (assetId: string, status: string) => {
    try {
      await api.patch(`/assets/${assetId}/status`, { status })
      showToast('Estado actualizado', 'success')
      fetchAssets()
      if (selectedAsset?.id === assetId) openDetail(assetId)
    } catch (err: any) {
      showToast(err.message || 'Error', 'error')
    }
  }

  const handleAssign = async (assetId: string, assignedUserId: string) => {
    try {
      await api.post(`/assets/${assetId}/assign`, { assignedUserId: assignedUserId || undefined })
      showToast('Asignacion actualizada', 'success')
      fetchAssets()
      if (selectedAsset?.id === assetId) openDetail(assetId)
    } catch (err: any) {
      showToast(err.message || 'Error', 'error')
    }
  }

  const getUserDisplayName = (u: any) =>
    u ? (u.firstName ? `${u.firstName} ${u.lastName || ''}`.trim() : u.username) : 'Sin asignar'

  const setField = (field: keyof AssetForm, value: string) => setCreateForm(form => ({ ...form, [field]: value }))

  const SelectField = ({ label, field, items, required = false }: { label: string; field: keyof AssetForm; items: string[]; required?: boolean }) => (
    <div>
      <label className={labelClass}>{label}{required ? ' *' : ''}</label>
      <select required={required} value={createForm[field]} onChange={e => setField(field, e.target.value)} className={inputClass}>
        <option value="">Seleccionar</option>
        {items.map(item => <option key={item} value={item}>{item}</option>)}
      </select>
    </div>
  )

  const TextField = ({ label, field, required = false, placeholder = '' }: { label: string; field: keyof AssetForm; required?: boolean; placeholder?: string }) => (
    <div>
      <label className={labelClass}>{label}{required ? ' *' : ''}</label>
      <input required={required} value={createForm[field]} onChange={e => setField(field, e.target.value)} className={inputClass} placeholder={placeholder} />
    </div>
  )

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight italic uppercase">Inventario de Activos</h2>
          <p className="text-slate-500 dark:text-slate-400">Administracion de equipos y recursos tecnologicos</p>
        </div>
        <button onClick={() => { resetForm(); setIsCreateOpen(true) }} className="flex items-center gap-2 px-5 py-2.5 bg-[#FF6A23] hover:bg-[#e55a1d] text-white font-bold rounded-2xl shadow-lg shadow-orange-500/20 transition-all hover:scale-[1.02]">
          <Plus size={18} /> Nuevo Activo
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-3 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setPage(1) }} placeholder="Buscar por codigo, serial, marca, modelo, tipo o pantalla..." className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF6A23]/30 focus:border-[#FF6A23] transition-all" />
        </div>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }} className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#FF6A23]/30">
          <option value="">Todos los estados</option>
          <option value="AVAILABLE">Disponible</option>
          <option value="IN_USE">En Uso</option>
          <option value="MAINTENANCE">Mantenimiento</option>
          <option value="RETIRED">Retirado</option>
        </select>
        {(statusFilter || searchQuery) && (
          <button onClick={() => { setStatusFilter(''); setSearchQuery(''); setPage(1) }} className="px-4 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors flex items-center gap-1">
            <X size={14} /> Limpiar
          </button>
        )}
      </div>

      {loading && assets.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-[#FF6A23] border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-500 dark:text-slate-400 font-medium">Cargando activos...</p>
          </div>
        </div>
      ) : assets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 bg-orange-100 dark:bg-orange-950/30 rounded-full flex items-center justify-center text-[#FF6A23] mb-4">
            <Package size={40} />
          </div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">No hay activos</h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-6">{searchQuery || statusFilter ? 'No se encontraron activos con los filtros seleccionados.' : 'Registra el primer activo del inventario.'}</p>
          {!searchQuery && !statusFilter && (
            <button onClick={() => setIsCreateOpen(true)} className="flex items-center gap-2 px-5 py-2.5 bg-[#FF6A23] hover:bg-[#e55a1d] text-white font-bold rounded-2xl shadow-lg shadow-orange-500/20 transition-all">
              <Plus size={18} /> Registrar Activo
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Equipo</th>
                  <th className="text-left px-4 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Estado</th>
                  <th className="text-left px-4 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Serial</th>
                  <th className="text-left px-4 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Usuario</th>
                  <th className="text-left px-4 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Area</th>
                  <th className="text-right px-6 py-4"></th>
                </tr>
              </thead>
              <tbody>
                {assets.map((asset: any) => (
                  <tr key={asset.id} onClick={() => openDetail(asset.id)} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 cursor-pointer transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800 dark:text-white group-hover:text-[#FF6A23] transition-colors">{asset.brand} {asset.model}</div>
                      <div className="text-xs text-slate-400 dark:text-slate-500">{asset.equipmentType || asset.internalCode}</div>
                    </td>
                    <td className="px-4 py-4"><StatusBadge status={asset.status} /></td>
                    <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{asset.serial}</td>
                    <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{getUserDisplayName(asset.assignedUser)}</td>
                    <td className="px-4 py-4 text-slate-500 dark:text-slate-400">{asset.field?.name || '-'}</td>
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
              <span className="text-sm text-slate-500 dark:text-slate-400">{total} activos en total</span>
              <div className="flex items-center gap-2">
                <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 disabled:opacity-30 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"><ChevronLeft size={16} /></button>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300 px-3">{page} / {totalPages}</span>
                <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 disabled:opacity-30 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"><ChevronRight size={16} /></button>
              </div>
            </div>
          )}
        </div>
      )}

      <Modal isOpen={isCreateOpen} onClose={resetForm} title={editMode ? 'Editar Activo' : 'Nuevo Activo'} maxWidthClassName="max-w-5xl">
        <form onSubmit={handleCreate} className="space-y-6">
          <section>
            <h4 className="text-sm font-black uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-3">Asignacion</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>Area</label>
                <select value={createForm.fieldId} onChange={e => setField('fieldId', e.target.value)} className={inputClass}>
                  <option value="">Sin area</option>
                  {fields.map((field: any) => <option key={field.id} value={field.id}>{field.name}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Usuario</label>
                <select value={createForm.assignedUserId} onChange={e => setField('assignedUserId', e.target.value)} className={inputClass}>
                  <option value="">Sin asignar</option>
                  {users.map((user: any) => <option key={user.id} value={user.id}>{getUserDisplayName(user)}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Estado</label>
                <select value={createForm.status} onChange={e => setField('status', e.target.value)} className={inputClass}>
                  <option value="AVAILABLE">Disponible</option>
                  <option value="IN_USE">En Uso</option>
                  <option value="MAINTENANCE">Mantenimiento</option>
                  <option value="RETIRED">Retirado</option>
                </select>
              </div>
            </div>
          </section>

          <section>
            <h4 className="text-sm font-black uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-3">Equipo</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <SelectField label="Marca equipo" field="brand" items={options.brand} required />
              <TextField label="Modelo equipo" field="model" required placeholder="Ej: Latitude 5520" />
              <TextField label="Serial equipo" field="serial" required placeholder="Ej: SN12345678" />
              <div>
                <label className={labelClass}>Tipo de equipo *</label>
                <select required value={createForm.equipmentType} onChange={e => { setField('equipmentType', e.target.value); if (e.target.value !== '__custom') setCustomEquipmentType('') }} className={inputClass}>
                  <option value="">Seleccionar</option>
                  {options.equipmentType.map(item => <option key={item} value={item}>{item}</option>)}
                  <option value="__custom">Escribir manualmente</option>
                </select>
              </div>
              {createForm.equipmentType === '__custom' && (
                <div>
                  <label className={labelClass}>Tipo manual *</label>
                  <input required value={customEquipmentType} onChange={e => setCustomEquipmentType(e.target.value)} className={inputClass} placeholder="Ej: Mini PC" />
                </div>
              )}
              <SelectField label="Sistema Operativo" field="operatingSystem" items={options.operatingSystem} />
              <TextField label="Procesador" field="processor" placeholder="Ej: Intel Core i5" />
              <SelectField label="RAM" field="ram" items={options.ram} />
              <SelectField label="Almacenamiento SSD" field="ssdStorage" items={options.ssdStorage} />
              <SelectField label="Almacenamiento HDD" field="hddStorage" items={options.hddStorage} />
            </div>
          </section>

          <section>
            <h4 className="text-sm font-black uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-3">Pantalla</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <TextField label="Codigo de pantalla" field="screenCode" />
              <SelectField label="Marca de pantalla" field="screenBrand" items={options.screenBrand} />
              <TextField label="Serial pantalla" field="screenSerial" />
              <SelectField label="Tamano de pantalla" field="screenSize" items={options.screenSize} />
            </div>
          </section>

          <section>
            <h4 className="text-sm font-black uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-3">Seguridad y observaciones</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <SelectField label="Antivirus" field="antivirus" items={options.antivirus} />
              <div className="md:col-span-2">
                <label className={labelClass}>Observaciones</label>
                <textarea value={createForm.observations} onChange={e => setField('observations', e.target.value)} className={`${inputClass} min-h-[96px] resize-y`} />
              </div>
            </div>
          </section>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button type="button" onClick={resetForm} className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl transition-all">Cancelar</button>
            <button type="submit" disabled={loading} className="px-5 py-2.5 bg-[#FF6A23] hover:bg-[#e55a1d] text-white font-bold rounded-xl shadow-lg shadow-orange-500/10 transition-all disabled:opacity-50">
              {editMode ? 'Guardar Cambios' : 'Registrar Activo'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!selectedAsset} onClose={() => setSelectedAsset(null)} title={selectedAsset ? `${selectedAsset.brand} ${selectedAsset.model}` : 'Detalle'} maxWidthClassName="max-w-4xl">
        {detailLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-10 h-10 border-4 border-[#FF6A23] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : selectedAsset ? (
          <div className="space-y-6">
            <div className="flex items-center gap-3 flex-wrap">
              <StatusBadge status={selectedAsset.status} />
              <span className="inline-flex items-center px-2.5 py-1 text-xs font-bold rounded-lg border bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                <Hash size={12} className="mr-1" /> {selectedAsset.internalCode}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <Detail label="Area" value={selectedAsset.field?.name} />
              <Detail label="Usuario" value={getUserDisplayName(selectedAsset.assignedUser)} />
              <Detail label="Tipo" value={selectedAsset.equipmentType} />
              <Detail label="Marca equipo" value={selectedAsset.brand} />
              <Detail label="Modelo equipo" value={selectedAsset.model} />
              <Detail label="Serial equipo" value={selectedAsset.serial} />
              <Detail label="Sistema Operativo" value={selectedAsset.operatingSystem} />
              <Detail label="Procesador" value={selectedAsset.processor} />
              <Detail label="RAM" value={selectedAsset.ram} />
              <Detail label="SSD" value={selectedAsset.ssdStorage} />
              <Detail label="HDD" value={selectedAsset.hddStorage} />
              <Detail label="Antivirus" value={selectedAsset.antivirus} />
              <Detail label="Codigo pantalla" value={selectedAsset.screenCode} />
              <Detail label="Marca pantalla" value={selectedAsset.screenBrand} />
              <Detail label="Serial pantalla" value={selectedAsset.screenSerial} />
              <Detail label="Tamano pantalla" value={selectedAsset.screenSize} />
              <div className="md:col-span-3"><Detail label="Observaciones" value={selectedAsset.observations} /></div>
            </div>

            <div className="flex flex-wrap gap-3 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div className="flex-1 min-w-[140px]">
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Estado</label>
                <select value={selectedAsset.status} onChange={e => handleStatusChange(selectedAsset.id, e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF6A23]/30">
                  <option value="AVAILABLE">Disponible</option>
                  <option value="IN_USE">En Uso</option>
                  <option value="MAINTENANCE">Mantenimiento</option>
                  <option value="RETIRED">Retirado</option>
                </select>
              </div>
              <div className="flex-1 min-w-[140px]">
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Asignar a</label>
                <select value={selectedAsset.assignedUserId || ''} onChange={e => handleAssign(selectedAsset.id, e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF6A23]/30">
                  <option value="">Sin asignar</option>
                  {users.map((u: any) => <option key={u.id} value={u.id}>{getUserDisplayName(u)}</option>)}
                </select>
              </div>
            </div>

            <button onClick={() => openEditModal(selectedAsset)} className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-[#FF6A23] hover:bg-orange-50 dark:hover:bg-orange-950/20 rounded-xl transition-colors">
              <Edit3 size={14} /> Editar datos del activo
            </button>

            <div className="space-y-3">
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Clock size={16} className="text-[#FF6A23]" /> Historial ({selectedAsset.history?.length || 0})
              </h4>
              <div className="max-h-[200px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {(selectedAsset.history || []).map((h: any) => (
                  <div key={h.id} className="flex gap-3 items-start text-sm pb-2 border-b border-slate-50 dark:border-slate-800 last:border-0">
                    <div className="w-2 h-2 rounded-full bg-[#FF6A23] mt-2 shrink-0" />
                    <div className="flex-1">
                      <span className="font-bold text-slate-700 dark:text-slate-200">{h.action}</span>
                      {h.notes && <span className="text-slate-500 dark:text-slate-400 ml-1">- {h.notes}</span>}
                      <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                        {getUserDisplayName(h.user)} · {new Date(h.createdAt).toLocaleString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}
                {(!selectedAsset.history || selectedAsset.history.length === 0) && (
                  <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-4">Sin historial registrado.</p>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  )
}

function Detail({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <span className="block text-xs font-bold uppercase text-slate-400 dark:text-slate-500">{label}</span>
      <b className="text-slate-700 dark:text-slate-200">{value || '-'}</b>
    </div>
  )
}
