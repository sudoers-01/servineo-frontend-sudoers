import { useMemo, useState } from "react";
import { Button } from '../../../atoms/button';
import { AlertPopup } from "../popups/AlertPopup";

export type FormType = 'create'|'edit'|'view'

interface EditAppointmentActionsProps {
  loading: boolean;
  changesDetected: boolean;
  onCancel: () => void;
  onDelete?: () => void; 
  submitDisabled?: boolean;
  formType?: FormType;
  appointmentStart?: string | Date; 
}

const THREE_HOURS_MS = 13 * 60 * 60 * 1000;



export const EditAppointmentActions = ({
  loading,
  changesDetected,
  onCancel,
  onDelete,
  submitDisabled = false,
  formType = 'edit',
  appointmentStart,
}: EditAppointmentActionsProps) => {
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupVariant, setPopupVariant] = useState<"info"|"confirm">("info");
  const [popupMessage, setPopupMessage] = useState<React.ReactNode>(null);
  const [popupConfirmLabel, setPopupConfirmLabel] = useState<string>("Confirmar");
  const [popupOnConfirm, setPopupOnConfirm] = useState<(() => void) | undefined>(undefined);
  const within3h = useMemo(() => {
    if (!appointmentStart) return false;
    const start = new Date(appointmentStart).getTime();
    return start - Date.now() < THREE_HOURS_MS;
  }, [appointmentStart]);
  const openInfo = (message: React.ReactNode) => {
  setPopupVariant("info");
  setPopupMessage(message);
  setPopupOnConfirm(undefined);
  setPopupOpen(true);
};

const openConfirm = (
  message: React.ReactNode,
  confirmLabel = "Cancelar",
  onConfirm?: () => void
) => {
  setPopupVariant("confirm");
  setPopupMessage(message);
  setPopupConfirmLabel(confirmLabel);
  setPopupOnConfirm(() => onConfirm);
  setPopupOpen(true);
};

const handleTryReprogram = () => {
  if (within3h) {
    openInfo(<>No es posible cancelar una cita con menos de <b>3 horas</b> de anticipación.</>);
  } else {
    openConfirm(
      <>
        ¿Está seguro que desea cancelar la cita actual?
        <br />
        <span className="text-gray-500 text-xs">
          *En caso de cancelación, la cita deberá ser reprogramada.
        </span>
      </>,
      "Cancelar",
      () => {
        setPopupOpen(false);
      }
    );
  }
};

const handleTryCancel = () => {
  if (within3h) {
    openInfo(<>No es posible cancelar una cita con menos de <b>3 horas</b> de anticipación.</>);
  } else {
    openConfirm(
      <>
        ¿Está seguro que desea cancelar la cita actual?
        <br />
        <span className="text-gray-500 text-xs">
          *En caso de cancelación, la cita deberá ser reprogramada.
        </span>
      </>,
      "Cancelar",
      () => {
        setPopupOpen(false);
      }
    );
  }
};

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
     {formType === "edit" && (
        <>
          <Button variant="secondary" onClick={handleTryReprogram}>Reprogramar</Button>
          <Button type="submit" loading={loading} disabled={!changesDetected || submitDisabled}>
            Actualizar
          </Button>
        </>
      )}
            
      {formType === 'view' && onDelete && (
        <Button onClick={onDelete}>
          Cancelar Cita
        </Button>
      )}
      <AlertPopup
        open={popupOpen}
        onClose={() => setPopupOpen(false)}
        variant={popupVariant}
        message={popupMessage ?? ""}
        confirmLabel={popupConfirmLabel}
        onConfirm={popupOnConfirm}
        cancelLabel="Volver"
      />
    </div>
  );
};
