"use client"

import type React from "react"

import { useState } from "react"

export interface FormFieldConfig {
  id: string
  label: string
  type: "text" | "email" | "phone" | "password" | "number"
  placeholder?: string
  required?: boolean
}

interface FixerRegisterFormProps {
  fields: FormFieldConfig[]
  onSubmit: (data: Record<string, string>) => void
  submitButtonText?: string
  defaultValues?: Record<string, string>
}

export default function FixerRegisterForm({
  fields,
  onSubmit,
  submitButtonText = "Registrar",
  defaultValues = {},
}: FixerRegisterFormProps) {
  const [formData, setFormData] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {}
    fields.forEach((field) => {
      initial[field.id] = defaultValues[field.id] || ""
    })
    console.log("[v0] Initial form data:", initial)
    return initial
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (id: string, value: string) => {
    console.log("[v0] Field changed:", id, "New value:", value)
    setFormData((prev) => ({ ...prev, [id]: value }))
    if (errors[id]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[id]
        return newErrors
      })
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    fields.forEach((field) => {
      const value = formData[field.id]?.trim()

      if (field.required !== false && !value) {
        newErrors[field.id] = `${field.label} es requerido`
        return
      }

      if (value) {
        if (field.type === "email" && !isValidEmail(value)) {
          newErrors[field.id] = "Email inválido"
        } else if (field.type === "phone" && !isValidPhone(value)) {
          newErrors[field.id] = "Teléfono inválido"
        }
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("[v0] Form submitted with data:", formData)

    if (validateForm()) {
      console.log("[v0] Form validation passed, calling onSubmit")
      onSubmit(formData)
    } else {
      console.log("[v0] Form validation failed")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {fields.map((field) => (
        <div key={field.id} className="space-y-1">
          <label htmlFor={field.id} className="block text-sm font-medium text-gray-700">
            {field.label}
            {field.required !== false && <span className="text-red-500 ml-1">*</span>}
          </label>
          <input
            id={field.id}
            type={field.type === "phone" ? "tel" : field.type}
            value={formData[field.id]}
            onChange={(e) => handleChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            className="w-full rounded-full border border-transparent bg-gray-200 px-4 py-2 text-sm outline-none placeholder:text-gray-500 focus:border-primary "
          />
          {errors[field.id] && <p className="text-xs text-red-600">{errors[field.id]}</p>}
        </div>
      ))}

      <button
        type="submit"
        className="w-full rounded-full bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        {submitButtonText}
      </button>
    </form>
  )
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[\d\s\-+()]{8,}$/
  return phoneRegex.test(phone)
}
