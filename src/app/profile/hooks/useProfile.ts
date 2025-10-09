import { useState, useEffect } from 'react';
type ProfileData = {
  name: string;
  photo_url: string;
  role: string;
  ratings: {
    1: number;
    2: number;
    3: number;
  };
  average_rating: number;
  rating_count: number;
};
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
export const useProfile = () => {
  const [data, setData] = useState<ProfileData | null>(null);
  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(`${BASE_URL}/profile`, {
        //BASE_URL is http://localhost:3000/api in .env.local
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const result = await response.json();
      setData(result);
    };
    fetchData();
  }, []);
  return { data };
};
