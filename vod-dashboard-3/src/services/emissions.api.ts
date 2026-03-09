import type {AxiosInstance} from "axios";
import type {Emission} from "@/types/domain";

export function createEmissionsApi(http: AxiosInstance) {
    return {
        async listPlannedProducts(date: string, channels: string) {
            const response = await http.get<Emission[]>(`lava/plannedproductsbydate/${date}?channels=${channels}`);
            return response.data;
        },
        async updateStatus(vodType: string, idRecord: string | number, clean = false) {
            const response = await http.put(
                `lava/recordstatus/update/${vodType}/${idRecord}${clean ? "?clean=true" : ""}`,
            );
            return response.data;
        },
        async exportOffers(jobList: unknown[]) {
            const response = await http.put("lava/plannedproducts", jobList);
            return response.data;
        },
        async requestArchiveExport(destination: string, forceIngest: boolean, jobList: unknown[]) {
            const response = await http.post(`archive/service/restore/${destination}/${forceIngest}`, jobList);
            return response.data as Record<string, { statusCode?: number; message?: string }>;
        },
        async checkPublication(payload: unknown[]) {
            const response = await http.post("distribution/service/checkup", payload);
            return response.data as Record<string, { success?: boolean; message?: string }>;
        },
        async regenerateSubtitles(recordIds: Array<string | number>) {
            const response = await http.post("restore/service/subtitling", recordIds);
            return response.data as Record<string, { statusCode?: number; message?: string }>;
        },
        async updateRecordStatus(vodType: string, idRecord: string | number, payload: unknown, clean = false) {
            const suffix = clean ? "?clean=true" : "";
            const response = await http.post(`lava/recordstatus/update/${vodType}/${idRecord}${suffix}`, payload);
            return response.status;
        },
    };
}
