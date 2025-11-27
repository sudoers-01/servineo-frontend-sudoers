"use client"

import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { initialRegistrationSchema, type InitialRegistrationData } from "@/app/lib/validations/fixer-schemas"
import { AlertCircle } from "lucide-react"
import { useState } from "react"
import { useAppSelector } from "@/app/redux/hooks"
import { toast } from "sonner"
import { useConvertToFixerMutation } from "@/app/redux/services/fixerApi"

interface FixerRegisterFormProps {
  onSubmit: (data: InitialRegistrationData) => void
  submitButtonText?: string
  defaultValues?: Partial<InitialRegistrationData>
}

export default function FixerRegisterForm({
  onSubmit,
  submitButtonText = "Continuar",
  defaultValues,
}: FixerRegisterFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { user } = useAppSelector((state) => state.user)
  const [convertToFixer, { isLoading: isMutating }] = useConvertToFixerMutation()

  const {
    control,
    handleSubmit,
    formState: { errors },
    trigger, // opcional: para forzar validación
  } = useForm<InitialRegistrationData>({
    resolver: zodResolver(initialRegistrationSchema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      email: defaultValues?.email ?? "",
      phone: defaultValues?.phone ?? "",
    },
    mode: "onChange",
  })

  const handleFormSubmit = async (data: InitialRegistrationData) => {
    console.log("FORMULARIO ENVIADO CORRECTAMENTE!", data)

    if (!user?._id) {
      toast.error("Debes iniciar sesión para continuar")
      return
    }

    // AVANZAR AL SIGUIENTE PASO INMEDIATAMENTE
    onSubmit(data)
    toast.success("¡Datos guardados! Continuando...")

    // Intentamos convertir a fixer en segundo plano (no bloqueamos el flujo)
    try {
      setIsSubmitting(true)

      const payload = {
        profile: {
          ci: "",
          selectedServiceIds: [] as string[],
          vehicle: {
            hasVehiculo: false,
          },
          paymentMethods: [] as any[],
          terms: {
            accepted: true,
          },
          phone: data.phone.trim(),
        },
      }

      const result = await convertToFixer({
        id: user._id,
        payload,
      }).unwrap()

      console.log("Convertido a fixer exitosamente:", result)
      toast.success(result.message || "¡Ya eres Fixer! Completa tu perfil")

    } catch (error: any) {
      console.error("Error al activar cuenta Fixer:", error)
      toast.error("Error al activar Fixer, pero puedes continuar con el registro")
    } finally {
      setIsSubmitting(false)
    }
  }

  const isLoading = isSubmitting || isMutating

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="space-y-1">
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Nombre Completo <span className="text-red-500">*</span>
        </label>
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <div className="relative">
              <input
                {...field}
                id="name"
                type="text"
                maxLength={30}
                className="w-full rounded-full border border-transparent bg-gray-200 px-4 py-2 text-sm outline-none placeholder:text-gray-500 focus:border-blue-500 focus:bg-gray-100 focus:ring-2 focus:ring-blue-400 transition-all"
                placeholder="Ingrese su nombre completo"
                onChange={(e) => {
                  const value = e.target.value
                    .replace(/[^A-Za-záéíóúÁÉÍÓÚñÑ\s]/g, "")
                    .slice(0, 30)
                  field.onChange(value)
                }}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                {field.value?.length || 0}/30
              </span>
            </div>
          )}
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
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <input
              {...field}
              id="email"
              type="email"
              className="w-full rounded-full border border-transparent bg-gray-200 px-4 py-2 text-sm outline-none placeholder:text-gray-500 focus:border-blue-500 focus:bg-gray-100 focus:ring-2 focus:ring-blue-400 transition-all"
              placeholder="correo@ejemplo.com"
            />
          )}
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
        <Controller
          name="phone"
          control={control}
          render={({ field }) => (
            <div className="relative">
              <input
                {...field}
                id="phone"
                type="tel"
                className="w-full rounded-full border border-transparent bg-gray-200 px-4 py-2 text-sm outline-none placeholder:text-gray-500 focus:border-blue-500 focus:bg-gray-100 focus:ring-2 focus:ring-blue-400 transition-all pr-20"
                placeholder="+591 71234567"
                onChange={(e) => {
                  const value = e.target.value.replace(/[^\d\s+-]/g, "")
                  field.onChange(value)
                }}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                {field.value ? field.value.replace(/\D/g, "").length : 0}/10 dígitos
              </span>
            </div>
          )}
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
        disabled={isLoading}
        className="w-full rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-blue-500/30 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none"
      >
        {isLoading ? "Procesando..." : submitButtonText}
      </button>
    </form>
  )
}