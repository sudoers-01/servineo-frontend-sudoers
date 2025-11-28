"use client";

import { useState } from "react";
import ConfirmDisableModal from "@/components/ConfirmDisableModal";
import { disableJobMock } from "@/services/disableJobMock";

export default function JobsActions() {
  const [open, setOpen] = useState(false);

  const handleDisable = async () => {
    await disableJobMock();
    setOpen(false);
    console.log("Trabajo desactivado (mock)");
  };

  return (
    <div className="flex justify-end mb-4">
      <button
        onClick={() => setOpen(true)}
        className="bg-gray-200 px-4 py-2 rounded-lg text-black border shadow-sm hover:bg-gray-300"
      >
        Desactivar trabajo
      </button>

      <ConfirmDisableModal
        open={open}
        onConfirm={handleDisable}
        onCancel={() => setOpen(false)}
      />
    </div>
  );
}
