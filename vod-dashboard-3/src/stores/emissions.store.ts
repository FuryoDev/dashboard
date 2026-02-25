import { defineStore } from "pinia";
import { useHttp } from "@/composables/useHttp";
import { createEmissionsApi } from "@/services/emissions.api";
import type { Emission } from "@/types/domain";

export const useEmissionsStore = defineStore("emissions", {
  state: () => ({
    items: [] as Emission[],
    selected: [] as Emission[],
    toCheck: [] as Emission[],
    toChangeStatus: [] as Emission[],
    toChangeDelay: [] as Emission[],
    toExport: [] as Emission[],
    loading: false,
    error: null as string | null,
  }),

  getters: {
    count: (s) => s.items.length,
  },

  actions: {
    setEmissions(items: Emission[]) {
      this.items = items;
    },
    setSelected(selected: Emission[]) {
      this.selected = selected;
    },
    setToCheck(items: Emission[]) {
      this.toCheck = items;
    },
    setToChangeStatus(items: Emission[]) {
      this.toChangeStatus = items;
    },
    setToChangeDelay(items: Emission[]) {
      this.toChangeDelay = items;
    },
    setToExport(items: Emission[]) {
      this.toExport = items;
    },
    async fetchAll(params?: { date?: string; channel?: string }) {
      this.loading = true;
      this.error = null;
      try {
        const api = createEmissionsApi(useHttp());
        this.items = await api.list(params);
      } catch (e: unknown) {
        this.error = e instanceof Error ? e.message : "Erreur inconnue";
      } finally {
        this.loading = false;
      }
    },
    async bulkUpdateStatus(clean = false) {
      this.loading = true;
      this.error = null;
      try {
        const api = createEmissionsApi(useHttp());
        await Promise.all(
          this.toChangeStatus.map((emission) =>
            api.updateStatus(String(emission.vodType ?? ""), String(emission.idRecord ?? ""), clean),
          ),
        );
      } catch (e: unknown) {
        this.error = e instanceof Error ? e.message : "Erreur inconnue";
      } finally {
        this.loading = false;
      }
    },
  },
});
