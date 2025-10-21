import axios from 'axios';
export async function getSchedulesCont(fixer_id: string, searched_date: string) {
    try {
        const response = await axios.get(
            'https://servineo-backend-lorem.onrender.com/api/crud_read/schedules/get_by_fixer_current_requester_day',
            {
                params: {
                    fixer_id,
                    searched_date,
                },
            }
        );
        const data = response.data;
        const schedulesCont = data.accessed_appointments?.length || 0;


        return schedulesCont;
    } catch (error) {
        return 0;
    }
}
