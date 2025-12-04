'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Briefcase, Upload, X, MoreVertical } from 'lucide-react';
import { PillButton } from '../Pill-button';
import { Modal } from '@/Components/Modal';
import NotificationModal from '@/Components/Modal-notifications';
import { JobOfferCard } from '@/Components/Job-offers/JobOfferCard';
import Image from 'next/image';
import { boliviaCities } from '@/app/lib/validations/Job-offer-Schemas';
import { useTranslations } from 'next-intl';
import { useAppSelector } from '@/app/redux/hooks';
import { useToggleJobStatusMutation } from "@/app/redux/services/jobApi";

import {
  useGetJobsByFixerQuery,
  useCreateJobMutation,
  useUpdateJobMutation,
  useDeleteJobMutation,
} from '@/app/redux/services/jobApi';

import {
  jobOfferSchema,
  jobCategories,
  type JobOfferFormData,
  type IJobOffer,
} from '@/app/lib/validations/Job-offer-Schemas';
import type { JobOfferData } from '@/types/jobOffers';

interface NotificationState {
  isOpen: boolean;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  onConfirm?: () => void;
}

/**
 * Manejamos el estado Activa/Inactiva SOLO en frontend (mock),
 * sin tocar backend todavía.
 */
type JobStateFilter = 'active' | 'inactive';

