import * as React from "react";
import { Dialog, DialogContent } from "../../../calendar/ui/dialog";
import { Button } from "../../../atoms/button";

interface JustificationPopupProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
  title?: string;
}

export const JustificationPopup: React.FC<JustificationPopupProps> = ({
  open,
  onClose,
  onSubmit,
  title = "Justificación",
}) => {
  const [reason, setReason] = React.useState("");
  React.useEffect(() => {
    if (!open) {
      setReason(""); 
    }
  }, [open]);

  const handleSubmit = () => {
    const r = reason.trim();
    if (!r) return;
    onSubmit(r);
    setReason(""); 
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-transparent shadow-none p-0">
        <div className="overflow-hidden rounded-2xl max-w-sm bg-white">
          <div className="bg-indigo-700 text-white px-4 py-3 flex items-center justify-between">
            <span className="font-semibold">{title}</span>
            <button
              onClick={onClose}
              aria-label="Cerrar"
              className="opacity-90 hover:opacity-100 transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-6 text-center">
            <p className="text-sm text-gray-800 font-medium mb-3">
              Ingrese los motivos por los cuales desea cancelar esta cita:
            </p>

            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full h-28 border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-black" 
            />

            <div className="mt-5 flex justify-between gap-3">
              <Button variant="secondary" onClick={onClose} className="rounded-full px-6">
                Volver
              </Button>
              <Button
                onClick={handleSubmit}
                className="rounded-full px-6"
                disabled={!reason.trim()}
              >
                Reprogramar 
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
