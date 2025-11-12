"use client";
import { showToast } from "nextjs-toast-notify";
export const toastWallet = {
  critical: (m="Saldo crítico (≤ 0).") => showToast.error(`🛑 ${m}`, { position:"top-center" }),
  low:      (m="Saldo bajo.")          => showToast.warning(`⚠️ ${m}`, { position:"top-center" }),
  ok:       (m="Saldo saludable.")     => showToast.success(`✅ ${m}`, { position:"top-center" }),
};
