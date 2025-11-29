'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getPromotionsByOfferId } from '@/services/promotions';
import { getJobInfo } from '@/services/job-info';
import { Promotion } from '@/types/promotion';

export default function JobPromotionsPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.jobId as string;

  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [jobTitle, setJobTitle] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string>(''); // Nuevo estado para ver errores en pantalla

  useEffect(() => {
    if (!jobId) return;

    const fetchData = async () => {
      setLoading(true);
      setErrorMsg('');
      
      try {
        try {
            const jobData = await getJobInfo(jobId);
            console.log("Info del Trabajo recibida:", jobData);
            setJobTitle(jobData.title || 'Sin título');
        } catch (e) {
            console.error("Error cargando Job Info:", e);
            setJobTitle('Error cargando título');
        }

        const promosData = await getPromotionsByOfferId(jobId);

        if (Array.isArray(promosData)) {
            setPromotions(promosData);
        } else {
            console.error("El formato de promociones no es un array:", promosData);
            setErrorMsg('Formato de datos incorrecto del servidor');
        }

      } catch (error) {
        setErrorMsg('Error de conexión con el servidor');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [jobId]);

  return (
    <div className="min-h-screen bg-white text-black font-sans">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex items-center justify-between mb-6 border-b border-gray-200 pb-4">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            Volver
          </button>
          
          <h1 className="text-lg sm:text-2xl font-bold text-gray-900 text-center flex-1 px-2 truncate">
            Promotions - {loading ? '...' : jobTitle}
          </h1>
          
          <div className="w-[70px] hidden sm:block"></div> 
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            <p className="text-gray-500">Cargando promociones...</p>
          </div>
        ) : promotions.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
            <p className="text-gray-500 text-lg">No promotions found for this job.</p>
            <p className="text-xs text-gray-400 mt-2">ID: {jobId}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {promotions.map((promo, index) => (
              <div
                key={promo._id || index}
                className="group relative flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-200 hover:bg-gray-50"
              >
                <div className="flex-1 min-w-0 pr-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-blue-700 transition-colors">
                    {promo.title}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {promo.description}
                  </p>
                  <p className="text-sm font-semibold text-blue-600 mt-2 sm:hidden">
                    Price: {promo.price}
                  </p>
                </div>

                <div className="hidden sm:block text-right shrink-0">
                   <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                     Price: {promo.price}
                   </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}