'use client';

import { Star } from 'lucide-react';
import { mockComments } from './utils';
import { useRouter } from 'next/navigation';

export default function JobCommentsPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-white px-6 py-10 font-['Roboto']">
      <div className="max-w-4xl mx-auto">
        {/* Header superior */}
        <div className="flex items-center gap-2 mb-10">
          <button
            onClick={() => router.back()}
            className="text-[#111827] hover:underline text-sm"
          >
            ← Servineo
          </button>
        </div>

        {/* Título */}
        <h1 className="text-center text-lg font-semibold text-[#111827] mb-6">
          Jobs Comments
        </h1>

        {/* Botones Positive / Negative (sin funcionalidad) */}
        <div className="flex justify-center gap-4 mb-10">
          <button
            type="button"
            className="px-5 py-2 rounded-md bg-[#D1FAE5] text-[#111827] font-medium shadow-sm border border-[#A7F3D0]"
          >
            Positive
          </button>
          <button
            type="button"
            className="px-5 py-2 rounded-md bg-[#FECACA] text-[#111827] font-medium shadow-sm border border-[#FCA5A5]"
          >
            Negative
          </button>
        </div>

        {/* Lista estática de comentarios */}
        <div className="space-y-6">
          {mockComments.map((comment) => (
            <div
              key={comment.id}
              className="bg-white rounded-xl shadow-sm p-5 border border-[#E5E7EB]"
            >
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm font-medium text-[#111827]">
                  {comment.name} - {comment.job}
                </p>
                <p className="text-xs text-gray-500">Date: {comment.date}</p>
              </div>

              <p className="text-sm text-[#111827] mb-3">{comment.text}</p>

              {/* Solo 3 estrellas */}
              <div className="flex">
                {[...Array(3)].map((_, i) => (
                  <Star
                    key={i}
                    size={18}
                    className={
                      i < comment.rating
                        ? 'text-[#FACC15] fill-[#FACC15]'
                        : 'text-gray-300'
                    }
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
