import { Button } from '../../../atoms/button';

interface EditAppointmentActionsProps {
  loading: boolean;
  changesDetected: boolean;
  onCancel: () => void;
  submitDisabled?: boolean;
}

export const EditAppointmentActions = ({
  loading,
  changesDetected,
  onCancel,
  submitDisabled = false
}: EditAppointmentActionsProps) => {
  return (
    <div className="flex items-center justify-end gap-2 pt-2">
      <Button variant="secondary" onClick={onCancel}>
        Cancelar
      </Button>
      <Button 
        type="submit"
        loading={loading}
        disabled={!changesDetected || submitDisabled}
      >
        Actualizar
      </Button>
    </div>
  );
};