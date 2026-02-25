import type { AxiosInstance } from "axios";

export function createPlaylistApi(http: AxiosInstance) {
  return {
    async listByDiffusion(channel: string, isoDate: string) {
      const response = await http.get(`sgt-listener/service/playlist/diffusion/${channel}/${isoDate}`);
      return response.data as Record<string, unknown>[];
    },
    async listPlannedProducts(date: string, channels: string) {
      const response = await http.get(`lava/plannedproductsbydate/${date}?channels=${channels}`);
      return response.data;
    },
  };
}
