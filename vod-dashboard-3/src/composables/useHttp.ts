import { inject } from "vue";
import type { AxiosInstance } from "axios";

export function useHttp() {
  const http = inject<AxiosInstance>("http");
  if (!http) {
    throw new Error("Http client not provided");
  }
  return http;
}
