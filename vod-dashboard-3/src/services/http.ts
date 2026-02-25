import axios, { type AxiosInstance } from "axios";
import { env } from "@/config/env";

export function createHttpClient(): AxiosInstance {
    const http = axios.create({
        baseURL: env.apiBaseUrl,
        timeout: 30_000,
    });

    http.interceptors.request.use((config) => {
        return config;
    });

    http.interceptors.response.use(
        (res) => res,
        (err) => {
            // plus tard: gestion globale (401, toast, retry...)
            return Promise.reject(err);
        }
    );
    return http;
}