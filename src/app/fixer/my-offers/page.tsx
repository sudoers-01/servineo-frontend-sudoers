"use client"

import { useState } from "react"
import { currentFixer, mockJobOffers, type JobOffer } from "@/app/lib/mock-data"
import { Plus, Edit2, Trash2, ArrowLeft, ImageIcon } from "lucide-react"
import Link from "next/link"
import JobOfferForm from "@/Components/Job-offers/Job-offer-form"
import { JobOfferFormData } from "@/app/lib/validations/Job-offer-Schemas"

export default function MyOffersPage() {
  const [offers, setOffers] = useState<JobOffer[]>(
    mockJobOffers.filter((offer) => offer.fixerId === currentFixer.id),
  )
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingOffer, setEditingOffer] = useState<JobOffer | null>(null)

  const handleEdit = (offer: JobOffer) => {
    setEditingOffer(offer)
    setIsFormOpen(true)
  }

  const handleDelete = (offerId: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar esta oferta?")) {
      setOffers(offers.filter((offer) => offer.id !== offerId))
    }
  }

  const handleSubmit = (formData: JobOfferFormData) => {
    // Convertir los servicios de objetos a strings
    const servicesAsStrings = formData.services.map(service => service.value)
    
    if (editingOffer) {
      setOffers(
        offers.map((offer) =>
          offer.id === editingOffer.id
            ? {
                ...offer,
                ...formData,
                services: servicesAsStrings,
                tags: formData.tags || [], 
                whatsapp: currentFixer.whatsapp,
                fixerName: currentFixer.name,
              }
            : offer,
        ),
      )
    } else {
      const newOffer: JobOffer = {
        id: `offer-${Date.now()}`,
        fixerId: currentFixer.id,
        fixerName: currentFixer.name,
        whatsapp: currentFixer.whatsapp,
        createdAt: new Date(),
        services: servicesAsStrings,
        tags: formData.tags || [],
        description: formData.description,
        city: formData.city,
        photos: formData.photos || [],
        price: formData.price,
      }
      setOffers([newOffer, ...offers])
    }
    setIsFormOpen(false)
    setEditingOffer(null)
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
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                  Mis Ofertas de Trabajo
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {currentFixer.name} • {currentFixer.whatsapp}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setEditingOffer(null)
                setIsFormOpen(true)
              }}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-blue-600 text-primary-foreground rounded-xl hover:shadow-xl hover:shadow-primary/30 hover:scale-105 transition-all duration-300 font-semibold"
            >
              <Plus className="w-5 h-5" />
              Nueva Oferta
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {isFormOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <JobOfferForm
              onSubmit={handleSubmit}
              onCancel={() => {
                setIsFormOpen(false)
                setEditingOffer(null)
              }}
              defaultValues={editingOffer || {}}
              submitButtonText={editingOffer ? "Guardar Cambios" : "Publicar Oferta"}
            />
          </div>
        )}

        {/* Offers list */}
        {offers.length === 0 ? (
          <div className="text-center py-16 animate-fade-in">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-primary/20 to-blue-600/20 rounded-2xl flex items-center justify-center">
              <ImageIcon className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-2xl font-bold mb-3">No tienes ofertas publicadas</h3>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed">
              Crea tu primera oferta de trabajo para que los clientes puedan encontrarte y contactarte
            </p>
            <button
              onClick={() => {
                setEditingOffer(null)
                setIsFormOpen(true)
              }}
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-primary to-blue-600 text-primary-foreground rounded-xl hover:shadow-xl hover:shadow-primary/30 hover:scale-105 transition-all duration-300 font-bold"
            >
              <Plus className="w-5 h-5" />
              Crear Primera Oferta
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {offers.map((offer, index) => (
              <div key={offer.id} className="animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                <div className="p-6 bg-card border-2 border-border rounded-2xl hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 group">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm text-foreground/80 leading-relaxed">{offer.description}</p>
                      </div>
                      <div className="flex gap-1 ml-3">
                        <button
                          onClick={() => handleEdit(offer)}
                          className="p-2 hover:bg-primary/10 text-primary rounded-lg transition-all hover:scale-110"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(offer.id)}
                          className="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-all hover:scale-110"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {offer.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1.5 bg-gradient-to-r from-primary/10 to-primary/5 text-primary text-xs rounded-full font-medium border border-primary/20"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {offer.photos.length > 0 && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-3 py-2 rounded-lg">
                        <ImageIcon className="w-4 h-4" />
                        <span className="font-medium">
                          {offer.photos.length} {offer.photos.length === 1 ? "foto" : "fotos"}
                        </span>
                      </div>
                    )}

                    <div className="text-xs text-muted-foreground pt-3 border-t border-border/50">
                      Publicado:{" "}
                      {offer.createdAt.toLocaleDateString("es-ES", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
