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
  const [errors, setErrors] = useState<string | null>(null);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${BASE_URL}/profile/68e87a9cdae3b73d8040102f`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (response.ok) {
          const result = await response.json();
          setData(result);
        } else {
          switch (response.status) {
            case 400:
              setErrors('Falta el ID del usuario');
              break;
            case 422:
              setErrors('Formato de ID de usuario inválido');
              break;
            case 404:
              setErrors('Usuario no encontrado');
              break;
            case 500:
              setErrors('Error del servidor');
              break;
            default:
              setErrors('Error desconocido :oo');
          }
        }
      } catch (error) {
        console.error('Crash: Error fetching profile data:', error);
        setErrors('Error desconocido :oo, los desarrolladores ya fueron notificados');
      }
    };
    fetchData();
  }, []);
  return { data, errors };
};
