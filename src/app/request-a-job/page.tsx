'use client';
import React, { useState, useEffect } from 'react';
import JobSummaryModal from './job-summary-modal';

interface JobApplication {
  name: string;
  description: string;
  date: string;
}

interface Location {
  lat: number;
  lon: number;
}

function ServineoHeader() {
  return (
    <header className='w-full bg-white border-b shadow-sm py-4 px-6 flex justify-center'>
      <h1 className='text-3xl font-semibold text-gray-700'>Servineo</h1>
    </header>
  );
}

export default function RequestJobPage() {
  const [formData, setFormData] = useState<JobApplication>({
    name: '',
    description: '',
    date: '',
  });

  const [showModal, setShowModal] = useState(false);
  const [location, setLocation] = useState<Location | null>(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        });
      },
      (err) => console.warn('Location not allowed:', err),
    );
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowModal(true);
  };

  const handleConfirm = () => {
    if (!location) {
      alert('Location not available');
      return;
    }

    console.log('Job submitted:', { ...formData, location });
    alert('Job request sent successfully!');
    setShowModal(false);
    setFormData({ name: '', description: '', date: '' });
  };

  return (
    <main className='min-h-screen flex flex-col bg-gray-100'>
      <ServineoHeader />

      <section className='flex-1 flex flex-col items-center justify-center bg-gray-50 p-8'>
        <div className='w-full max-w-3xl bg-white shadow-md rounded-2xl p-10 border border-gray-200'>
          <h2 className='text-center text-gray-600 font-medium mb-10 text-lg'>
            Job Request Details
          </h2>

          <form onSubmit={handleSubmit} className='flex flex-col gap-6'>
            <div>
              <label className='block text-gray-700 font-medium mb-1'>Job Name:</label>
              <input
                type='text'
                name='name'
                placeholder='e.g., Gas pipe leak'
                value={formData.name}
                onChange={handleChange}
                required
                className='w-full border rounded-lg px-4 py-2 text-gray-700 focus:ring-2 focus:ring-blue-400 outline-none'
              />
            </div>

            <div>
              <label className='block text-gray-700 font-medium mb-1'>Description:</label>
              <textarea
                name='description'
                placeholder='Describe your need...'
                value={formData.description}
                onChange={handleChange}
                required
                rows={4}
                className='w-full border rounded-lg px-4 py-2 text-gray-700 resize-none focus:ring-2 focus:ring-blue-400 outline-none'
              />
            </div>

            <div>
              <label className='block text-gray-700 font-medium mb-1'>Preferred Date:</label>
              <input
                type='date'
                name='date'
                value={formData.date}
                onChange={handleChange}
                required
                className='w-full border rounded-lg px-4 py-2 text-gray-700 focus:ring-2 focus:ring-blue-400 outline-none'
              />
            </div>

            <div className='flex justify-end mt-8'>
              <button
                type='submit'
                className='bg-blue-600 text-white font-medium px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors'
              >
                Submit Request
              </button>
            </div>
          </form>
        </div>
      </section>

      {showModal && location && (
        <JobSummaryModal
          formData={formData}
          location={location}
          setLocation={setLocation}
          onClose={() => setShowModal(false)}
          onConfirm={handleConfirm}
        />
      )}
    </main>
  );
}
