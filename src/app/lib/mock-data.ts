export interface JobOffer {
  id: string
  fixerId: string
  fixerName: string
  description: string
  tags: string[]
  whatsapp: string
  photos: string[]
  services: string[]
  price: number
  createdAt: Date
  city: string
  location: {
    lat: number
    lng: number
    address: string
  }
}

export interface Fixer {
  id: string
  name: string
  whatsapp: string
  services: string[]
}

// Mock de ubicación del usuario
export const userLocation = {
  lat: -17.394,
  lng: -66.1474,
  address: "UMSS, Cochabamba, Bolivia",
}

// Mock de servicios disponibles
export const availableServices = [
  "Plomería",
  "Electricidad",
  "Carpintería",
  "Pintura",
  "Albañilería",
  "Jardinería",
  "Limpieza",
  "Reparación de electrodomésticos",
  "Instalación de pisos",
  "Techado",
]

// Mock de FIXER actual (simulando usuario logueado)
export const currentFixer: Fixer = {
  id: "fixer-001",
  name: "Juan Carlos Pérez",
  whatsapp: "+591 70341618",
  services: ["Plomería", "Electricidad", "Carpintería"],
}

let _mockJobOffers: JobOffer[] = [
  {
    id: "offer-001",
    fixerId: "fixer-001",
    fixerName: "Ana Martínez",
    description:
      "Especialista en muebles a medida, puertas, ventanas y todo tipo de trabajos en madera. Más de 10 años de experiencia en carpintería fina.",
    tags: ["Carpintería", "Muebles", "Restauración"],
    whatsapp: "+591 73456789",
    photos: ["/img/carpinteria1.jpg", "/img/carpinteria2.jpg", "/img/carpinteria3.jpg"],
    services: ["Carpintería"],
    price: 49,
    createdAt: new Date("2025-01-15"),
    city: "Cochabamba",
    location: {
      lat: -17.3935, // Cerca de la UMSS (500m)
      lng: -66.1468,
      address: "Av. Oquendo #234, Cochabamba",
    },
  },
]

// Funciones mock para manejar ofertas
export const mockJobOfferService = {
  getOffers: () => _mockJobOffers,

  addOffer: (offer: Omit<JobOffer, "id" | "createdAt">) => {
    const newOffer: JobOffer = {
      ...offer,
      id: `offer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
    }
    _mockJobOffers = [newOffer, ..._mockJobOffers]
    return newOffer
  },

  updateOffer: (offerId: string, offer: Partial<JobOffer>) => {
    _mockJobOffers = _mockJobOffers.map((o) => (o.id === offerId ? { ...o, ...offer } : o))
    return _mockJobOffers.find((o) => o.id === offerId)
  },

  deleteOffer: (offerId: string) => {
    _mockJobOffers = _mockJobOffers.filter((o) => o.id !== offerId)
  },

  getMyOffers: (fixerId: string) => {
    return _mockJobOffers.filter((o) => o.fixerId === fixerId)
  },
}

// Exportar también como mockJobOffers para compatibilidad
export const mockJobOffers = _mockJobOffers
