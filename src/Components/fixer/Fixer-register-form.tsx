"use client"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { initialRegistrationSchema, type InitialRegistrationData } from "@/app/lib/validations/fixer-schemas"
import { AlertCircle } from "lucide-react"

interface FixerRegisterFormProps {
  onSubmit: (data: InitialRegistrationData) => void
  submitButtonText?: string
  defaultValues?: Partial<InitialRegistrationData>
}

export default function FixerRegisterForm({
  onSubmit,
  submitButtonText = "Registrar",
  defaultValues,
}: FixerRegisterFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<InitialRegistrationData>({
    resolver: zodResolver(initialRegistrationSchema),
    defaultValues: {
      name: defaultValues?.name || "Juan Carlos Pérez García",
      email: defaultValues?.email || "juan.perez@example.com",
      phone: defaultValues?.phone || "+591 70341618",
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1">
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Nombre Completo <span className="text-red-500">*</span>
        </label>
        <input
          {...register("name")}
          id="name"
          type="text"
          className="w-full rounded-full border border-transparent bg-gray-200 px-4 py-2 text-sm outline-none placeholder:text-gray-500 focus:border-blue-500 focus:bg-gray-100 focus:ring-2 focus:ring-blue-400 transition-all"
          placeholder="Ingrese su nombre completo"
        />
        {errors.name && (
          <div className="flex items-center gap-1 text-xs text-red-600">
            <AlertCircle className="h-3 w-3" />
            <span>{errors.name.message}</span>
          </div>
        )}
      </div>

      <div className="space-y-1">
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email <span className="text-red-500">*</span>
        </label>
        <input
          {...register("email")}
          id="email"
          type="email"
          className="w-full rounded-full border border-transparent bg-gray-200 px-4 py-2 text-sm outline-none placeholder:text-gray-500 focus:border-blue-500 focus:bg-gray-100 focus:ring-2 focus:ring-blue-400 transition-all"
          placeholder="correo@ejemplo.com"
        />
        {errors.email && (
          <div className="flex items-center gap-1 text-xs text-red-600">
            <AlertCircle className="h-3 w-3" />
            <span>{errors.email.message}</span>
          </div>
        )}
      </div>

      <div className="space-y-1">
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
          Teléfono <span className="text-red-500">*</span>
        </label>
        <input
          {...register("phone")}
          id="phone"
          type="tel"
          className="w-full rounded-full border border-transparent bg-gray-200 px-4 py-2 text-sm outline-none placeholder:text-gray-500 focus:border-blue-500 focus:bg-gray-100 focus:ring-2 focus:ring-blue-400 transition-all"
          placeholder="+591 70123456"
        />
        {errors.phone && (
          <div className="flex items-center gap-1 text-xs text-red-600">
            <AlertCircle className="h-3 w-3" />
            <span>{errors.phone.message}</span>
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800 focus:outline-none  focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? "Registrando..." : submitButtonText}
      </button>
    </form>
  )
}
