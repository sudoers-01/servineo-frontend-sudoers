'use client';

import React from 'react';
import { Job } from '@/types/job';
import RequestedJob from './RequestedJob';

export default function JobsList({ jobs }: { jobs: Job[] }) {
  if (!jobs || jobs.length === 0) {
    return (
      <div className='rounded-xl border border-dashed border-gray-300 p-8 text-center text-gray-500'>
        No appointments yet.
      </div>
    );
  }

  return (
    <div className='space-y-3'>
      {jobs.map((job) => (
        <RequestedJob
          key={job._id}
          name={job.requesterId || 'Requester'}
          jobTitle={job.title}
          schedule={formatSchedule(job.createdAt)}
          state={job.status}
          onAppointmentDetails={() => console.log('appointment details', job)}
          onRegisterJob={() => console.log('register job', job)}
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
