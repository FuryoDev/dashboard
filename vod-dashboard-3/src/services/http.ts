import axios, { type AxiosInstance } from "axios";
import { env } from "@/config/env";

export function createHttpClient(): AxiosInstance {
  const http = axios.create({
    baseURL: env.apiBaseUrl,
    timeout: 30_000,
    headers: env.apiKey ? { apikey: env.apiKey } : undefined,
  });

  http.interceptors.response.use(
    (response) => response,
    (error) => Promise.reject(error),
  );

  return http;
}
