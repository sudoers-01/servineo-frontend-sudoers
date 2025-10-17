"use client"

import { Card } from "../Card"
import { PillButton } from "../Pill-button"

export interface Service {
  id: string
  name: string
  custom?: boolean
}

interface ServicesStepProps {
  services: Service[]
  selectedServiceIds: string[]
  onToggleService: (id: string) => void
  onAddCustomService: (name: string) => void
  onEditService: (id: string, name: string) => void
  onDeleteService: (id: string) => void
  error?: string
}

export function ServicesStep({
  services,
  selectedServiceIds,
  onToggleService,
  onAddCustomService,
  onEditService,
  onDeleteService,
  error,
}: ServicesStepProps) {
  const handleAddService = () => {
    const el = document.getElementById("newService") as HTMLInputElement | null
    if (el) {
      onAddCustomService(el.value)
      el.value = ""
    }
  }

  return (
    <Card title="Selecciona tus servicios">
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {services.map((s) => (
            <label
              key={s.id}
              className="flex items-center gap-2 rounded-full bg-gray-200 px-4 py-2 text-sm text-gray-900"
            >
              <input
                type="checkbox"
                checked={selectedServiceIds.includes(s.id)}
                onChange={() => onToggleService(s.id)}
              />
              <span className="flex-1 truncate">{s.name}</span>
              {s.custom && (
                <span className="flex gap-2 text-xs">
                  <button
                    type="button"
                    className="text-blue-700 hover:underline"
                    onClick={() => {
                      const name = prompt("Editar servicio", s.name) || s.name
                      onEditService(s.id, name)
                    }}
                  >
                    Editar
                  </button>
                  <button type="button" className="text-red-600 hover:underline" onClick={() => onDeleteService(s.id)}>
                    Eliminar
                  </button>
                </span>
              )}
            </label>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <input
            id="newService"
            placeholder="Añadir nuevo servicio"
            className="flex-1 rounded-full bg-gray-200 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-400"
          />
          <PillButton className="bg-blue-700 text-white hover:bg-blue-800" onClick={handleAddService}>
            Agregar
          </PillButton>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    </Card>
  )
}
