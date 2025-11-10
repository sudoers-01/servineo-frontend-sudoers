
import axios from 'axios';

export interface Appointment {
    _id: string;
    id_fixer: string;
    id_requester: string;
    current_requester_name: string;
    appointment_type: string;
    appointment_description: string;
    link_id: string;
    current_requester_phone: string;
    display_name_location: string;
    latitude: string;
    longitude: string;
}

interface ApiResponse {
    message: string;
    data: Appointment[];
}

export async function getSixMonthAppointments(fixerId: string, requesterId: string, date: string, hour: number): Promise<Appointment[]> {
    try {

        const response = await axios.get<ApiResponse>(
            'https://servineo-backend-lorem.onrender.com/api/crud_read/appointments/get_modal_form?fixer_id=68e87a9cdae3b73d8040102f&requester_id=68ec99ddf39c7c140f42fcfa&appointment_date=2025-11-16T00:00:00.000Z&start_hour=9',
            {
                params: {
                    fixer_id: fixerId,
                    requester_id: requesterId,
                    date: date,
                    hour: hour
                }
            }
        );


        if (response.data.message && response.data.data) {
            return response.data.data;
        } else {
            console.log('No se encontraron citas ');
            return [];
        }
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('Error de Axios:', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data
            });
        } else {
            console.error('Error desconocido:', error);
        }
        return [];
    }
}
