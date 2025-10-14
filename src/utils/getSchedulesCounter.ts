
// /utils/getSchedulesCounter.ts
export async function getSchedulesCounter(fixer_id: string, requester_id: string, searched_date: string) {
    try {
        const response = await fetch(
            `https://servineo-backend-lorem.onrender.com/api/crud_read/schedules/get_by_fixer_other_requesters_day?fixer_id=${fixer_id}&requester_id=${requester_id}&searched_date=${searched_date}`
        );

        if (!response.ok) {
            console.log("nononono");
            return 0;
        }

        const data = await response.json();

        const totalSchedules = data.reduce((acc: number, current: any) => {
            if (Array.isArray(current.schedules)) {
                return acc + current.schedules.length;
            }
            return acc;
        }, 0);

        return totalSchedules;
    } catch (error) {
        console.error('Error al obtener schedules:', error);
        return 0;
    }
}
