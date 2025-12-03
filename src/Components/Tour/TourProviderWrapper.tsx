"use client";

import { TourProvider } from "@reactour/tour";
import { TourLogic } from "./TourLogic";
import { tourSteps } from "./TourSteps";
import { PrevBtn, NextBtn } from "./CustomTourComponents";

const tourStyles = {
  popover: (base: any) => ({
    ...base,
    borderRadius: "16px",
    padding: "24px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
    maxWidth: "450px",
    zIndex: 100000,
    backgroundColor: "#ffffff",
    color: "#333",
    fontSize: "15px",
  }),

  maskArea: (base: any) => ({
    ...base,
    rx: 12,
    fill: "rgba(0, 0, 0, 0.45)", // valor igual al del archivo "código después"
  }),

  badge: (base: any) => ({
    ...base,
    display: "none",
  }),

  controls: (base: any, state: any) => ({
    ...base,
    marginTop: "24px",
    display: "flex",
    justifyContent:
      state.current === 0 ? "center" : "space-between",
    alignItems: "center",
  }),

  navigation: (base: any, state: any) => ({
    ...base,
    display: state.current === 0 ? "none" : "flex",
    justifyContent: "center",
    flex: 1,
    margin: "0 10px",
  }),

  dot: (base: any, state: any) => ({
    ...base,
    width: "8px",
    height: "8px",
    margin: "0 4px",
    borderRadius: "50%",
    backgroundColor: state.current ? "#2B6AE0" : "#e2e8f0",
    transform: state.current ? "scale(1.2)" : "scale(1)",
    transition: "all 0.3s ease",
    boxShadow: "none",
    cursor: "pointer",
  }),

  close: (base: any) => ({
    ...base,
    right: 15,
    top: 15,
    color: "#999",
    width: "12px",
    height: "12px",
  }),
};

export function TourProviderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <TourProvider
      steps={tourSteps}
      styles={tourStyles}
      prevButton={PrevBtn}
      nextButton={NextBtn}
      showBadge={false}
      showDots={true}
      scrollSmooth={true}
      padding={{ mask: 10, popover: [5, 10] }}
      disableInteraction={true}
    >
      <TourLogic />
      {children}
    </TourProvider>
  );
}
