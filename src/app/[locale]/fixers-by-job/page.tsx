"use client"

import { useState, useEffect } from "react"
import { useAppDispatch, useAppSelector } from "@/app/redux/hooks"
import {
  setSearchQuery,
  selectSearchQuery,
  expandAllJobs,
  collapseAllJobs,
} from "@/app/redux/slice/fixersByJobSlice"
import { useFixersByJob } from "@/hooks/useFixersByJob"
import { useFixerData } from "@/hooks/useFixerData"
import { JobFixerSection } from "@/Components/JobFixerSection"
import { Search, ChevronLeft, Home, AlertCircle, Loader } from "lucide-react"
import Link from "next/link"

// Mock data - fallback si el backend no está disponible
const MOCK_JOBS_WITH_FIXERS = [
  {
    jobType: "Electricista",
    fixers: [
      { id: "1", name: "Giovanny Flores", city: "La Paz", rating: 4.8 },
      { id: "2", name: "Carlos Mendez", city: "La Paz", rating: 4.5 },
      { id: "3", name: "Juan Perez", city: "Cochabamba", rating: 4.9 },
    ],
  },
  {
    jobType: "Plomero",
    fixers: [
      { id: "4", name: "Giovanny Rodriguez", city: "Santa Cruz", rating: 4.7 },
      { id: "5", name: "Miguel Garcia", city: "La Paz", rating: 4.6 },
    ],
  },
  {
    jobType: "Carpintero",
    fixers: [
      { id: "6", name: "Roberto Silva", city: "Cochabamba", rating: 4.9 },
      { id: "7", name: "Luis Fernandez", city: "La Paz", rating: 4.4 },
    ],
  },
  {
    jobType: "Pintor",
    fixers: [
      { id: "8", name: "Giovanny Martinez", city: "La Paz", rating: 4.8 },
      { id: "9", name: "Antonio Guzman", city: "Oruro", rating: 4.5 },
    ],
  },
]

export default function FixersByJobPage() {
  const dispatch = useAppDispatch()
  const searchQuery = useAppSelector(selectSearchQuery)
  const [isInitialized, setIsInitialized] = useState(false)

  const { jobsWithFixers, loading, error, refetch } = useFixerData()
  const dataToUse = jobsWithFixers.length > 0 ? jobsWithFixers : MOCK_JOBS_WITH_FIXERS

  useEffect(() => {
    if (!isInitialized && dataToUse.length > 0) {
      dispatch(expandAllJobs(dataToUse.map((job) => job.jobType)))
      setIsInitialized(true)
    }
  }, [dispatch, isInitialized, dataToUse])

  const filteredJobs = useFixersByJob(dataToUse, searchQuery)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb y Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <Link
              href="/"
              className="flex items-center gap-1 hover:text-blue-600 transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </Link>
            <span>/</span>
            <span className="text-gray-800 font-medium">Fixers Por Trabajo</span>
          </div>
          <Link
            href="/"
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors font-medium"
          >
            <ChevronLeft className="w-4 h-4" />
            Volver
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Fixers Por Trabajo</h1>
          <p className="text-gray-600">Explora todos los profesionales disponibles organizados por tipo de trabajo</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3 animate-fade-in">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-yellow-800">Usando datos de demostración</p>
              <p className="text-sm text-yellow-700 mt-1">No se pudo conectar con el servidor: {error}</p>
              <button
                onClick={refetch}
                className="mt-2 text-sm text-yellow-700 underline hover:text-yellow-900 font-medium transition-colors"
              >
                Reintentar conexión
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && jobsWithFixers.length === 0 && (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Cargando datos...</p>
            </div>
          </div>
        )}

        {/* Search and Controls */}
        {(!loading || jobsWithFixers.length > 0) && (
          <>
            <div className="mb-8 flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar fixer por nombre..."
                  value={searchQuery}
                  onChange={(e) => dispatch(setSearchQuery(e.target.value))}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all hover:border-gray-400"
                />
              </div>
              <button
                onClick={() => dispatch(collapseAllJobs())}
                className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Contraer
              </button>
              <button
                onClick={() => dispatch(expandAllJobs(dataToUse.map((job) => job.jobType)))}
                className="px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Expandir
              </button>
            </div>

            {/* Jobs List */}
            {filteredJobs.length > 0 ? (
              <div className="space-y-4">
                {filteredJobs.map((job) => (
                  <JobFixerSection
                    key={job.jobType}
                    jobType={job.jobType}
                    fixers={job.filteredFixers}
                    matchCount={job.matchCount}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-xl text-gray-500 mb-2">No se encontraron trabajos</p>
                <p className="text-gray-400">Intenta con otro término de búsqueda</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
