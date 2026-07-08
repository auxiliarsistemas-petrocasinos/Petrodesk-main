import { HardHat } from 'lucide-react'

export default function ConstructionOverlay() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center animate-in fade-in zoom-in duration-500">
      <div className="w-24 h-24 bg-orange-100 dark:bg-orange-950/30 rounded-full flex items-center justify-center text-[#FF6A23] mb-6 shadow-lg shadow-orange-500/10">
        <HardHat size={48} />
      </div>
      <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-2 italic uppercase tracking-tighter">Módulo en Construcción</h2>
      <p className="text-slate-500 dark:text-slate-400 max-w-md leading-relaxed">
        Estamos trabajando para brindarte la mejor experiencia. Esta funcionalidad estará disponible muy pronto.
      </p>
      <div className="mt-8 flex gap-2">
         <div className="w-2 h-2 rounded-full bg-[#FF6A23] animate-bounce"></div>
         <div className="w-2 h-2 rounded-full bg-[#FF6A23] animate-bounce [animation-delay:0.2s]"></div>
         <div className="w-2 h-2 rounded-full bg-[#FF6A23] animate-bounce [animation-delay:0.4s]"></div>
      </div>
    </div>
  )
}
