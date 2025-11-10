"use client";
import LoadingFallback from "./LoadingFallback";
import { Suspense } from "react";
import TrabajosList from "./TrabajosList";

export default function TrabajosRequester() {
  // Simulamos un usuario (puedes reemplazarlo con el real)
  const userId = "68ed47b64ed596d659c1ed8f";

  return (
    <Suspense fallback={<LoadingFallback />}>
      <TrabajosList userId={userId} />
    </Suspense>
  );
}
