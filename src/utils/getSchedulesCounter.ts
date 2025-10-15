
// /utils/getSchedulesCounter.ts
export async function getSchedulesCounter(fixer_id: string, requester_id: string, searched_date: string) {
    let res1 = 0;
    let res2 = 0;
    try {
        const response = await fetch(
            `https://servineo-backend-lorem.onrender.com/api/crud_read/schedules/get_by_fixer_other_requesters_day?fixer_id=${fixer_id}&requester_id=${requester_id}&searched_date=${searched_date}`
        );

        const response2 = await fetch(
            `https://servineo-backend-lorem.onrender.com/api/crud_read/schedules/get_by_fixer_current_requester_day?fixer_id=${fixer_id}&requester_id=${requester_id}&searched_date=${searched_date}`
        );
        if (!response.ok) {
            res1 = 0;
        }
        if (!response2.ok) {
            res2 = 0;
        }


        const data = await response.json();
        const data2 = await response2.json();
        const totalSchedules = data.reduce((acc: number, current: any) => {
            if (Array.isArray(current.schedules)) {
                return acc + current.schedules.length;
            }
            return acc;
        }, 0);



        const schedulesCount = data[0]?.schedules?.length || 0;
        res1 = totalSchedules;
        res2 = schedulesCount;
        const total = res1 + res2;
        return total;
    } catch (error) {
        return 0;
    }
}
