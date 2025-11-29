'use client';

import { useState } from "react";
import { mockOfferJobs, RatedOfferJob, fallbackImage } from "./utils";
import { Pencil, Trash2 } from "lucide-react";

export default function ViewOfferJobsPage() {
  const [offers] = useState<RatedOfferJob[]>(mockOfferJobs);

  return (
    <main className="min-h-screen bg-white p-6 font-roboto text-gray-700">
      <h1 className="text-2xl font-semibold mb-6">Mis Ofertas de Trabajo</h1>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {offers.map(offer => (
          <article
            key={offer.id}
            className="border rounded-2xl shadow p-4 relative bg-white"
          >
            <img
              src={offer.image || fallbackImage}
              alt={offer.title}
              className="w-full h-40 object-cover rounded-xl"
            />

            <div className="mt-3 space-y-1">
              <p className="font-medium text-gray-800 truncate">
                {offer.title}
              </p>
              <p className="text-xs text-gray-500">
                {offer.city} · {new Date(offer.dateISO).toLocaleDateString()}
              </p>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
