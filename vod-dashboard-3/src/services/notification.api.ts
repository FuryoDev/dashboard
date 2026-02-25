import type { AxiosInstance } from "axios";

export type ChannelOption = { value: string; text: string };

export function createNotificationApi(http: AxiosInstance) {
  return {
    async listChannels(): Promise<ChannelOption[]> {
      const response = await http.get<Record<string, string>[]>("notification/service/chaines");
      return response.data.map((item) => ({
        value: Object.keys(item)[0] ?? "",
        text: Object.values(item)[0] ?? "",
      }));
    },
  };
}
