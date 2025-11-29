'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Job } from '@/types/job';
import RequestedJob from './RequestedJob';
import RegisterJobModal from './RegisterJobModal';
import { useState } from 'react';
export default function JobsList({ jobs }: { jobs: Job[] }) {
  const router = useRouter();
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState<boolean>(false);
  const [idJob, setIdJob] = useState<string>('');

  if (!jobs || jobs.length === 0) {
    return (
      <div className='rounded-xl border border-dashed border-gray-300 p-8 text-center text-gray-500'>
        No appointments yet.
      </div>
    );
  }
  return (
    <div className='space-y-3'>
      <RegisterJobModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        id={idJob}
      />

      {jobs.map((job) => (
        <RequestedJob
          key={job._id}
          name={job.requesterId || 'Requester'}
          jobTitle={job.title}
          schedule={formatSchedule(job.createdAt)}
          state={job.status}
          onAppointmentDetails={() => router.push(`/requested-jobs/${job._id}`)}
          onRegisterJob={() => {
            setIsRegisterModalOpen(true);
            setIdJob(job._id);
          }}
          onViewPromos={() => {
            router.push(`/promotions/${job._id}`);
          }}
        />
      ))}
    </div>
  );
}

function formatSchedule(createdAt: string) {
  const d = new Date(createdAt);
  if (Number.isNaN(d.getTime())) return '';
  const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return `${d.toLocaleDateString()} ${time}`;
}
