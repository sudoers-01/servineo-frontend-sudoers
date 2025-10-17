// Mock data para ofertas de trabajo
export interface JobOffer {
  id: string
  fixerId: string
  fixerName: string
  description: string
  tags: string[]
  whatsapp: string
  photos: string[]
  services: string[]
  createdAt: Date
  city: string
}

export interface Fixer {
  id: string
  name: string
  whatsapp: string
  services: string[]
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

// Mock de ofertas de trabajo iniciales
export const mockJobOffers: JobOffer[] = [
  {
    id: "offer-003",
    fixerId: "fixer-004",
    fixerName: "Ana Martínez",
    description: "Muebles a medida, puertas, ventanas y reparaciones en madera",
    tags: ["Carpintería", "Muebles"],
    whatsapp: "+591 73456789",
    photos: [
      "/img/cons1.jfif",
      "/images/cons1.png",
      "/images/carpinteria 1.jpg",
      "/images/carpinteria 2.jpg",
      "/images/carpinteria 3.jpg",
    ],
    services: ["Carpintería"],
    createdAt: new Date("2025-01-13"),
    city: "Santa Cruz",
  },
  {
    id: "offer-004",
    fixerId: "fixer-005",
    fixerName: "Luis Fernández",
    description: "Obras de construcción, refacciones y ampliaciones residenciales",
    tags: ["Construcción", "Albañilería"],
    whatsapp: "+591 74561234",
    photos: [
      "/images/construccion 1.jpg",
      "/images/construccion 2.jpg",
      "/images/construccion 3.jpg",
    ],
    services: ["Albañilería"],
    createdAt: new Date("2025-01-12"),
    city: "El Alto",
  },
]
