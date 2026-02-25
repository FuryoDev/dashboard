import type { AxiosInstance } from "axios";
import type { Emission } from "@/types/domain";

export function createEmissionsApi(http: AxiosInstance) {
  return {
    async list(params?: { date?: string; channel?: string }) {
      const response = await http.get<Emission[]>("lava/records", { params });
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
  };
}
