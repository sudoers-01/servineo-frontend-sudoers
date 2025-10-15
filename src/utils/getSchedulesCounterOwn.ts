export async function getSchedulesCounterOwn(fixer_id: string, requester_id: string, searched_date: string) {
    try {
        const response = await fetch(
            `https://servineo-backend-lorem.onrender.com/api/crud_read/schedules/get_by_fixer_current_requester_day?fixer_id=${fixer_id}&requester_id=${requester_id}&searched_date=${searched_date}`
        );
        if (!response.ok) {
            return 0;
        }


        const data = await response.json();
        const schedulesCount = data[0]?.schedules?.length || 0;
        return schedulesCount;
    } catch (error) {
        return 0;
    }
}
