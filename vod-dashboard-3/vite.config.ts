import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";

const API_PATHS = [
  "/notification",
  "/sgt-listener",
  "/lava",
  "/restore",
  "/vod-ws",
  "/vodwonstatus",
  "/media",
  "/diva-monitoring",
];

export default defineConfig(({ mode }) => {
  const loaded = loadEnv(mode, process.cwd(), "");

  const appPort = Number(loaded.VITE_APP_PORT || 8080);
  const apiProxyTarget = loaded.VITE_API_PROXY_TARGET || "https://vod-dev.rtbf.be";
  const apiKey = loaded.VITE_APIKEY || "";
  const ingressPath = loaded.VITE_INGRESS_HTTP_PATH || "/";

  const proxy = Object.fromEntries(
    API_PATHS.map((prefix) => [
      prefix,
      {
        target: apiProxyTarget,
        changeOrigin: true,
        secure: false,
        headers: apiKey ? { apikey: apiKey } : undefined,
      },
    ]),
  );

  return {
    base: ingressPath,
    plugins: [vue()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      host: "0.0.0.0",
      port: appPort,
      strictPort: true,
      proxy,
    },
    preview: {
      host: "0.0.0.0",
      port: appPort,
      strictPort: true,
    },
  };
});
