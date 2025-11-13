"use client";
import { useEffect, useRef } from "react";
import { toastWallet } from "../../lib/toast";

type Flags = { needsLowAlert?:boolean; needsCriticalAlert?:boolean };
type State = "ok" | "low" | "critical";

export default function WalletFlagWatcher({ fixerId }: { fixerId: string }) {
  const last = useRef<State | null>(null);

  useEffect(() => {
    let alive = true;
    const tick = async () => {
      try {
        const res = await fetch(`/api/fixer/payment-center/${fixerId}`, { cache: "no-store" });
        if (res.ok) {
          const w = await res.json();
          const f: Flags = w?.flags || {};
          const state: State = f.needsCriticalAlert ? "critical" : f.needsLowAlert ? "low" : "ok";
          if (last.current !== state) {
            if (state === "critical") toastWallet.critical();
            else if (state === "low") toastWallet.low();
            else toastWallet.ok();
            last.current = state;
          }
        }
      } catch {}
      if (alive) setTimeout(tick, 5000);
    };
    tick();
    return () => { alive = false; };
  }, [fixerId]);

  return null;
}
