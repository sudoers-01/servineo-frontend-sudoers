"use client"

import type React from "react"
import { useState } from "react"
import { currentFixer, mockJobOffers, availableServices, type JobOffer } from "@/app/lib/mock-data"
import Link from "next/link"
import { ArrowLeft, Plus, X, ImageIcon, Upload, Edit2, Trash2, Sparkles } from "@/app/icons"

export default function MyOffersPage() {
  const [offers, setOffers] = useState<JobOffer[]>(mockJobOffers.filter((offer) => offer.fixerId === currentFixer.id))
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingOffer, setEditingOffer] = useState<JobOffer | null>(null)

  const [description, setDescription] = useState("")
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [photos, setPhotos] = useState<string[]>([])
  const [city, setCity] = useState("")

  const resetForm = () => {
    setDescription("")
    setSelectedServices([])
    setPhotos([])
    setCity("")
    setEditingOffer(null)
  }

  const handleEdit = (offer: JobOffer) => {
    setEditingOffer(offer)
    setDescription(offer.description)
    setSelectedServices(offer.services)
    setPhotos(offer.photos)
    setCity(offer.city)
    setIsFormOpen(true)
  }

  const handleDelete = (offerId: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar esta oferta?")) {
      setOffers(offers.filter((offer) => offer.id !== offerId))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (description.length > 100) {
      alert("La descripción no puede exceder 100 caracteres")
      return
    }

    if (selectedServices.length === 0) {
      alert("Debes seleccionar al menos un servicio")
      return
    }

    if (photos.length > 5) {
      alert("No puedes agregar más de 5 fotos")
      return
    }

    if (editingOffer) {
      setOffers(
        offers.map((offer) =>
          offer.id === editingOffer.id
            ? {
                ...offer,
                description,
                services: selectedServices,
                tags: selectedServices,
                photos,
                city,
              }
            : offer,
        ),
      )
    } else {
      const newOffer: JobOffer = {
        id: `offer-${Date.now()}`,
        fixerId: currentFixer.id,
        fixerName: currentFixer.name,
        description,
        tags: selectedServices,
        whatsapp: currentFixer.whatsapp,
        photos,
        services: selectedServices,
        createdAt: new Date(),
        city,
      }
      setOffers([newOffer, ...offers])
    }

    setIsFormOpen(false)
    resetForm()
  }

  const handleServiceToggle = (service: string) => {
    setSelectedServices((prev) => (prev.includes(service) ? prev.filter((s) => s !== service) : [...prev, service]))
  }

  const handleAddPhoto = () => {
    if (photos.length >= 5) {
      alert("No puedes agregar más de 5 fotos")
      return
    }
    const photoUrl = `/placeholder.svg?height=300&width=400&query=work photo ${photos.length + 1}`
    setPhotos([...photos, photoUrl])
  }

  const handleRemovePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index))
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2 animate-slide-in">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600 transition-colors group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Volver al inicio
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-primary">
                  Mis Ofertas de Trabajo
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {currentFixer.name} • {currentFixer.whatsapp}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                resetForm()
                setIsFormOpen(true)
              }}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors font-semibold"
            >
              <Plus className="w-5 h-5" />
              Nueva Oferta
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {isFormOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity">
            <div className="bg-card rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl border-2 border-border transition-transform">
              <div className="sticky top-0 bg-card backdrop-blur-lg border-b border-border/50 p-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-primary">
                    {editingOffer ? "Editar Oferta" : "Nueva Oferta de Trabajo"}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">Completa los detalles de tu oferta</p>
                </div>
                <button
                  onClick={() => {
                    setIsFormOpen(false)
                    resetForm()
                  }}
                  className="p-2.5 hover:bg-slate-50 rounded-xl transition-all hover:rotate-90 duration-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-100px)]">
                {/* Description */}
                <div className="animate-fade-in">
                  <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    Descripción del trabajo *
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    maxLength={100}
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                    placeholder="Describe brevemente el trabajo que ofreces..."
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-2 flex items-center justify-between">
                    <span>Máximo 100 caracteres</span>
                    <span className={description.length > 90 ? "text-red-600 font-semibold" : ""}>
                      {description.length}/100
                    </span>
                  </p>
                </div>

                {/* City */}
                <div className="animate-fade-in" style={{ animationDelay: "50ms" }}>
                  <label className="block text-sm font-semibold mb-2">Ciudad *</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    placeholder="Ej: La Paz, Cochabamba, Santa Cruz..."
                    required
                  />
                </div>

                {/* Services */}
                <div className="animate-fade-in" style={{ animationDelay: "100ms" }}>
                  <label className="block text-sm font-semibold mb-3">Servicios que ofreces *</label>
                  <div className="grid grid-cols-2 gap-3">
                    {availableServices.map((service, index) => (
                      <label
                        key={service}
                        className="flex items-center gap-3 p-3 border-2 border-border rounded-xl cursor-pointer hover:bg-muted hover:border-blue-600/50 transition-all group"
                        style={{ animationDelay: `${index * 30}ms` }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedServices.includes(service)}
                          onChange={() => handleServiceToggle(service)}
                          className="w-4 h-4 accent-blue-600"
                        />
                        <span className="text-sm group-hover:text-blue-600 transition-colors">{service}</span>
                      </label>
                    ))}
                  </div>
                  {selectedServices.length === 0 && (
                    <p className="text-xs text-destructive mt-2 flex items-center gap-1">
                      <span>⚠️</span> Debes seleccionar al menos un servicio
                    </p>
                  )}
                </div>

                {/* Photos */}
                <div className="animate-fade-in" style={{ animationDelay: "150ms" }}>
                  <label className="block text-sm font-semibold mb-3">Fotos del trabajo (máximo 5)</label>
                  <div className="space-y-3">
                    {photos.length < 5 && (
                      <button
                        type="button"
                        onClick={handleAddPhoto}
                        className="w-full flex items-center justify-center gap-3 p-6 border-2 border-dashed border-border rounded-xl hover:bg-muted hover:border-primary transition-all group"
                      >
                        <Upload className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        <span className="font-medium group-hover:text-primary transition-colors">Agregar foto</span>
                      </button>
                    )}

                    {photos.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {photos.map((photo, index) => (
                          <div key={index} className="relative aspect-video rounded-xl overflow-hidden bg-muted group">
                            <img
                              src={photo || "/placeholder.svg"}
                              alt={`Foto ${index + 1}`}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemovePhoto(index)}
                              className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">{photos.length}/5 fotos agregadas</p>
                </div>

                {/* Submit buttons */}
                <div className="flex gap-3 pt-4 animate-fade-in" style={{ animationDelay: "200ms" }}>
                  <button
                    type="button"
                    onClick={() => {
                      setIsFormOpen(false)
                      resetForm()
                    }}
                    className="flex-1 px-4 py-3 border-2 border-border rounded-xl hover:bg-muted transition-all font-semibold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors font-bold"
                  >
                    {editingOffer ? "Guardar Cambios" : "Publicar Oferta"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Offers list */}
        {offers.length === 0 ? (
          <div className="text-center py-16 animate-fade-in">
            <div className="w-20 h-20 mx-auto mb-6 bg-muted rounded-2xl flex items-center justify-center">
              <ImageIcon className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-2xl font-bold mb-3">No tienes ofertas publicadas</h3>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed">
              Crea tu primera oferta de trabajo para que los clientes puedan encontrarte y contactarte
            </p>
            <button
              onClick={() => {
                resetForm()
                setIsFormOpen(true)
              }}
              className="inline-flex items-center gap-3 px-8 py-4 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors font-bold"
            >
              <Plus className="w-5 h-5" />
              Crear Primera Oferta
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {offers.map((offer, index) => {
              const cover = offer.photos?.[0] || "/placeholder.svg?height=180&width=320&text=Oferta"
              
              return (
                <div key={offer.id} className="animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                  <div className="group relative w-full overflow-hidden rounded-xl border border-primary bg-white transition-all duration-300 hover:shadow-lg">
                    {/* Cover image */}
                    <div className="relative aspect-[16/9] overflow-hidden">
                      <img
                        src={cover}
                        alt={`Imagen de ${offer.fixerName}`}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      {/* Top-right action buttons */}
                      <div className="absolute top-3 right-3 flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            e.preventDefault()
                            handleEdit(offer)
                          }}
                          className="p-2 bg-white/90 rounded-full text-blue-600 hover:bg-white transition-all hover:scale-110 shadow-md z-10"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            e.preventDefault()
                            handleDelete(offer.id)
                          }}
                          className="p-2 bg-white/90 rounded-full text-red-600 hover:bg-white transition-all hover:scale-110 shadow-md z-10"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      {/* Bottom overlay with city and date */}
                      <div className="pointer-events-none absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/40 to-black/0 p-4">
                        <div className="flex items-end justify-between">
                          <div className="text-white">
                            <div className="text-sm font-medium opacity-90">{offer.city}</div>
                          </div>
                          <span className="text-xs text-white/90">
                            {offer.createdAt.toLocaleDateString("es-ES", {
                              day: "numeric",
                              month: "short",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Main content */}
                    <div className="p-4">
                      <div className="flex items-start justify-between">
                        <h3 className="font-medium text-gray-900 line-clamp-2">{offer.description}</h3>
                      </div>
                      
                      <div className="mt-3 flex flex-wrap gap-2">
                        {offer.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}

                            className="px-2 py-1 rounded-full bg-blue-600/10 text-blue-600 border border-blue-600/20 text-xs font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                        {offer.tags.length > 3 && (
                          <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-600 text-xs">
                            +{offer.tags.length - 3}
                          </span>
                        )}
                      </div>

                      {offer.photos.length > 0 && (
                        <div className="mt-3 flex items-center gap-1.5 text-xs text-gray-500">
                          <ImageIcon className="w-3.5 h-3.5" />
                          <span>{offer.photos.length} {offer.photos.length === 1 ? 'foto' : 'fotos'}</span>
                        </div>
                      )}
                    </div>

                    {/* Hover overlay */}
                    <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none">
                      <div className="absolute inset-0 bg-white/95" />
                      <div className="relative p-5 h-full flex flex-col">
                        <div className="flex items-center justify-between">
                          <div className="font-semibold text-blue-600">{offer.city}</div>
                          <div className="text-xs text-slate-500">
                            {offer.createdAt.toLocaleDateString("es-ES", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                          </div>
                        </div>
                        
                        <p className="mt-3 text-slate-800 text-sm leading-relaxed line-clamp-4">
                          {offer.description}
                        </p>
                        
                        <div className="mt-3 flex flex-wrap gap-2">
                          {offer.tags.map((tag) => (
                            <span 
                              key={tag} 
                              className="px-2 py-1 rounded-full bg-blue-600/10 text-blue-600 border border-blue-600/20 text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        
                        {offer.photos.length > 1 && (
                          <div className="mt-3 text-xs text-slate-600">
                            {offer.photos.length} {offer.photos.length === 1 ? "foto" : "fotos"} disponibles
                          </div>
                        )}
                        
                        <div className="mt-auto pt-4 flex items-center justify-between text-sm">
                          <span className="text-slate-600">
                            WhatsApp: <span className="font-medium">{offer.whatsapp}</span>
                          </span>
                          <span className="text-blue-600 font-medium">Ver detalles →</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
