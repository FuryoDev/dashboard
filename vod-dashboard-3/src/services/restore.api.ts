import type { AxiosInstance } from "axios";

export function createRestoreApi(http: AxiosInstance) {
  return {
    async regenerateSegment(payload: unknown) {
      const response = await http.put("restore/service/segment", payload);
      return response.data;
    },
    async regenerateTranscoding(payload: unknown) {
      const response = await http.put("restore/service/transcoding", payload);
      return response.data;
    },
    async regeneratePublication(payload: unknown) {
      const response = await http.put("restore/service/publication", payload);
      return response.data;
    },
    async regenerateSubtitling(payload: unknown) {
      const response = await http.put("restore/service/subtitling", payload);
      return response.data;
    },
  };
}
