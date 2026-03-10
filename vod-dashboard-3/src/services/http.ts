import axios, {type AxiosInstance} from "axios";
import {env} from "@/config/env";

let pendingRequests = 0;
const WAIT_CLASS = "app-wait-cursor";

function applyWaitCursor() {
    if (typeof document === "undefined") return;
    document.body.classList.add(WAIT_CLASS);
}

function clearWaitCursor() {
    if (typeof document === "undefined") return;
    document.body.classList.remove(WAIT_CLASS);
}

function onRequestStart() {
    pendingRequests += 1;
    applyWaitCursor();
}

function onRequestEnd() {
    pendingRequests = Math.max(0, pendingRequests - 1);
    if (pendingRequests === 0) {
        clearWaitCursor();
    }
}

export function createHttpClient(): AxiosInstance {
    const http = axios.create({
        baseURL: env.apiBaseUrl,
        timeout: 30_000,
        headers: env.apiKey ? {apikey: env.apiKey} : undefined,
    });

    http.interceptors.request.use(
        (config) => {
            onRequestStart();
            return config;
        },
        (error) => {
            onRequestEnd();
            return Promise.reject(error);
        },
    );

    http.interceptors.response.use(
        (response) => {
            onRequestEnd();
            return response;
        },
        (error) => {
            onRequestEnd();
            return Promise.reject(error);
        },
    );

    return http;
}