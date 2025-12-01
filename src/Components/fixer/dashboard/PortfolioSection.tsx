'use client';

import { useEffect, useState } from 'react';
import { PillButton } from '../Pill-button';
import {
  Plus,
  Trash2,
  Image as ImageIcon,
  Video,
  X,
  CheckCircle,
  XCircle,
  Loader2,
} from 'lucide-react';
import { Modal } from '@/Components/Modal';
import NotificationModal from '@/Components/Modal-notifications';
import { useForm } from 'react-hook-form';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

import {
  useGetPortfolioByFixerQuery,
  useCreatePortfolioItemMutation,
  useDeletePortfolioItemMutation,
} from '@/app/redux/services/portafolioApi';
import { isApiError } from '@/app/redux/services/baseApi';

type PortfolioFormValues = {
  type: 'image' | 'video';
  url?: string;
  youtubeUrl?: string;
};

interface PortfolioSectionProps {
  readOnly?: boolean;
  fixerId?: string;
}

// Helper para YouTube
function getYouTubeId(rawUrl?: string): string | undefined {
  if (!rawUrl) return undefined;
  try {
    const url = new URL(rawUrl);
    if (url.hostname.includes('youtu.be')) return url.pathname.replace('/', '');
    const vParam = url.searchParams.get('v');
    if (vParam) return vParam;
    const parts = url.pathname.split('/');
    return parts[parts.length - 1] || undefined;
  } catch {
    return undefined;
  }
}

