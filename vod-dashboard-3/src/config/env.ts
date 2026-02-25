export const env = {
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL as string,
    wsUrl: import .meta.env.VITE_WS_URL as string | undefined
} as const;

export function assertEnvVariables() {
    if(!env.apiBaseUrl)  throw new Error("Missing VITE_API_BASE_URL environment variable");
}