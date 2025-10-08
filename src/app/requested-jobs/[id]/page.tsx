"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";

interface Job {
  id: string;
  cliente: string;
  descripcion: string;
  horario: string;
}

const MOCK_JOBS: Job[] = [
  {
    id: "1",
    cliente: "Fulanito de Tal",
    descripcion:
      "La tubería de lava platos de la cocina, en la parte de la pared presenta fugas.",
    horario: "De 09:00 a 10:00",
  },
  {
    id: "2",
    cliente: "María Pérez",
    descripcion: "Revisión del sistema eléctrico en la oficina principal.",
    horario: "De 14:00 a 16:00",
  },
];

export default function JobDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);

  useEffect(() => {
    const found = MOCK_JOBS.find((j) => j.id === id);
    setJob(found || null);
  }, [id]);

  if (!job) {
    return (
      <main className="h-screen flex items-center justify-center text-gray-500">
        Cargando detalles del trabajo...</main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">

      <header className="w-full bg-white shadow-sm p-4 flex justify-between items-center border-b">
  <h1 className="text-2xl font-semibold text-gray-800">Servineo</h1>
  <div className="flex gap-3">
    <button
      className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 shadow-md transition"
      title="Cancelar"
    >
      <X size={20} />
    </button>

    <button
      className="p-2 bg-green-600 text-white rounded-full hover:bg-green-700 shadow-md transition"
      title="Aceptar"
    >
      <Check size={20} />
    </button>
  </div>
</header>


      <section className="flex-1 p-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">
          Detalle de Cita
        </h2>

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
          <p className="font-semibold text-gray-700 mb-1">
            Horario de la cita establecida:
          </p>
          <p className="text-gray-600">{job.horario}</p>
        </div>
      </section>

      <footer className="w-full bg-white border-t p-4 flex justify-end">
        <button
          onClick={() => alert("Trabajo registrado")}
          className="bg-blue-600 text-white font-medium px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          Registrar trabajo
        </button>
      </footer>
    </main>
  );
}
