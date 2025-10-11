'use client';
import React, { useEffect, useState } from 'react';

interface Job {
  id: string;
  name: string;
  date: string;
  status: string;
}

const GrillaTrabajos = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3000/api/jobs/completed')
      .then((res) => res.json())
      .then((data) => {
        setJobs(data);
      })
      .catch((err) => {
        console.error('Error fetching jobs:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="text-center py-10 text-black">Loading completed jobs...</div>;
  }

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8 bg-white">
      <h1 className="text-3xl font-handwritten text-center mb-8 text-black">Servineo</h1>

      <div className="border rounded-lg p-3 inline-block mb-6">
        <span className="italic font-semibold text-lg text-black">Completed jobs grid</span>
      </div>

      {jobs.length === 0 ? (
        <div className="text-center text-gray-500 italic py-10 border rounded-lg">
          No completed jobs found.
        </div>
      ) : (
        <div className="flex flex-col gap-4 overflow-y-auto max-h-[70vh]">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="flex justify-between items-center border rounded-xl p-4 bg-white shadow-sm border-green-500"
            >
              <div>
                <p className="italic font-medium text-black">{job.name}</p>
                <p className="italic text-sm text-gray-500 mt-1">Date: {job.date}</p>
              </div>

              <div className="text-center flex-1">
                <p className="text-green-500 font-semibold capitalize">{job.status}</p>
              </div>

              <div className="flex items-center justify-end">
                <button className="border rounded-lg px-4 py-2 text-white bg-[#1AA7ED] hover:bg-[#178AC3] transition-colors">
                  Rate job
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GrillaTrabajos;
