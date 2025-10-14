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
export const useProfile = (userId: string | undefined) => {
  const [data, setData] = useState<ProfileData | null>(null);
  const [errors, setErrors] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setErrors('There is no user ID provided');
      return;
    }

    const fetchData = async () => {
      try {
        const response = await fetch(`${BASE_URL}/profile/${userId}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        if (response.ok) {
          const result = await response.json();
          setData(result);
        } else {
          switch (response.status) {
            case 400:
              setErrors('Invalid ID');
              break;
            case 422:
              setErrors('Invalid ID format');
              break;
            case 404:
              setErrors('User not found');
              break;
            case 500:
              setErrors('Server error');
              break;
            default:
              setErrors('Unknown error');
          }
        }
      } catch (error) {
        console.error('Crash: Error fetching profile data:', error);
        setErrors('Unknown error');
      }
    };

    fetchData();
  }, [userId]);

  return { data, errors };
};
