import { defineStore } from "pinia";
import { useHttp } from "@/composables/useHttp";
import { createEmissionsApi } from "@/services/emissions.api";
import { createNotificationApi, type OptionItem } from "@/services/notification.api";
import { toLavaDate } from "@/utils/date";
import type { Emission } from "@/types/domain";

type FetchParams = {
  date?: Date;
  channels?: string[];
  platforms?: string[];
  statuses?: string[];
  vodType?: string;
};

export const useEmissionsStore = defineStore("emissions", {
  state: () => ({
    items: [] as Emission[],
    selected: [] as Emission[],
    toCheck: [] as Emission[],
    toChangeStatus: [] as Emission[],
    toChangeDelay: [] as Emission[],
    toExport: [] as Emission[],
    channels: [] as OptionItem[],
    platforms: [] as OptionItem[],
    vodTypes: [] as OptionItem[],
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
    async fetchFilterOptions() {
      this.loading = true;
      this.error = null;
      try {
        const api = createNotificationApi(useHttp());
        const [channels, platforms, vodTypes] = await Promise.all([
          api.listChannels(),
          api.listPlatforms(),
          api.listVodTypes(),
        ]);
        this.channels = channels;
        this.platforms = platforms;
        this.vodTypes = vodTypes;
      } catch (e: unknown) {
        this.error = e instanceof Error ? e.message : "Erreur inconnue";
      } finally {
        this.loading = false;
      }
    },
    async fetchAll(params?: FetchParams) {
      this.loading = true;
      this.error = null;
      try {
        const api = createEmissionsApi(useHttp());
        const selectedDate = params?.date ?? new Date();
        const channels = params?.channels?.join(",") ?? "";
        let data = await api.listPlannedProducts(toLavaDate(selectedDate), channels);
        data = (data ?? []).filter((item) => !String(item.action ?? "").match(/Deleted/i));

        if (params?.vodType) {
          data = data.filter((item) => String(item.vodType ?? "") === params.vodType);
        }

        if (params?.platforms?.length) {
          data = data.filter((item) => {
            const firstPlatform = String(item.plateformOffers?.[0]?.name ?? "");
            return params.platforms?.includes(firstPlatform);
          });
        }

        if (params?.statuses?.length) {
          data = data.filter((item) => {
            const cases = [
              item.recordStatusTraitementItem?.useCase,
              item.recordStatusTranscodageItem?.useCase,
              item.recordStatusPublicationItem?.useCase,
            ].filter(Boolean) as string[];
            return cases.some((status) => params.statuses?.includes(status));
          });
        }

        this.items = data;
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
