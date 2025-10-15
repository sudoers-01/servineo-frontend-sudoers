// src/lib/payments.ts
import { apiFetch } from "./api";

export type Status = "pending" | "paid" | "failed" | "cancelled";

export async function createCashPayment(input: {
  jobId: string;
  subTotal: number;
  service_fee: number;
  discount?: number;
  currency?: "BOB" | "USD";
  paymentMethods?: "cash"; // alineado con tu backend
}) {
  // backend: POST /lab/payments
  return apiFetch<{ message: string; data: any }>(`/lab/payments`, {
    method: "POST",
    json: input,
  });
}

export async function getPaymentSummaryById(id: string) {
  // backend: GET /lab/payments/:id/summary
  return apiFetch<{ data: { id: string; code?: string | null; total: number; status: Status; expiresAt: string | null } }>(
    `/lab/payments/${id}/summary`
  );
}

export async function getLastPaymentSummaryByJob(jobId: string) {
  // backend: GET /lab/jobs/:jobId/payments/summary
  return apiFetch<{ data: { id: string; jobId: string; total: number; status: Status; expiresAt: string | null } }>(
    `/lab/jobs/${jobId}/payments/summary`
  );
}

export async function confirmPayment(id: string, code: string) {
  // backend: PATCH /lab/payments/:id/confirm
  return apiFetch<{ message: string; data: { id: string; total: number; status: Status; paidAt?: string } }>(
    `/lab/payments/${id}/confirm`,
    { method: "PATCH", json: { code } }
  );
}
