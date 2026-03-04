import type {AxiosInstance} from "axios";
import type {DivaJob} from "@/types/diva-monitoring";
import {env} from "@/config/env";

export async function fetchDivaJobsByDay(http: AxiosInstance, date: string): Promise<DivaJob[]> {
    const {data} = await http.get<DivaJob[]>(`${env.divaMonitoringServiceContext}jobsday/Diva`, {
        params: {date},
    });

    return data;
}
