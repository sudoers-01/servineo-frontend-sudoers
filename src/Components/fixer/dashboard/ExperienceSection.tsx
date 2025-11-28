"use client"

import { useState } from "react"
import { Building2, Calendar, Briefcase, Plus, Loader2, Edit2, Trash2 } from "lucide-react"
import NotificationModal from "@/Components/Modal-notifications"
import { IExperience } from "@/types/fixer-profile"
import { 
    useGetExperiencesByFixerQuery, 
    useCreateExperienceMutation, 
    useUpdateExperienceMutation, 
    useDeleteExperienceMutation 
  } from "@/app/redux/services/experiencesApi"
import { Modal } from "@/Components/Modal"
import { useForm } from "react-hook-form"
import { PillButton } from "../Pill-button"

export function ExperienceSection({ readOnly = false, fixerId }: { readOnly?: boolean; fixerId?: string }) {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingExp, setEditingExp] = useState<IExperience | null>(null)
    
    // Estados para el modal de notificaciones
    const [notification, setNotification] = useState({
        isOpen: false,
        type: 'success',
        title: '',
        message: ''
    })
    
    // Estado para controlar la confirmación de eliminación
    const [pendingDelete, setPendingDelete] = useState<string | null>(null)
    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<Omit<IExperience, '_id' | 'createdAt' | 'updatedAt'>>()
    
    const { data: fixerExperiences = [], isLoading, isError, refetch } = useGetExperiencesByFixerQuery(fixerId!, {
        skip: !fixerId,
    })
    
    const [createExperience, { isLoading: isCreating }] = useCreateExperienceMutation()
    const [updateExperience] = useUpdateExperienceMutation()
    const [deleteExperience] = useDeleteExperienceMutation()
    
    const displayExperiences = fixerExperiences || []

    const onSubmit = async (data: Omit<IExperience, '_id' | 'createdAt' | 'updatedAt'>) => {
        if (!fixerId) {
            console.error('Error: No se encontró el ID del fixer')
            return
        }
        
        try {
            let result
            if (editingExp && editingExp._id) {
                console.log('Actualizando experiencia:', { id: editingExp._id, updates: data })
                result = await updateExperience({
                    id: editingExp._id,
                    updates: data
                }).unwrap()
                console.log('Experiencia actualizada:', result)
            } else {
                console.log('Creando nueva experiencia:', { ...data, fixerId })
                result = await createExperience({ ...data, fixerId }).unwrap()
                console.log('Experiencia creada:', result)
            }
            
            setIsModalOpen(false)
            reset()
            setEditingExp(null)
            await refetch()
            
            // Mostrar notificación de éxito
            setNotification({
                isOpen: true,
                type: 'success',
                title: '¡Éxito!',
                message: editingExp ? 'Experiencia actualizada correctamente' : 'Experiencia creada correctamente'
            })
            
        } catch (error: any) {
            console.error('Error al guardar experiencia:', {
                message: error?.message,
                status: error?.status,
                data: error?.data,
                originalError: error
            })
            
            // Mostrar notificación de error
            setNotification({
                isOpen: true,
                type: 'error',
                title: 'Error',
                message: error?.data?.message || error?.message || 'Ocurrió un error al guardar la experiencia'
            })
        }
    }

    const handleEdit = (exp: IExperience) => {
        setEditingExp(exp)
        setValue("jobTitle", exp.jobTitle)
        setValue("organization", exp.organization)
        setValue("jobType", exp.jobType)
        setValue("isCurrent", exp.isCurrent)
        setValue("startDate", exp.startDate.split('T')[0])
        if (exp.endDate) {
            setValue("endDate", exp.endDate.split('T')[0])
        }
        setIsModalOpen(true)
    }

    const handleDelete = (id: string) => {
        // Mostrar modal de confirmación
        setNotification({
            isOpen: true,
            type: 'warning',
            title: 'Eliminar experiencia',
            message: '¿Estás seguro de que deseas eliminar esta experiencia?',
            autoClose: false
        })
        setPendingDelete(id)
    }

    const confirmDelete = async () => {
        if (!pendingDelete) return
        
        try {
            await deleteExperience(pendingDelete).unwrap()
            refetch()
            
            // Mostrar notificación de éxito
            setNotification({
                isOpen: true,
                type: 'success',
                title: '¡Eliminado!',
                message: 'La experiencia ha sido eliminada correctamente',
                autoClose: true
            })
        } catch (error: any) {
            console.error('Error al eliminar experiencia:', error)
            
            // Mostrar notificación de error
            setNotification({
                isOpen: true,
                type: 'error',
                title: 'Error',
                message: error?.data?.message || 'Ocurrió un error al eliminar la experiencia',
                autoClose: true
            })
        } finally {
            setPendingDelete(null)
        }
    }

    if (isLoading) return <div className="text-center p-8">Cargando experiencia...</div>
    if (isError) return <div className="text-center p-8 text-red-600">Error al cargar la experiencia.</div>

    return (
        <div className="space-y-6">
            {/* Modal de notificaciones */}
            <NotificationModal
                isOpen={notification.isOpen}
                onClose={() => {
                    setNotification(prev => ({ ...prev, isOpen: false }))
                    setPendingDelete(null)
                }}
                type={notification.type as 'success' | 'error' | 'info' | 'warning'}
                title={notification.title}
                message={
                    <div className="space-y-4">
                        <p>{notification.message}</p>
                        {pendingDelete && (
                            <div className="flex justify-end gap-3 mt-4">
                                <button
                                    onClick={() => {
                                        setNotification(prev => ({ ...prev, isOpen: false }))
                                        setPendingDelete(null)
                                    }}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={() => {
                                        setNotification(prev => ({ ...prev, isOpen: false }))
                                        confirmDelete()
                                    }}
                                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                                >
                                    Eliminar
                                </button>
                            </div>
                        )}
                    </div>
                }
                autoClose={notification.autoClose !== false}
                autoCloseDelay={5000}
            />
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-blue-600" />
                    {readOnly ? "Experiencia Laboral" : "Mi Experiencia Laboral"}
                </h2>
                {!readOnly && (
                    <PillButton
                        onClick={() => setIsModalOpen(true)}
                        className="bg-primary text-white hover:bg-blue-800 flex items-center gap-2"
                    >
                        <Plus className="h-4 w-4" />
                        Agregar Experiencia
                    </PillButton>
                )}
            </div>

            {displayExperiences.length === 0 ? (
                <div className="text-center p-8 text-gray-500">
                    {readOnly 
                        ? "Este profesional aún no ha registrado experiencia laboral."
                        : "Aún no has agregado ninguna experiencia laboral."
                    }
                </div>
            ) : (
                <div className="relative border-l-2 border-gray-200 ml-3 space-y-8 py-2">
                    {displayExperiences.map((exp) => (
                        <div key={exp._id} className="relative pl-8 group">
                            <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-white bg-blue-600 shadow-sm" />
                            <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-all hover:border-blue-200">
                                <div className="flex justify-between items-start gap-4">
                                    <div className="space-y-2">
                                        <div>
                                            <h3 className="font-semibold text-gray-900 text-lg">{exp.jobTitle}</h3>
                                            <div className="flex items-center gap-2 text-gray-600 font-medium">
                                                <Briefcase className="h-4 w-4" />
                                                <span>{exp.organization}</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                            <span className="inline-flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-md">
                                                <Calendar className="h-3.5 w-3.5" />
                                                {new Date(exp.startDate).toLocaleDateString()} - {exp.isCurrent ? "Presente" : exp.endDate ? new Date(exp.endDate).toLocaleDateString() : ""}
                                            </span>
                                            <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md font-medium text-xs uppercase tracking-wide">
                                                {exp.jobType}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    {!readOnly && (
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                type="button"
                                                onClick={() => handleEdit(exp)}
                                                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                                title="Editar"
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(exp._id!)}
                                                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                                title="Eliminar"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Modal
                open={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false)
                    reset()
                    setEditingExp(null)
                }}
                title={editingExp ? "Editar Experiencia" : "Nueva Experiencia"}
                size="lg"
            >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cargo / Título *</label>
                        <input
                            {...register("jobTitle", { required: "Este campo es requerido" })}
                            className={`w-full rounded-lg border ${errors.jobTitle ? 'border-red-500' : 'border-gray-300'} focus:border-blue-500 focus:ring-blue-500`}
                            placeholder="Ej: Plomero Senior"
                        />
                        {errors.jobTitle && (
                            <p className="mt-1 text-sm text-red-600">{errors.jobTitle.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Empresa / Organización *</label>
                        <input
                            {...register("organization", { required: "Este campo es requerido" })}
                            className={`w-full rounded-lg border ${errors.organization ? 'border-red-500' : 'border-gray-300'} focus:border-blue-500 focus:ring-blue-500`}
                            placeholder="Ej: Servicios Generales S.A."
                        />
                        {errors.organization && (
                            <p className="mt-1 text-sm text-red-600">{errors.organization.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Empleo *</label>
                        <select
                            {...register("jobType", { required: "Selecciona un tipo de empleo" })}
                            className={`w-full rounded-lg border ${errors.jobType ? 'border-red-500' : 'border-gray-300'} focus:border-blue-500 focus:ring-blue-500`}
                        >
                            <option value="">Selecciona un tipo</option>
                            <option value="Tiempo completo">Tiempo completo</option>
                            <option value="Medio tiempo">Medio tiempo</option>
                            <option value="Contrato">Contrato</option>
                            <option value="Freelance">Freelance</option>
                        </select>
                        {errors.jobType && (
                            <p className="mt-1 text-sm text-red-600">{errors.jobType.message}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Inicio *</label>
                            <input
                                type="date"
                                {...register("startDate", { required: "Este campo es requerido" })}
                                className={`w-full rounded-lg border ${errors.startDate ? 'border-red-500' : 'border-gray-300'} focus:border-blue-500 focus:ring-blue-500`}
                            />
                            {errors.startDate && (
                                <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Fin</label>
                            <input
                                type="date"
                                {...register("endDate")}
                                className="w-full rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2 py-2">
                        <input
                            type="checkbox"
                            id="isCurrent"
                            {...register("isCurrent")}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor="isCurrent" className="text-sm font-medium text-gray-700">
                            Actualmente trabajo aquí
                        </label>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <PillButton
                            type="button"
                            onClick={() => {
                                setIsModalOpen(false)
                                reset()
                            }}
                            className="bg-gray-100 text-gray-700 hover:bg-gray-200"
                            disabled={isCreating}
                        >
                            Cancelar
                        </PillButton>
                        <PillButton
                            type="submit"
                            className="bg-primary text-white hover:bg-blue-800 flex items-center gap-2"
                            disabled={isCreating}
                        >
                            {isCreating ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Guardando...
                                </>
                            ) : 'Guardar'}
                        </PillButton>
                    </div>
                </form>
            </Modal>
        </div>
    )
}
