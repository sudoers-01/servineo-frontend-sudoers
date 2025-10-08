'use client';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Job {
  id: string;
  cliente: string;
  descripcion: string;
  horario: string;
}

export default function JobDetailsPage() {
  const { id } = useParams();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchJob = async () => {
      try {
        const res = await fetch(`/api/requested-jobs/${id}`);
        if (!res.ok) throw new Error('No se encontró el trabajo');
        const data = await res.json();
        setJob(data);
      } catch (error) {
        console.error('Error al obtener el trabajo:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  if (loading) {
    return (
      <main className="h-screen flex items-center justify-center text-gray-500">
        Cargando detalles del trabajo...
      </main>
    );
  }

  if (!job) {
    return (
      <main className="h-screen flex items-center justify-center text-gray-500">
        No se encontró el trabajo solicitado.
      </main>
    );
  }

  const handleRegisterJob = () => {
    // aqui actualizaremos cuando se tenga lo del modal (hay que conectarlo)
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <header className="w-full bg-white shadow-sm p-4 flex justify-between items-center border-b">
        <h1 className="text-2xl font-semibold text-gray-800">Servineo</h1>
      </header>

      <section className="flex-1 p-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Detalle de Cita</h2>

        <div className="flex items-center mb-6">
          <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-white mr-3">
            👤
          </div>
          <p className="font-medium text-gray-700 text-lg">{job.cliente}</p>
        </div>

        <div className="mb-6">
          <p className="font-semibold text-gray-700 mb-1">Descripción:</p>
          <p className="text-gray-600">{job.descripcion}</p>
        </div>

        <div className="mb-12">
          <p className="font-semibold text-gray-700 mb-1">Horario de la cita establecida:</p>
          <p className="text-gray-600">{job.horario}</p>
        </div>
      </section>

      <footer className="w-full bg-white border-t p-4 flex justify-end">
        <button
          onClick={handleRegisterJob}
          className="bg-blue-600 text-white font-medium px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          Registrar trabajo
        </button>
      </footer>
    </main>
  );
}
