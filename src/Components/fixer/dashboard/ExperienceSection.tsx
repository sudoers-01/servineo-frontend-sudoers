'use client';

import { useState } from 'react';
import { PillButton } from '../Pill-button';
import { Plus, Edit2, Trash2, Building2, Calendar, Briefcase, Loader2 } from 'lucide-react';
import { IExperience } from '@/types/fixer-profile';
import { Modal } from '@/Components/Modal';
import { useForm } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import NotificationModal from '@/Components/Modal-notifications';
import {
  useGetExperiencesByFixerQuery,
  useCreateExperienceMutation,
  useUpdateExperienceMutation,
  useDeleteExperienceMutation,
} from '@/app/redux/services/experiencesApi';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';

// Type guards para errores de API
function isFetchBaseQueryError(error: unknown): error is FetchBaseQueryError {
  return typeof error === 'object' && error != null && 'status' in error;
}

function isErrorWithMessage(error: unknown): error is { message: string } {
  return (
    typeof error === 'object' &&
    error != null &&
    'message' in error &&
    typeof (error as { message: unknown }).message === 'string'
  );
}

function isErrorWithData(error: unknown): error is { data: { message?: string } } {
  return (
    typeof error === 'object' &&
    error != null &&
    'data' in error &&
    typeof (error as { data: unknown }).data === 'object'
  );
}

interface ExperienceSectionProps {
  readOnly?: boolean;
  fixerId?: string;
}

export function ExperienceSection({ readOnly = false, fixerId }: ExperienceSectionProps) {
  const t = useTranslations('ExperienceSection');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExp, setEditingExp] = useState<IExperience | null>(null);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [notification, setNotification] = useState({
    isOpen: false,
    type: 'success',
    title: '',
    message: '',
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<Omit<IExperience, '_id' | 'createdAt' | 'updatedAt'>>();

  const isCurrent = watch('isCurrent');

  const {
    data: experiences = [],
    isLoading,
    isError,
    refetch,
  } = useGetExperiencesByFixerQuery(fixerId!, {
    skip: !fixerId,
  });

  const [createExperience, { isLoading: isCreating }] = useCreateExperienceMutation();
  const [updateExperience] = useUpdateExperienceMutation();
  const [deleteExperience] = useDeleteExperienceMutation();

  const handleOpenModal = (exp?: IExperience) => {
    if (readOnly) return;
    if (exp) {
      setEditingExp(exp);
      setValue('jobTitle', exp.jobTitle);
      setValue('organization', exp.organization);
      setValue('jobType', exp.jobType);
      setValue('isCurrent', exp.isCurrent);
      setValue('startDate', exp.startDate.split('T')[0]);
      setValue('endDate', exp.endDate ? exp.endDate.split('T')[0] : '');
    } else {
      setEditingExp(null);
      reset({
        jobTitle: '',
        jobType: 'Tiempo completo',
        organization: '',
        isCurrent: false,
        startDate: '',
        endDate: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingExp(null);
    reset();
  };

  const onSubmit = async (data: Omit<IExperience, '_id' | 'createdAt' | 'updatedAt'>) => {
    if (!fixerId) return;

    try {
      if (editingExp?._id) {
        await updateExperience({ id: editingExp._id, data }).unwrap();
        setNotification({
          isOpen: true,
          type: 'success',
          title: t('notifications.success'),
          message: t('notifications.updateSuccess'),
        });
      } else {
        await createExperience({ ...data, fixerId }).unwrap();
        setNotification({
          isOpen: true,
          type: 'success',
          title: t('notifications.success'),
          message: t('notifications.createSuccess'),
        });
      }

      handleCloseModal();
      refetch();
    } catch (error) {
      let errorMessage = t('notifications.genericError');

      if (isFetchBaseQueryError(error)) {
        errorMessage = 'error' in error ? String(error.error) : JSON.stringify(error.data);
      } else if (isErrorWithData(error) && error.data.message) {
        errorMessage = error.data.message;
      } else if (isErrorWithMessage(error)) {
        errorMessage = error.message;
      }

      setNotification({
        isOpen: true,
        type: 'error',
        title: t('notifications.error'),
        message: errorMessage,
      });
    }
  };

  const handleDelete = (id: string) => {
    if (readOnly) return;
    setPendin