export function JobOffersSection({ readOnly = false }: { readOnly?: boolean }) {
  const t = useTranslations('JobOffersSection');
  const { user } = useAppSelector((state) => state.user);
  const userId = user?._id || '';

  const { data: apiOffers, isLoading } = useGetJobsByFixerQuery(userId, { skip: !userId });
  const [createJob, { isLoading: isCreating }] = useCreateJobMutation();
  const [updateJob, { isLoading: isUpdating }] = useUpdateJobMutation();
  const [deleteJob] = useDeleteJobMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<IJobOffer | null>(null);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [toggleJobStatus] = useToggleJobStatusMutation();


  const [notify, setNotify] = useState<NotificationState>({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
  });

  // 🔹 Estado local para activa/inactiva por oferta (mock)
  const [jobStates, setJobStates] = useState<Record<string, boolean>>({});
  const [filter, setFilter] = useState<JobStateFilter>('active');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<JobOfferFormData>({
    resolver: zodResolver(jobOfferSchema),
    defaultValues: {
      price: 0,
      city: 'Cochabamba',
      contactPhone: user?.telefono || '',
      title: '',
      description: '',
      category: '',
      tags: [] as string[],
    },
  });

  const currentTags = watch('tags') || [];

  // ⬇️ Sincronizar estado local (activa/inactiva) cuando llegan ofertas
  useEffect(() => {
    if (apiOffers && apiOffers.length > 0) {
      setJobStates((prev) => {
        const next = { ...prev };
        apiOffers.forEach((offer: any) => {
          const id = offer._id as string;
          if (id && typeof next[id] === 'undefined') {
            next[id] = true; // por defecto, todas activas
          }
        });
        return next;
      });
    }
  }, [apiOffers]);

  // Lista filtrada según estado
  const filteredOffers = (apiOffers || []).filter((offer: any) => {
    const id = offer._id as string;
    const isActive = jobStates[id] ?? true;
    return filter === 'active' ? isActive : !isActive;
  });

  const showNotify = (
    type: NotificationState['type'],
    title: string,
    message: string,
    onConfirm?: () => void,
  ) => {
    setNotify({ isOpen: true, type, title, message, onConfirm });
  };

  const handleAddTag = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (!value) return;

    if (!currentTags.includes(value) && currentTags.length < 5) {
      setValue('tags', [...currentTags, value], { shouldValidate: true });
    }

    e.target.value = '';
  };

  const removeTag = (tagToRemove: string) => {
    const newTags = currentTags.filter((t) => t !== tagToRemove);
    setValue('tags', newTags, { shouldValidate: true });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (selectedImages.length + files.length > 5) {
      showNotify('warning', 'Límite excedido', 'Solo puedes subir hasta 5 imágenes.');
      return;
    }
    const newFiles: File[] = [];
    files.forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        showNotify('error', 'Imagen muy pesada', `La imagen ${file.name} excede 5MB.`);
      } else {
        newFiles.push(file);
      }
    });
    const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
    setSelectedImages((prev) => [...prev, ...newFiles]);
    setPreviewUrls((prev) => [...prev, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    if (previewUrls[index]?.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrls[index]);
    }
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleOpenModal = (offer?: IJobOffer) => {
    if (readOnly) return;

    if (offer) {
      setEditingOffer(offer);
      setValue('title', offer.title);
      setValue('description', offer.description);
      setValue('category', offer.category);
      setValue('price', offer.price);
      setValue('city', offer.city);
      setValue('contactPhone', offer.contactPhone);
      setValue('tags', offer.tags && offer.tags.length > 0 ? offer.tags : [offer.category]);

      setPreviewUrls(offer.photos || []);
      setSelectedImages([]);
    } else {
      setEditingOffer(null);
      reset({
        title: '',
        description: '',
        price: 0,
        category: '',
        city: 'Cochabamba',
        contactPhone: user?.telefono || '',
        tags: [],
      });
      setPreviewUrls([]);
      setSelectedImages([]);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingOffer(null);
    setSelectedImages([]);
    setPreviewUrls([]);
    reset();
  };

  const onSubmit = async (data: JobOfferFormData) => {
    if (!user?._id) return showNotify('error', 'Error', 'No se identificó al usuario.');

    if (!editingOffer && selectedImages.length === 0) {
      return showNotify('warning', 'Faltan imágenes', 'Debes subir al menos una foto.');
    }

    try {
      const formData = new FormData();
      formData.append('fixerId', user._id);
      formData.append('fixerName', user.name || 'Usuario');
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('category', data.category);
      formData.append('price', data.price.toString());
      formData.append('city', data.city);
      formData.append('contactPhone', data.contactPhone);
      formData.append('tags', JSON.stringify(data.tags));
      formData.append('rating', editingOffer ? editingOffer.rating.toString() : '5');

      selectedImages.forEach((file) => formData.append('photos', file));

      if (editingOffer) {
        await updateJob({ jobId: editingOffer._id, formData }).unwrap();
        showNotify('success', 'Actualizado', 'Oferta actualizada correctamente.');
      } else {
        await createJob(formData).unwrap();
        showNotify('success', 'Publicado', 'Oferta creada correctamente.');
      }
      handleCloseModal();
    } catch (error: unknown) {
      console.error(error);
      showNotify('error', 'Error', 'Error al procesar la solicitud.');
    }
  };

  const confirmDelete = (jobId: string) => {
    if (!userId) return;
    showNotify('warning', '¿Eliminar oferta?', 'Esta acción no se puede deshacer.', async () => {
      try {
        await deleteJob({ jobId, fixerId: userId }).unwrap();
        // limpiar estado local de activa/inactiva
        setJobStates((prev) => {
          const { [jobId]: _, ...rest } = prev;
          return rest;
        });
        setTimeout(() => showNotify('success', 'Eliminado', 'Oferta eliminada.'), 300);
      } catch (error: unknown) {
        showNotify('error', 'Error', 'No se pudo eliminar la oferta.');
        console.error(error);
      }
    });
  };

  const mapToCardData = (offer: IJobOffer): JobOfferData => ({
    _id: offer._id,
    fixerId: offer.fixerId,
    fixerName: offer.fixerName,
    title: offer.title,
    description: offer.description,
    category: offer.category,
    tags: offer.tags || [],
    price: offer.price,
    city: offer.city,
    contactPhone: offer.contactPhone,
    createdAt: offer.createdAt,
    rating: offer.rating,
    photos: offer.photos || [],
    allImages: offer.photos || [],
    imagenUrl: offer.photos?.[0] || '',
    status: 'active', // el estado real lo manejamos en jobStates
  });

  const isSubmitting = isCreating || isUpdating;

  const handleToggleActive = async (jobId: string) => {
  try {
    await toggleJobStatus({ jobId }).unwrap();
    setOpenMenuId(null);
  } catch (err) {
    console.error("Error al cambiar estado:", err);
    showNotify("error", "Error", "No se pudo cambiar el estado.");
  }
};


  if (isLoading)
    return <div className='p-10 text-center animate-pulse'>Cargando ofertas...</div>;

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between gap-4'>
        <h2 className='text-xl font-semibold text-gray-900 flex items-center gap-2'>
          <Briefcase className='h-5 w-5 text-blue-600' />
          {readOnly ? t('titles.jobOffers') : t('titles.myJobOffers')}
        </h2>

        {/* Filtro Activas / Inactivas + botón Nueva Oferta */}
        <div className='flex items-center gap-3'>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as JobStateFilter)}
            className='border border-gray-300 rounded-full px-3 py-1.5 text-sm text-gray-700 bg-white shadow-sm'
          >
            <option value='active'>Ofertas activas</option>
            <option value='inactive'>Ofertas inactivas</option>
          </select>

          {!readOnly && (
            <PillButton
              onClick={() => handleOpenModal()}
              className='bg-primary text-white hover:bg-blue-800 flex items-center gap-2'
            >
              <Plus className='h-4 w-4' />
              {t('buttons.newOffer')}
            </PillButton>
          )}
        </div>
      </div>

      {/* Grid */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {filteredOffers.map((offer: any) => {
    const id = offer._id as string;
    const isActive = jobStates[id] ?? true;

    return (
      <div key={id} className="relative h-full">
        {/* Card completa */}
        <div className="h-full rounded-2xl shadow bg-white flex flex-col overflow-visible">
          <JobOfferCard
            offer={mapToCardData(offer as IJobOffer)}
            onEdit={
              !readOnly
                ? () =>
                    handleOpenModal({
                      ...offer,
                      tags: offer.tags || [],
                      _id: id || '',
                    } as IJobOffer)
                : undefined
            }
            onDelete={!readOnly ? () => confirmDelete(id) : undefined}
            readOnly={readOnly}
            className="flex-1"
          />

          {/* Footer interno: estado + menú */}
          <div className="border-t px-3 py-2 flex items-center justify-between">
            {/* Badge de estado */}
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium border ${
                isActive
                  ? 'bg-green-50 text-green-600 border-green-200'
                  : 'bg-red-50 text-red-600 border-red-200'
              }`}
            >
              {isActive ? 'Activa' : 'Inactiva'}
            </span>

            {/* Menú de 3 puntos */}
            {!readOnly && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() =>
                    setOpenMenuId((prev) => (prev === id ? null : id))
                  }
                  className="p-1 rounded-full border border-gray-200 bg-white shadow hover:bg-gray-50"
                >
                  <MoreVertical size={16} className="text-gray-600" />
                </button>

                {openMenuId === id && (
                  <div className="absolute right-0 mt-2 w-40 bg-white border rounded-lg shadow-lg text-xs z-20">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(id)}
                      className="w-full text-left px-3 py-2 hover:bg-gray-50"
                    >
                      {isActive ? 'Desactivar trabajo' : 'Activar trabajo'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  })}

  {(!apiOffers || apiOffers.length === 0) && (
    <div className="col-span-full py-12 text-center text-gray-400 bg-gray-50 rounded-xl border border-dashed">
      No hay ofertas publicadas aún.
    </div>
  )}
</div>

      {/* Modal Formulario */}
      <Modal
        open={isModalOpen}
        onClose={handleCloseModal}
        title={editingOffer ? t('modal.editTitle') : t('modal.newTitle')}
        size='lg'
        closeOnOverlayClick={!isSubmitting}
        className='rounded-2xl border-primary border-2'
      >
        <Modal.Body>
          <form id='offerForm' onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
            {/* Título */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                {t('form.title.label')}
              </label>
              <input
                {...register('title')}
                className='w-full rounded-lg border-primary border focus:outline-none py-2 px-3'
                placeholder={t('form.title.placeholder')}
              />
              {errors.title && (
                <p className='text-red-500 text-xs mt-1'>{errors.title.message as string}</p>
              )}
            </div>

            {/* Categoría */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                {t('form.category.label')}
              </label>
              <select
                {...register('category')}
                className='w-full rounded-lg border-primary border focus:outline-none py-2 px-3 bg-white'
              >
                <option value=''>{t('form.category.select')}</option>
                {jobCategories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className='text-red-500 text-xs mt-1'>{errors.category.message as string}</p>
              )}
            </div>

            {/* Sección de Tags */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                {t('form.tags.label')}
              </label>

              <div className='flex flex-wrap gap-2 mb-2 min-h-[32px] p-2 bg-gray-50 rounded-lg border border-dashed border-gray-300'>
                {currentTags.map((tag) => (
                  <span
                    key={tag}
                    className='inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-primary border border-blue-200 shadow-sm'
                  >
                    {tag}
                    <button
                      type='button'
                      onClick={() => removeTag(tag)}
                      className='hover:text-red-500 focus:outline-none ml-1 p-0.5 rounded-full hover:bg-white/50 transition-colors'
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
                {currentTags.length === 0 && (
                  <span className='text-xs text-gray-400 italic'>
                    {t('form.tags.empty')}
                  </span>
                )}
              </div>

              <select
                onChange={handleAddTag}
                className='w-full rounded-lg border-primary border focus:outline-none bg-white py-2 px-3 cursor-pointer'
                disabled={currentTags.length >= 5}
                defaultValue=''
              >
                <option value='' disabled>
                  {currentTags.length >= 5
                    ? t('form.tags.limitReached')
                    : t('form.tags.addTag')}
                </option>
                {jobCategories.map((cat) => (
                  <option
                    key={cat.value}
                    value={cat.value}
                    disabled={currentTags.includes(cat.value)}
                  >
                    {cat.label}{' '}
                    {currentTags.includes(cat.value) ? t('form.tags.alreadyAdded') : ''}
                  </option>
                ))}
              </select>

              {errors.tags && (
                <p className='text-red-500 text-xs mt-1'>{errors.tags.message as string}</p>
              )}
            </div>

            {/* Descripción */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                {t('form.description.label')}
              </label>
              <textarea
                {...register('description')}
                rows={4}
                className='w-full rounded-lg border-primary border focus:outline-none py-2 px-3'
                placeholder={t('form.description.placeholder')}
              />
              {errors.description && (
                <p className='text-red-500 text-xs mt-1'>
                  {errors.description.message as string}
                </p>
              )}
            </div>

            {/* Precio y Ciudad */}
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  {t('form.price.label')}
                </label>
                <input
                  type='number'
                  {...register('price')}
                  className='w-full rounded-lg border-primary border focus:outline-none py-2 px-3'
                />
                {errors.price && (
                  <p className='text-red-500 text-xs mt-1'>{errors.price.message as string}</p>
                )}
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  {t('form.city.label')}
                </label>
                <select
                  {...register('city')}
                  className='w-full rounded-lg border-primary border focus:outline-none py-2 px-3 bg-white'
                >
                  {boliviaCities.map((city) => (
                    <option key={city.value} value={city.value}>
                      {city.label}
                    </option>
                  ))}
                </select>
                {errors.city && (
                  <p className='text-red-500 text-xs mt-1'>{errors.city.message as string}</p>
                )}
              </div>
            </div>

            {/* Teléfono */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                {t('form.contactPhone.label')}
              </label>
              <input
                {...register('contactPhone')}
                className='w-full rounded-lg border-primary border focus:outline-none py-2 px-3'
              />
              {errors.contactPhone && (
                <p className='text-red-500 text-xs mt-1'>
                  {errors.contactPhone.message as string}
                </p>
              )}
            </div>

            {/* Imágenes */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                {t('form.images.label')}
              </label>
              <div className='grid grid-cols-4 gap-2 mb-2'>
                {previewUrls.map((url, idx) => (
                  <div key={idx} className='relative aspect-square group'>
                    <Image
                      src={url}
                      className='w-full h-full object-cover rounded-lg border'
                      alt='preview'
                      width={100}
                      height={100}
                    />
                    <button
                      type='button'
                      onClick={() => removeImage(idx)}
                      className='absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity'
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                {previewUrls.length < 5 && (
                  <label className='flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg aspect-square cursor-pointer hover:bg-gray-50 transition-colors'>
                    <Upload className='text-gray-400' />
                    <input
                      type='file'
                      className='hidden'
                      accept='image/*'
                      multiple
                      onChange={handleImageChange}
                    />
                  </label>
                )}
              </div>
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <div className='flex justify-end gap-2'>
            <button
              onClick={handleCloseModal}
              className='border border-primary py-2 px-4 rounded-2xl text-primary hover:text-white hover:bg-primary transition-colors'
            >
              {t('buttons.cancel')}
            </button>
            <PillButton
              type='submit'
              form='offerForm'
              className='bg-primary text-white hover:bg-blue-800'
              disabled={isSubmitting}
            >
              {isSubmitting ? t('buttons.saving') : t('buttons.save')}
            </PillButton>
          </div>
        </Modal.Footer>
      </Modal>

      <NotificationModal
        isOpen={notify.isOpen}
        onClose={() => setNotify((prev) => ({ ...prev, isOpen: false }))}
        type={notify.type}
        title={notify.title}
        message={notify.message}
        onConfirm={notify.onConfirm}
        confirmText='Confirmar'
        autoClose={!notify.onConfirm}
      />
    </div>
  );
}
