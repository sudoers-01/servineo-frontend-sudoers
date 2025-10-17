"use client"

import { useState } from "react"
import Link from "next/link"
import { mockJobOffers, type JobOffer } from "@/app/lib/mock-data"
import { Search, Filter, ArrowLeft, Briefcase } from "@/app/icons"

function JobOfferCard({ offer, onClick }: { offer: JobOffer; onClick: () => void }) {
  const cover = offer.photos?.[0] || "/placeholder.svg?height=180&width=320&text=Oferta"

  return (
    <button
      onClick={onClick}
      className="group relative w-full overflow-hidden rounded-xl border border-primary bg-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
    >
      {/* Cover image */}
      <div className="relative aspect-[16/9] overflow-hidden">
        <img
          src={cover}
          alt={`Imagen de ${offer.fixerName}`}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Top-left chip city */}
        <div className="absolute left-3 top-3 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-xs text-slate-700 border border-gray-200 shadow-sm">
          <span className="font-medium text-blue-600">{offer.city}</span>
        </div>
        {/* Bottom overlay with name and phone always visible lightly */}
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

      {/* Hover overlay details */}
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

function JobOfferModal({ offer, isOpen, onClose }: { offer: JobOffer | null; isOpen: boolean; onClose: () => void }) {
  if (!isOpen || !offer) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-white w-full max-w-xl rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-blue-600">{offer.fixerName}</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-50">
            {/* X icon using local set if needed later; simple text for now */}
            ✕
          </button>
        </div>
        <div className="p-5 space-y-3">
          <p className="text-slate-800">{offer.description}</p>
          <div className="flex flex-wrap gap-2">
            {offer.tags.map((t) => (
              <span key={t} className="px-2 py-1 rounded-full bg-blue-600/10 text-blue-600 border border-blue-600/20 text-xs">{t}</span>
            ))}
          </div>
          {offer.photos.length > 0 && (
            <div className="text-sm text-slate-600">Fotos: {offer.photos.length}</div>
          )}
          <div className="text-sm text-slate-600">Ciudad: {offer.city}</div>
          <div className="text-sm text-slate-600">Whatsapp: {offer.whatsapp}</div>
        </div>
        <div className="p-4 border-t border-gray-200 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">Cerrar</button>
        </div>
      </div>
    </div>
  )
}

export default function JobOffersPage() {
  const [selectedOffer, setSelectedOffer] = useState<JobOffer | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const sortedOffers = [...mockJobOffers].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

  const handleCardClick = (offer: JobOffer) => {
    setSelectedOffer(offer)
    setIsModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600 transition-colors group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Volver al inicio
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/20">
                  <Briefcase className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-blue-600">Ofertas de Trabajo</h1>
                  <p className="text-sm text-slate-600">{sortedOffers.length} ofertas disponibles</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-blue-600 transition-colors" />
            <input
              type="text"
              placeholder="Buscar ofertas de trabajo..."
              className="w-full pl-12 pr-32 py-4 border-2 border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all shadow-sm hover:shadow-md"
              disabled
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-600 bg-slate-50 px-3 py-1 rounded-full">
              Próximamente
            </span>
          </div>

          <button
            disabled
            className="flex items-center justify-center gap-2 px-8 py-4 border-2 border-gray-200 rounded-xl bg-white hover:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
          >
            <Filter className="w-5 h-5" />
            <span className="font-medium">Filtros</span>
            <span className="text-xs text-slate-600 bg-slate-50 px-2 py-0.5 rounded-full ml-1">Próximamente</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedOffers.map((offer, index) => (
            <div key={offer.id} className="transition-opacity" style={{ transitionDelay: `${index * 50}ms` }}>
              <JobOfferCard offer={offer} onClick={() => handleCardClick(offer)} />
            </div>
          ))}
        </div>

        {sortedOffers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-600">No hay ofertas de trabajo disponibles</p>
          </div>
        )}
      </div>

      <JobOfferModal offer={selectedOffer} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  )
}