export function PortfolioSection({ readOnly = false, fixerId }: PortfolioSectionProps) {
  const t = useTranslations('PortfolioSection');
  
  // ID efectivo
  const effectiveFixerId = fixerId || '69285d2860ea986813517593';

  // --- Estados UI ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'image' | 'video'>('image');
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  // Validación de imagen
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isValidUrl, setIsValidUrl] = useState<boolean | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  // Notificaciones
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [notification, setNotification] = useState({
    isOpen: false,
    type: 'success',
    title: '',
    message: '',
  });

  // --- RTK Query Hooks ---
  const {
    data: items = [],
    isLoading,
    isError,
  } = useGetPortfolioByFixerQuery(effectiveFixerId, {
    skip: !effectiveFixerId,
  });

  const [createItem, { isLoading: isCreating }] = useCreatePortfolioItemMutation();
  const [deleteItem, { isLoading: isDeleting }] = useDeletePortfolioItemMutation();

  // --- React Hook Form ---
  const { register, handleSubmit, reset, watch } = useForm<PortfolioFormValues>();
  const watchedUrl = watch('url');

  // Efecto de validación de imagen
  useEffect(() => {
    if (!watchedUrl || modalType !== 'image') {
      setPreviewUrl('');
      setIsValidUrl(null);
      return;
    }

    const timeoutId = setTimeout(() => {
      setIsValidating(true);
      const img = document.createElement('img');
      img.onload = () => {
        setIsValidUrl(true);
        setPreviewUrl(watchedUrl);
        setIsValidating(false);
      };
      img.onerror = () => {
        setIsValidUrl(false);
        setPreviewUrl('');
        setIsValidating(false);
      };
      img.src = watchedUrl;
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [watchedUrl, modalType]);

  // Helper de error seguro
  const getErrorMessage = (error: unknown) => {
    if (isApiError(error)) return error.data.message || t('errors.unknown');
    return t('errors.unexpected');
  };

  const showNotification = (
    type: 'success' | 'error' | 'warning',
    title: string,
    message: string,
  ) => {
    setNotification({ isOpen: true, type, title, message });
  };

  // --- Handlers ---
  const handleOpenModal = (type: 'image' | 'video') => {
    if (readOnly) return;
    setModalType(type);
    setPreviewUrl('');
    setIsValidUrl(null);
    reset({ type, url: '', youtubeUrl: '' });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    reset();
    setPreviewUrl('');
    setIsValidUrl(null);
  };

  const onSubmit = async (data: PortfolioFormValues) => {
    try {
      let finalUrl = data.url;

      if (data.type === 'image') {
        if (!finalUrl) {
          showNotification('error', t('notifications.requiredField'), t('notifications.enterUrl'));
          return;
        }
        if (isValidUrl !== true) {
          showNotification('error', t('notifications.invalidUrl'), t('notifications.imageLoadError'));
          return;
        }
      }

      if (data.type === 'video' && data.youtubeUrl) {
        const videoId = getYouTubeId(data.youtubeUrl);
        if (videoId) {
          if (!finalUrl) {
            finalUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
          }
        } else {
          showNotification('error', t('notifications.invalidUrl'), t('notifications.videoIdError'));
          return;
        }
      }

      const payload = {
        type: data.type,
        url: finalUrl,
        youtubeUrl: data.youtubeUrl,
        fixerId: effectiveFixerId,
      };

      await createItem(payload).unwrap();

      showNotification('success', t('notifications.success'), t('notifications.itemAdded'));
      handleCloseModal();
    } catch (error) {
      showNotification('error', t('notifications.saveError'), getErrorMessage(error));
    }
  };

  const handleDeleteRequest = (id: string) => {
    if (readOnly) return;
    setDeleteId(id);
    showNotification(
      'warning',
      t('notifications.confirmDelete'),
      t('notifications.deleteWarning'),
    );
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteItem(deleteId).unwrap();
      showNotification('success', t('notifications.deleted'), t('notifications.deletedSuccess'));
      setDeleteId(null);
    } catch (error) {
      showNotification('error', t('notifications.error'), getErrorMessage(error));
      setDeleteId(null);
    }
  };

  const cancelDelete = () => {
    setDeleteId(null);
  };

  if (isLoading) return <div className="text-center p-8 text-gray-500">{t('loading')}</div>;
  if (isError) return <div className="text-center p-8 text-red-500">{t('loadError')}</div>;

  return (
    <div className="space-y-6">
      <NotificationModal
        isOpen={notification.isOpen}
        onClose={() => setNotification((prev) => ({ ...prev, isOpen: false }))}
        type={notification.type as 'success' | 'error' | 'warning'}
        title={notification.title}
        message={notification.message}
        autoClose={notification.type !== 'warning'}
        autoCloseDelay={5000}
        onConfirm={deleteId ? confirmDelete : undefined}
        onCancel={deleteId ? cancelDelete : undefined}
      />

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <ImageIcon className="h-5 w-5 text-blue-600" />
          {readOnly ? t('titles.portfolio') : t('titles.myPortfolio')}
        </h2>

        {!readOnly && (
          <div className="flex gap-2">
            <PillButton
              onClick={() => handleOpenModal('video')}
              className="bg-primary text-white hover:bg-blue-800 flex items-center gap-2"
            >
              <Video className="h-4 w-4" />
              {t('buttons.video')}
            </PillButton>

            <PillButton
              onClick={() => handleOpenModal('image')}
              className="bg-primary text-white hover:bg-blue-800 flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              {t('buttons.image')}
            </PillButton>
          </div>
        )}
      </div>

      {items.length === 0 ? (
        <div className="text-center p-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
          <p className="text-gray-500">{t('emptyState')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item) => {
            const isVideo = item.type === 'video';
            const videoId = getYouTubeId(item.youtubeUrl || undefined);
            const hasUrl = item.url && item.url.trim() !== '';
            const isDataUrl = hasUrl && item.url!.startsWith('data:');
            const isHttpUrl =
              hasUrl && (item.url!.startsWith('http://') || item.url!.startsWith('https://'));

            return (
              <div
                key={item._id}
                className="group relative aspect-square rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 shadow-sm hover:shadow-lg transition-all cursor-pointer"
                onClick={() => !isVideo && hasUrl && setFullscreenImage(item.url || null)}
              >
                {isVideo && videoId ? (
                  <iframe
                    className="absolute inset-0 w-full h-full rounded-2xl pointer-events-none"
                    src={`https://www.youtube.com/embed/${videoId}`}
                    title="YouTube video"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : hasUrl ? (
                  <div className="absolute inset-0">
                    {isDataUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.url!}
                        alt={t('image.alt')}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : isHttpUrl ? (
                      <Image
                        src={item.url!}
                        alt={t('image.alt')}
                        fill
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        unoptimized={true}
                      />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.url!}
                        alt={t('image.alt')}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                    <div className="text-center p-4">
                      <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-xs text-gray-500 font-medium">{t('noImage')}</p>
                    </div>
                  </div>
                )}

                {!readOnly && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4 pointer-events-none">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteRequest(item._id!);
                      }}
                      disabled={isDeleting}
                      className="self-end p-2 bg-white/90 text-red-600 rounded-full hover:bg-white transition-colors shadow-sm hover:scale-110 pointer-events-auto"
                      title={t('tooltips.delete')}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Modal
        open={isModalOpen}
        onClose={handleCloseModal}
        title={modalType === 'image' ? t('modal.addImage') : t('modal.addVideo')}
        size="md"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input type="hidden" value={modalType} {...register('type')} />

          {modalType === 'image' ? (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('form.imageUrl.label')}
                </label>
                <div className="relative">
                  <input
                    {...register('url', { required: t('form.imageUrl.required') })}
                    className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 pr-10"
                    placeholder={t('form.imageUrl.placeholder')}
                  />
                  {isValidating && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Loader2 className="animate-spin h-5 w-5 text-blue-600" />
                    </div>
                  )}
                  {!isValidating && isValidUrl === true && (
                    <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-600" />
                  )}
                  {!isValidating && isValidUrl === false && (
                    <XCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-red-600" />
                  )}
                </div>
                {isValidUrl === false && (
                  <p className="text-xs text-red-600 mt-1">
                    {t('form.imageUrl.validationError')}
                  </p>
                )}
              </div>

              {previewUrl && isValidUrl && (
                <div className="border-2 border-dashed border-green-300 rounded-lg p-4 bg-green-50">
                  <p className="text-xs text-green-700 mb-2 font-semibold">{t('form.preview')}</p>
                  <div className="relative w-full h-48 rounded-lg overflow-hidden bg-white shadow-md">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('form.youtubeUrl.label')}
                </label>
                <input
                  {...register('youtubeUrl', { required: t('form.youtubeUrl.required') })}
                  className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  placeholder={t('form.youtubeUrl.placeholder')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('form.thumbnailUrl.label')}
                </label>
                <input
                  {...register('url')}
                  className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  placeholder={t('form.thumbnailUrl.placeholder')}
                />
              </div>
            </>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <PillButton
              type="button"
              onClick={handleCloseModal}
              className="bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              {t('buttons.cancel')}
            </PillButton>

            <PillButton
              type="submit"
              className="bg-primary text-white hover:bg-blue-800 flex items-center gap-2"
              disabled={(modalType === 'image' && isValidUrl !== true) || isCreating}
            >
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> {t('buttons.saving')}
                </>
              ) : (
                t('buttons.save')
              )}
            </PillButton>
          </div>
        </form>
      </Modal>

      {fullscreenImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setFullscreenImage(null)}
        >
          <button
            onClick={() => setFullscreenImage(null)}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-10"
          >
            <X className="h-6 w-6" />
          </button>
          <div
            className="relative w-full h-full max-w-6xl max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={fullscreenImage}
              alt={t('fullscreen.alt')}
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}