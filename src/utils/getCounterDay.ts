
import { getSchedulesCounter } from '@/utils/getSchedulesCounter';
import { getSchedulesCounterOwn } from '@/utils/getSchedulesCounterOwn';
export async function getCounterDay(fixer_id: string, requester_id: string, searched_date: string) {

    const count = await getSchedulesCounter(fixer_id, requester_id, searched_date);
    const countOwn = await getSchedulesCounterOwn(fixer_id, requester_id, searched_date);
    return count + countOwn;
}
