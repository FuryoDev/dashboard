export type RuntimeEnvironment = "dev" | "test" | "prod";

export interface EnvironmentConfig {
    urlBaseService: string;
    urlVodWonStatusService: string;
    apiOrigin: string;
    divaMonitoringServiceContext: string;
}

const configs: Record<RuntimeEnvironment, EnvironmentConfig> = {
    dev: {
        urlBaseService: "/",
        urlVodWonStatusService: "https://vod-dev.rtbf.be/vod-dashboard-ws/service/",
        apiOrigin: "https://vod-dev.rtbf.be",
        divaMonitoringServiceContext: "/restore/service/",
    },
    test: {
        urlBaseService: "/",
        urlVodWonStatusService: "https://vod-test.rtbf.be/vod-dashboard-ws/service/",
        apiOrigin: "https://vod-test.rtbf.be",
        divaMonitoringServiceContext: "/restore/service/",
    },
    prod: {
        urlBaseService: "/",
        urlVodWonStatusService: "https://vod.rtbf.be/vod-dashboard-ws/service/",
        apiOrigin: "https://vod.rtbf.be",
        divaMonitoringServiceContext: "/restore/service/",
    },
};

function detectEnvironment(origin: string): RuntimeEnvironment {
    if (/localhost|127.0.0.1|.*-dev.*/.test(origin)) return "dev";
    if (/.*-(jas2|test).*/.test(origin)) return "test";
    return "prod";
}

function readNumber(value: string | undefined, fallback: number): number {
    if (!value) return fallback;
    const parsed = Number(value);
    return Number.isNaN(parsed) ? fallback : parsed;
}

const runtime = detectEnvironment(window.location.origin);
const runtimeConfig = configs[runtime];

const serviceHost = (import.meta.env.VITE_SERVICE_HOST as string | undefined) ?? window.location.hostname;
const servicePort = (import.meta.env.VITE_SERVICE_PORT as string | undefined) ?? window.location.port;

export const env = {
    runtime,
    ...runtimeConfig,
    appPort: readNumber(import.meta.env.VITE_APP_PORT as string | undefined, 8080),
    apiBaseUrl: (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? runtimeConfig.urlBaseService,
    apiProxyTarget: (import.meta.env.VITE_API_PROXY_TARGET as string | undefined) ?? runtimeConfig.apiOrigin,
    wsPath: (import.meta.env.VITE_WS_PATH as string | undefined) ?? "/notification/ws",
    serviceHost,
    servicePort,
    apiKey: (import.meta.env.VITE_APIKEY as string | undefined) ?? "",
    divaMonitoringServiceContext:
        (import.meta.env.VITE_DIVA_MONITORING_SERVICE_CONTEXT as string | undefined) ?? runtimeConfig.divaMonitoringServiceContext,
} as const;

export const exportedConfiguration = Object.freeze({
    runtime: env.runtime,
    appPort: env.appPort,
    apiBaseUrl: env.apiBaseUrl,
    apiProxyTarget: env.apiProxyTarget,
    wsPath: env.wsPath,
    urlBaseService: env.urlBaseService,
    urlVodWonStatusService: env.urlVodWonStatusService,
    serviceHost: env.serviceHost,
    servicePort: env.servicePort,
    hasApiKey: Boolean(env.apiKey),
    divaMonitoringServiceContext: env.divaMonitoringServiceContext,
});

export function buildWsUrl(): string {
    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const portPart = env.servicePort ? `:${env.servicePort}` : "";
    return `${protocol}://${env.serviceHost}${portPart}${env.wsPath}`;
}

export function assertEnvVariables() {
    if (!env.apiBaseUrl) {
        throw new Error("Missing VITE_API_BASE_URL environment variable");
    }
    if (!env.apiProxyTarget) {
        throw new Error("Missing VITE_API_PROXY_TARGET environment variable");
    }
}
