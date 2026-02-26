import { inject } from "vue";
import type { AxiosInstance } from "axios";

let providedHttpClient: AxiosInstance | null = null;

export function setProvidedHttpClient(client: AxiosInstance) {
  providedHttpClient = client;
}

export function useHttp(context = "unknown") {
  const injected = inject<AxiosInstance | null>("http", null);
  const http = injected ?? providedHttpClient;

  if (!http) {
    throw new Error(
      `[HTTP_CLIENT_MISSING] Aucun client HTTP disponible. Contexte: ${context}. ` +
        'Cause probable: appel déclenché hors setup() / hors composant monté, ou avant app.provide("http", ...).',
    );
  }

  return http;
}
