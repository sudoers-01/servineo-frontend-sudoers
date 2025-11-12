"use client";
import { useEffect, useRef } from "react";
import { toastWallet } from "../../lib/toast";

export default function WalletToasts({ state }: { state: "ok" | "low" | "critical" | null }) {
  const last = useRef<typeof state>(null);
  useEffect(() => {
    if (!state || last.current === state) return;
    if (state === "critical") toastWallet.critical();
    else if (state === "low") toastWallet.low();
    else toastWallet.ok();
    last.current = state;
  }, [state]);
  return null;
}
