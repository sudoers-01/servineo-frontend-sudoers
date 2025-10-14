'use client';
import { useJobRequest } from './hooks/useJobRequest';
import JobRequestForm from './JobRequestForm';
import './JobRequestModal.css';

export default function JobRequestModal({ isOpen, onClose, onSubmit }) {
  const {
    formData,
    loading,
    error,
    initialLocation,
    currentMapLocation,
    isMapEnabled,
    handleInputChange,
    handleSubmit,
    handlePositionChange,
  } = useJobRequest(isOpen, onClose, onSubmit);

  if (!isOpen) return null;

  return (
    <JobRequestForm
      formData={formData}
      loading={loading}
      error={error}
      isMapEnabled={isMapEnabled}
      currentMapLocation={currentMapLocation}
      initialLocation={initialLocation}
      onInputChange={handleInputChange}
      onSubmit={handleSubmit}
      onPositionChange={handlePositionChange}
      onClose={onClose}
    />
  );
}
