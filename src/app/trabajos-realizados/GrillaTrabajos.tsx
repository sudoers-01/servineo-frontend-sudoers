// src/app/trabajos-realizados/GrillaTrabajos.tsx
import React from 'react';

const jobs = [
  { id: 1, name: 'Pipe repair', date: '10/12/2025', status: 'Completed' },
  { id: 2, name: 'Facade painting', date: '10/23/2025', status: 'Completed' },
  { id: 3, name: 'Electrical installation', date: '10/14/2025', status: 'Completed' },
  { id: 4, name: 'Garden maintenance', date: '10/10/2025', status: 'Completed' },
];

const GrillaTrabajos = () => {
  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8 bg-white">
      <h1 className="text-3xl font-handwritten text-center mb-8 text-black">Servineo</h1>

      <div className="border rounded-lg p-3 inline-block mb-6">
        <span className="italic font-semibold text-lg text-black">
          Completed jobs grid
        </span>
      </div>

      <div className="flex flex-col gap-4 overflow-y-auto max-h-[70vh]">
        {jobs.map((job) => (
          <div
            key={job.id}
            className="flex justify-between items-center border rounded-xl p-4 bg-white shadow-sm border-green-500"
          >
            {/* Left column: job name and date */}
            <div>
              <p className="italic font-medium text-black">Job name</p>
              <p className="italic text-black">{job.name}</p>
              <p className="italic text-sm text-gray-500 mt-1">
                Date: {job.date}
              </p>
            </div>

            {/* Center column: status */}
            <div className="text-center flex-1">
              <p className="text-green-500 font-semibold">{job.status}</p>
            </div>

            {/* Right column: button */}
            <div className="flex items-center justify-end">
              <button className="border rounded-lg px-4 py-2 text-white bg-[#1AA7ED] hover:bg-[#178AC3] transition-colors">
                Rate job
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GrillaTrabajos;
