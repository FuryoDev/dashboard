import type { AxiosInstance } from "axios";

export type OptionItem = { value: string; text: string };

function mapToOptions(data: Record<string, string>[]): OptionItem[] {
  return data.map((item) => ({
    value: Object.keys(item)[0] ?? "",
    text: Object.values(item)[0] ?? "",
  }));
}

export function createNotificationApi(http: AxiosInstance) {
  return {
    async listChannels(): Promise<OptionItem[]> {
      const response = await http.get<Record<string, string>[]>("notification/service/chaines");
      return mapToOptions(response.data);
    },
    async listPlatforms(): Promise<OptionItem[]> {
      const response = await http.get<Record<string, string>[]>("notification/service/plateformes");
      return mapToOptions(response.data);
    },
    async listVodTypes(): Promise<OptionItem[]> {
      const response = await http.get<Record<string, string>[]>("notification/service/vodTypes");
      return mapToOptions(response.data);
    },
  };
}
