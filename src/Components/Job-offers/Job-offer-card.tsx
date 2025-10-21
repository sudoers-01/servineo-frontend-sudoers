"use client"

import type { JobOffer } from "@/app/lib/mock-data"
import { Search, MessageCircle } from "lucide-react" 

export function JobOfferCard({ offer, onClick }: { offer: JobOffer; onClick: () => void }) {
  const cover = offer.photos?.[0] || "/placeholder.svg?height=180&width=320&text=Oferta"

  return (
    <button
      onClick={onClick}
      className="group relative w-full overflow-hidden rounded-xl border border-primary bg-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
    >

      <div className="relative aspect-[16/9] overflow-hidden">
        <img
          src={cover}
          alt={`Imagen de ${offer.fixerName}`}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
 
        <div className="absolute left-3 top-3 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-xs text-slate-700 border border-gray-200 shadow-sm">
          <span className="font-medium text-blue-600">{offer.city}</span>
        </div>
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/40 to-black/0 p-4">
          <div className="flex items-end justify-between">
            <div className="text-white">
              <div className="text-sm opacity-90">{offer.fixerName}</div>
              <div className="text-xs opacity-80">{offer.whatsapp}</div>
            </div>
            <span className="text-xs text-white/90">{offer.createdAt.toLocaleDateString("es-ES")}</span>
          </div>
        </div>
      </div>

      <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="absolute inset-0 bg-white/95" />
        <div className="relative p-5 h-full flex flex-col">
          <div className="flex items-center justify-between">
            <div className="font-semibold text-blue-600">{offer.fixerName}</div>
            <div className="text-xs text-slate-500">{offer.createdAt.toLocaleDateString("es-ES")}</div>
          </div>
          <p className="mt-3 text-slate-800 text-sm leading-relaxed">{offer.description}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {offer.tags.map((t) => (
              <span key={t} className="px-2 py-1 rounded-full bg-blue-600/10 text-blue-600 border border-blue-600/20 text-xs">{t}</span>
            ))}
          </div>
          {offer.photos.length > 1 && (
            <div className="mt-3 text-xs text-slate-600">{offer.photos.length} {offer.photos.length === 1 ? "foto" : "fotos"}</div>
          )}
          <div className="mt-auto pt-4 flex items-center justify-between text-sm">
            <span className="text-slate-600">Whatsapp: <span className="font-medium">{offer.whatsapp}</span></span>
            <span className="text-blue-600 font-medium">Ver detalles →</span>
          </div>
        </div>
      </div>
    </button>
  )
}
