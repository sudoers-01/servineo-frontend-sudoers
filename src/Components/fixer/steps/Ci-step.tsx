"use client"

import { Card } from "../Card"

interface CIStepProps {
  ci: string
  onCIChange: (ci: string) => void
  error?: string
}

export function CIStep({ ci, onCIChange, error }: CIStepProps) {
  const handleChange = (value: string) => {
    // Only allow numbers and hyphens
    const sanitized = value.replace(/[^0-9-]/g, "")
    onCIChange(sanitized)
  }

  return (
    <Card title="Registrar CI">
      <div className="space-y-3">
        <div className="space-y-1">
          <label className="text-sm text-gray-700">
            Cédula de Identidad <span className="text-red-600">*</span>
          </label>
          <input
            value={ci}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="Ej: 12747374"
            maxLength={15}
            className="w-full rounded-full border border-transparent bg-gray-200 px-4 py-2 text-sm outline-none placeholder:text-gray-500 focus:border-primary S"
          />
          <p className="text-xs text-gray-600">Solo se permiten números</p>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    </Card>
  )
}