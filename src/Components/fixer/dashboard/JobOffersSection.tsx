'use client';

import { useState } from 'react';
import { PillButton } from '../Pill-button';
import { Plus, Briefcase, Trash2 } from 'lucide-react';
import { IJobOffer } from '@/types/fixer-profile';
import { Modal } from '@/Components/Modal';
import { useForm } from 'react-hook-form';
import { JobOfferCard } from '@/Components/Job-offers/JobOfferCard';
import type { JobOfferData } from '@/types/jobOffers';
import { useTranslations } from 'next-intl';
import { useAppSelector } from '@/app/redux/hooks';
import {
  useGetJobOffersByFixerQuery,
  useCreateJobOfferMutation,
  useUpdateJobOfferMutation,
  useDeleteJobOfferMutation,
  CreateJobOfferInput,
} from '@/app/redux/services/jobOfferApi';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';

// Type guards para errores
function isFetchBaseQueryError(error: unknown): error is FetchBaseQueryError {
  return typeof error === 'object' && error != null && 'status' in error;
}

function isErrorWithData(error: unknown): error is { data: { error?: string; message?: string } } {
  return (
    typeof error === 'object' &&
    error != null &&
    'data' in error &&
    typeof (error as { data: unknown }).data === 'object'
  );
}

interface JobOffersSectionProps {
  readOnly?: boolean;
}

