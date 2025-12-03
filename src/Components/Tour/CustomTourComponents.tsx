"use client";

interface NextBtnProps {
  currentStep: number;
  stepsLength: number;
  setCurrentStep?: (cb: (n: number) => number) => void;
  setIsOpen?: (v: boolean) => void;
  steps?: unknown[];
}

export const NextBtn = ({
  currentStep,
  stepsLength,
  setCurrentStep,
  setIsOpen,
  steps,
}: NextBtnProps) => {
  const last = currentStep === stepsLength - 1;
  if (currentStep === 0) return null;

  const click = () => {
    if (!setCurrentStep || !steps) return;

    if (last) {
      setIsOpen?.(false);
      localStorage.setItem("servineoTourVisto", "true");
      return;
    }

    setCurrentStep((s) => s + 1);
  };

  return (
    <button
      onClick={click}
      style={{
        backgroundColor: "#2B6AE0",
        color: "white",
        padding: "12px 28px",
        borderRadius: "10px",
        fontWeight: "700",
        border: "none",
        fontSize: "15px",
        cursor: "pointer",
        zIndex: 999999,
        boxShadow: "0 4px 12px rgba(43,106,224,0.3)",
      }}
    >
      {last ? "Finalizar" : "Siguiente"}
    </button>
  );
};

interface PrevProps {
  currentStep: number;
  setCurrentStep?: (cb: (n: number) => number) => void;
}

export const PrevBtn = ({ currentStep, setCurrentStep }: PrevProps) => {
  if (currentStep === 0) return null;

  return (
    <button
      onClick={() => setCurrentStep?.((s) => s - 1)}
      style={{
        color: "#666",
        padding: "12px 20px",
        background: "transparent",
        borderRadius: "10px",
        cursor: "pointer",
        fontWeight: "600",
      }}
    >
      Anterior
    </button>
  );
};
