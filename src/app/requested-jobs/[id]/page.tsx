'use client';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Job {
  id: string;
  client: string;
  description: string;
  schedule: string;
}

const MOCK_JOBS: Job[] = [
  {
    id: '1',
    client: 'Fulanito de Tal',
    description: 'La tubería de lava platos de la cocina, en la parte de la pared presenta fugas.',
    schedule: 'De 09:00 a 10:00',
  },
  {
    id: '2',
    client: 'María Pérez',
    description: 'Revisión del sistema eléctrico en la oficina principal.',
    schedule: 'De 14:00 a 16:00',
  },
];

export default function JobDetailsPage() {
  const { id } = useParams();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const foundJob = MOCK_JOBS.find((job) => job.id === id);
    setJob(foundJob || null);
    setLoading(false);

    /*
    const fetchJob = async () => {
      try {
        const res = await fetch(`/api/requested-jobs/${id}`);
        if (!res.ok) throw new Error('Job not found');
        const data = await res.json();
        setJob(data);
      } catch (error) {
        console.error('Error fetching job:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
    */
  }, [id]);

  if (loading) {
    return (
      <main className="h-screen flex items-center justify-center text-gray-500">
        Loading job details...
      </main>
    );
  }

  const client = job?.client ?? '—';
  const description = job?.description ?? 'No description available.';
  const schedule = job?.schedule ?? 'Not defined.';

  const handleRegisterJob = () => {
    // this will be updated later when the modal is ready (to be connected)
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <header className="w-full bg-white shadow-sm p-4 flex justify-between items-center border-b">
        <h1 className="text-2xl font-semibold text-gray-800">Servineo</h1>
      </header>

      <section className="flex-1 p-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">
          Appointment Details
        </h2>

        <div className="flex items-center mb-6">
          <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-white mr-3">
            👤
          </div>
          <p className="font-medium text-gray-700 text-lg">{client}</p>
        </div>

        <div className="mb-6">
          <p className="font-semibold text-gray-700 mb-1">Description:</p>
          <p className="text-gray-600">{description}</p>
        </div>

        <div className="mb-12">
          <p className="font-semibold text-gray-700 mb-1">Scheduled appointment time:</p>
          <p className="text-gray-600">{schedule}</p>
        </div>
      </section>

      <footer className="w-full bg-white border-t p-4 flex justify-end">
        <button
          onClick={handleRegisterJob}
          className="bg-blue-600 text-white font-medium px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          Register job
        </button>
      </footer>
    </main>
  );
}
