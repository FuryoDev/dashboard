export type RuntimeEnvironment = "dev" | "test" | "prod";

type EnvironmentConfig = {
  urlBaseService: string;
  urlVodWonStatusService: string;
  linkDivaMonitoring: string;
};

const configs: Record<RuntimeEnvironment, EnvironmentConfig> = {
  dev: {
    urlBaseService: "/",
    urlVodWonStatusService: "https://vod-dev.rtbf.be/vod-dashboard-ws/service/",
    linkDivaMonitoring: "https://vod-dev.rtbf.be/diva-monitoring/#/",
  },
  test: {
    urlBaseService: "/",
    urlVodWonStatusService: "https://vod-test.rtbf.be/vod-dashboard-ws/service/",
    linkDivaMonitoring: "https://vod-test.rtbf.be/diva-monitoring/#/",
  },
  prod: {
    urlBaseService: "/",
    urlVodWonStatusService: "https://vod.rtbf.be/vod-dashboard-ws/service/",
    linkDivaMonitoring: "https://vod.rtbf.be/diva-monitoring/#/",
  },
};

function detectEnvironment(origin: string): RuntimeEnvironment {
  if (/localhost|127.0.0.1|.*-dev.*/.test(origin)) return "dev";
  if (/.*-(jas2|test).*/.test(origin)) return "test";
  return "prod";
}

const runtimeEnv = detectEnvironment(window.location.origin);

export const env = {
  runtime: runtimeEnv,
  ...configs[runtimeEnv],
  apiBaseUrl: (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? configs[runtimeEnv].urlBaseService,
  wsPath: (import.meta.env.VITE_WS_PATH as string | undefined) ?? "/notification/ws",
  serviceHost: (import.meta.env.VITE_SERVICE_HOST as string | undefined) ?? window.location.hostname,
  servicePort: (import.meta.env.VITE_SERVICE_PORT as string | undefined) ?? window.location.port,
  apiKey: import.meta.env.VITE_APIKEY as string | undefined,
} as const;

export function buildWsUrl(): string {
  const protocol = window.location.protocol === "https:" ? "wss" : "ws";
  const portPart = env.servicePort ? `:${env.servicePort}` : "";
  return `${protocol}://${env.serviceHost}${portPart}${env.wsPath}`;
}

export function assertEnvVariables() {
  if (!env.apiBaseUrl) {
    throw new Error("Missing VITE_API_BASE_URL environment variable");
  }
}
