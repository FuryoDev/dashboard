import { defineStore } from "pinia";

export interface SocketState {
  isConnected: boolean;
  message: unknown;
  reconnectError: boolean;
}

export const useAppStore = defineStore("app", {
  state: () => ({
    jourVod: null as string | null,
    jobs: [] as unknown[],
    socket: {
      isConnected: false,
      message: "",
      reconnectError: false,
    } as SocketState,
  }),

  actions: {
    setJourVod(date: string | null) {
      this.jourVod = date;
    },
    setJobs(jobs: unknown[]) {
      this.jobs = jobs;
    },
    setSocketMessage(message: unknown) {
      this.socket.message = message;
    },
    setSocketConnected(connected: boolean) {
      this.socket.isConnected = connected;
    },
    setSocketReconnectError(value: boolean) {
      this.socket.reconnectError = value;
    },
  },
});
