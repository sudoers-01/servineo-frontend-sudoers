"use client"

import { useState } from "react"
import { mockJobOffers } from "../lib/mock-data"
import { JobOfferCard } from "@/Components/Job-offers/Job-offer-card"
import { JobOfferModal } from "@/Components/Job-offers/Job-offer-modal"
import { Search, Filter, ArrowLeft, Briefcase } from "lucide-react"
import Link from "next/link"

export default function JobOffersPage() {
  const [selectedOffer, setSelectedOffer] = useState<(typeof mockJobOffers)[0] | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const sortedOffers = [...mockJobOffers].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

  const handleCardClick = (offer: (typeof mockJobOffers)[0]) => {
    setSelectedOffer(offer)
    setIsModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <header className="bg-card/80 backdrop-blur-lg border-b border-border/50 sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2 animate-slide-in">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Volver al inicio
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
                  <Briefcase className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                    Ofertas de Trabajo
                  </h1>
                  <p className="text-sm text-muted-foreground">{sortedOffers.length} ofertas disponibles</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-4 mb-8 animate-fade-in">
          <div className="flex-1 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Buscar ofertas de trabajo..."
              className="w-full pl-12 pr-32 py-4 border-2 border-border rounded-xl bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm hover:shadow-md"
              disabled
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
              Próximamente
            </span>
          </div>

          <button
            disabled
            className="flex items-center justify-center gap-2 px-8 py-4 border-2 border-border rounded-xl bg-card hover:bg-muted transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
          >
            <Filter className="w-5 h-5" />
            <span className="font-medium">Filtros</span>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full ml-1">Próximamente</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedOffers.map((offer, index) => (
            <div key={offer.id} className="animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
              <JobOfferCard offer={offer} onClick={() => handleCardClick(offer)} />
            </div>
          ))}
        </div>

        
        {sortedOffers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No hay ofertas de trabajo disponibles</p>
          </div>
        )}
      </div>

      <JobOfferModal offer={selectedOffer} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  )
}