export function JobOffersSection({ readOnly = false }: JobOffersSectionProps) {
  const t = useTranslations('JobOffersSection');
  const { user } = useAppSelector((state) => state.user);
  const userId = user?._id || '';

  // API Hooks
  const { data: apiOffers, isLoading } = useGetJobOffersByFixerQuery(userId, {
    skip: !userId,
  });
  const [createOffer] = useCreateJobOfferMutation();
  const [updateOffer] = useUpdateJobOfferMutation();
  const [deleteOffer] = useDeleteJobOfferMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [offerToDelete, setOfferToDelete] = useState<string | null>(null);
  const [editingOffer, setEditingOffer] = useState<IJobOffer | null>(null);

  const { register, handleSubmit, reset, setValue } = useForm<IJobOffer>();

  // Map API offers to local IJobOffer format
  const offers: IJobOffer[] =
    apiOffers?.map((offer) => ({
      _id: offer._id || offer.id,
      fixerId: offer.fixerId,
      fixerName: offer.fixerName,
      fixerWhatsapp: offer.whatsapp,
      description: offer.description,
      city: offer.city,
      price: offer.price,
      categories: offer.services || [],
      images: offer.photos || [],
      createdAt: offer.createdAt
        ? new Date(offer.createdAt).toISOString()
        : new Date().toISOString(),
    })) || [];

  const handleOpenModal = (offer?: IJobOffer) => {
    if (readOnly) return;
    if (offer) {
      setEditingOffer(offer);
      setValue('description', offer.description);
      setValue('price', offer.price);
      setValue('categories', offer.categories);
      setValue('city', offer.city);
    } else {
      setEditingOffer(null);
      reset({
        description: '',
        price: 0,
        categories: [],
        city: 'Cochabamba',
        images: [],
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingOffer(null);
    reset();
  };

  const onSubmit = async (data: IJobOffer) => {
    if (!user) return;

    // Validation
    if (!user.telefono) {
      alert('Por favor, actualiza tu perfil con un número de teléfono antes de crear una oferta.');
      return;
    }
    if (!data.description) {
      alert('La descripción es obligatoria.');
      return;
    }
    if (!data.city) {
      alert('La ciudad es obligatoria.');
      return;
    }
    if (!data.categories || data.categories.length === 0) {
      alert('Debes seleccionar al menos una categoría.');
      return;
    }
    const price = Number(data.price);
    if (isNaN(price) || price <= 0) {
      alert('El precio debe ser un número mayor a 0.');
      return;
    }

    try {
      const offerData: CreateJobOfferInput = {
        fixerId: user._id || '',
        fixerName: user.name,
        whatsapp: user.telefono,
        description: data.description,
        city: data.city,
        price: price,
        services: data.categories,
        photos: data.images || [],
        title: data.categories[0] || 'Servicio',
        location: user.ubicacion
          ? {
              lat: user.ubicacion.lat || 0,
              lng: user.ubicacion.lng || 0,
              address: user.ubicacion.direccion || '',
            }
          : undefined,
      };

      console.log('Sending offer data:', offerData);

      if (editingOffer && editingOffer._id) {
        await updateOffer({
          offerId: editingOffer._id,
          data: offerData,
        }).unwrap();
      } else {
        await createOffer(offerData).unwrap();
      }
      handleCloseModal();
    } catch (error) {
      console.error('Error saving offer:', error);

      let errorMessage = 'Error al guardar la oferta. Revisa la consola para más detalles.';

      if (isErrorWithData(error)) {
        console.error('Error details:', JSON.stringify(error.data, null, 2));
        if (error.data.error) {
          errorMessage = `Error: ${error.data.error}`;
        } else if (error.data.message) {
          errorMessage = `Error: ${error.data.message}`;
        }
      } else if (isFetchBaseQueryError(error)) {
        errorMessage = 'error' in error ? String(error.error) : 'Error de conexión';
      }

      alert(errorMessage);
    }
  };

  const openDeleteModal = (id: string) => {
    if (readOnly) return;
    setOfferToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (offerToDelete) {
      try {
        await deleteOffer(offerToDelete).unwrap();
        setOfferToDelete(null);
      } catch (error) {
        console.error('Error deleting offer:', error);
      }
    }
    setIsDeleteModalOpen(false);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setOfferToDelete(null);
  };

  // Helper to convert IJobOffer to JobOfferData for the card
  const mapToCardData = (offer: IJobOffer): JobOfferData => ({
    _id: offer._id || '',
    title: offer.categories[0] || t('card.defaultTitle'),
    description: offer.description,
    price: offer.price,
    category: offer.categories[0] || t('card.defaultCategory'),
    tags: offer.categories,
    city: offer.city,
    createdAt: new Date(offer.createdAt || Date.now()),
    fixerId: offer.fixerId,
    fixerName: offer.fixerName,
    fixerPhoto: undefined,
    contactPhone: offer.fixerWhatsapp,
    allImages: offer.images,
    photos: offer.images,
    imagenUrl: offer.images[0],
    rating: 0,
    status: 'active',
    updatedAt: new Date(offer.createdAt || Date.now()),
  });

  if (isLoading) {
    return <div className="p-8 text-center">Cargando ofertas...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-blue-600" />
          {readOnly ? t('titles.jobOffers') : t('titles.myJobOffers')}
        </h2>
        {!readOnly && (
          <PillButton
            onClick={() => handleOpenModal()}
            className="bg-primary text-white hover:bg-blue-800 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            {t('buttons.newOffer')}
          </PillButton>
        )}
      </div>

      {/* Lista de ofertas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {offers.length > 0 ? (
          offers.map((offer) => (
            <JobOfferCard
              key={offer._id}
              offer={mapToCardData(offer)}
              onEdit={!readOnly ? () => handleOpenModal(offer) : undefined}
              onDelete={!readOnly ? () => openDeleteModal(offer._id!) : undefined}
              readOnly={readOnly}
              className="h-full"
            />
          ))
        ) : (
          <div className="col-span-full text-center py-8 text-gray-500">
            No tienes ofertas publicadas.
          </div>
        )}
      </div>

      {/* Modal de Crear/Editar */}
      <Modal
        open={isModalOpen}
        onClose={handleCloseModal}
        title={editingOffer ? t('modal.editTitle') : t('modal.newTitle')}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('form.category.label')}
            </label>
            <select
              {...register('categories.0', { required: t('form.category.required') })}
              className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">{t('form.category.select')}</option>
              <option value="Plomería">{t('form.category.plumbing')}</option>
              <option value="Electricidad">{t('form.category.electricity')}</option>
              <option value="Carpintería">{t('form.category.carpentry')}</option>
              <option value="Pintura">{t('form.category.painting')}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('form.description.label')}
            </label>
            <textarea
              {...register('description', { required: t('form.description.required') })}
              rows={3}
              className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              placeholder={t('form.description.placeholder')}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('form.price.label')}
              </label>
              <input
                type="number"
                {...register('price', { required: true, min: 0 })}
                className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('form.city.label')}
              </label>
              <input
                {...register('city', { required: true })}
                className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <PillButton
              type="button"
              onClick={handleCloseModal}
              className="bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              {t('buttons.cancel')}
            </PillButton>
            <PillButton type="submit" className="bg-primary text-white hover:bg-blue-800">
              {t('buttons.save')}
            </PillButton>
          </div>
        </form>
      </Modal>

      {/* Modal de Confirmación de Eliminación */}
      <Modal open={isDeleteModalOpen} onClose={closeDeleteModal} title="Eliminar oferta" size="sm">
        <div className="p-6">
          <p className="text-gray-700">
            ¿Estás seguro de que quieres eliminar esta oferta de forma permanente? Esta acción{' '}
            <strong>no se puede deshacer</strong>.
          </p>
          <div className="flex justify-end gap-3 mt-6">
            <PillButton
              onClick={closeDeleteModal}
              className="bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              Cancelar
            </PillButton>
            <PillButton
              onClick={confirmDelete}
              className="bg-red-600 text-white hover:bg-red-700 flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Eliminar
            </PillButton>
          </div>
        </div>
      </Modal>
    </div>
  );
}