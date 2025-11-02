import { Button } from '../../../atoms/button';
export type FormType = 'create'|'edit'|'view'

interface EditAppointmentActionsProps {
  loading: boolean;
  changesDetected: boolean;
  onCancel: () => void;
  onDelete?: () => void; 
  submitDisabled?: boolean;
  formType?: FormType
}

export const EditAppointmentActions = ({
  loading,
  changesDetected,
  onCancel,
  onDelete,
  submitDisabled = false,
  formType = 'edit'
}: EditAppointmentActionsProps) => {
  return (
    <div className="flex items-center justify-end gap-2 pt-2">
      <Button variant="secondary" onClick={onCancel}>
        Volver
      </Button>
      {formType == 'create' && (
        <Button 
          type="submit"
          loading={loading}
          disabled={!changesDetected || submitDisabled}
        >
          {formType==='create'?'Crear Cita':'Actualizar'}
        </Button>
      )}

      

      {formType === 'view' && onDelete && (
        <Button onClick={onDelete}>
          Cancelar Cita
        </Button>
      )}
    </div>
  );
};