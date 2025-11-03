import * as React from "react";
import { Dialog, DialogContent } from "../../../calendar/ui/dialog";
import { Button } from "../../../atoms/button";

type Variant = "info" | "confirm";

interface AlertPopupProps {
  open: boolean;
  onClose: () => void;
  variant?: Variant;
  title?: string;
  message: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
}

export const AlertPopup: React.FC<AlertPopupProps> = ({
  open,
  onClose,
  variant = "info",
  title = "Atención",
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Volver",
  onConfirm,
}) => (
  <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
    <DialogContent className="bg-transparent shadow-none p-0">
      <div className="overflow-hidden rounded-2xl max-w-sm bg-white">
        <div className="bg-indigo-700 text-white px-4 py-3 flex items-center justify-between">
          <span className="font-semibold">{title}</span>
          <button
            onClick={onClose}
            className="opacity-90 hover:opacity-100 transition"
            aria-label="Cerrar"
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
          <div className="mx-auto mb-3 flex justify-center">
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 512 512"
    className="h-10 w-10"
  >
    <path
      fill="#d32f2f"  
      d="M505.1 442.7L300.6 68.6c-18.4-32.8-64.8-32.8-83.2 0L6.9 442.7C-11.5 475.4 13.4 512 50.5 512h410.9c37.1 0 62-36.6 43.7-69.3z"
    />
    <path
      fill="#fff"  
      d="M256 384c-17.7 0-32 14.3-32 32s14.3 32 32 32 32-14.3 32-32-14.3-32-32-32zm32-224h-64v176h64V160z"
    />
  </svg>
</div>

          <div className="text-sm text-gray-700 leading-relaxed">{message}</div>

          <div className={`mt-5 flex ${variant === "confirm" ? "justify-between gap-3" : "justify-center"}`}>
            <Button variant="secondary" onClick={onClose} className="rounded-full px-6">
              {cancelLabel}
            </Button>
            {variant === "confirm" && (
              <Button onClick={onConfirm} className="rounded-full px-6">
                {confirmLabel}
              </Button>
            )}
          </div>
        </div>
      </div>
    </DialogContent>
  </Dialog>
);
