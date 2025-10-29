interface EditAppointmentHeaderProps {
  onClose: () => void;
}

export const EditAppointmentHeader = ({ onClose }: EditAppointmentHeaderProps) => {
  return (
    <div className="flex items-start justify-between">
      <h3 id="edit-appointment-title" className="text-lg font-semibold text-black">
        Editar cita
      </h3>
      <button 
        aria-label="Cerrar" 
        className="text-gray-500 hover:text-gray-700" 
        onClick={onClose}
      >
        ✕
      </button>
    </div>
  );
};