import { apiUrl } from '@/config/api';
import { useState, useEffect } from 'react';

type Job = {
  _id: string;
  title: string;
  description: string;
  createdAt: string;
  Ubicacion: string;
  UbicacionOriginal: string;
  status: string;
};
export const useRegisterJob = (jobId: string) => {
  const [data, setData] = useState<Job | null>(null);
  useEffect(() => {
    const fetchJobData = async (id: string) => {
      console.log('idd', id);
      try {
        const url = apiUrl(`api/job-info/${id}`);
        console.log('url', url);
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        console.log('data', data);
        setData({ ...data, createdAt: data.createdAt.split('T')[0] });
        return data;
      } catch (err) {
        console.error('Error fetching job data:', err);
      }
    };
    fetchJobData(jobId);
  }, [jobId]);

  return { data };
};
