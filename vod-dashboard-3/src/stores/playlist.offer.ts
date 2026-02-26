import { defineStore } from "pinia";
import { useHttp } from "@/composables/useHttp";
import { createPlaylistApi } from "@/services/playlist.api";
import { createNotificationApi, type OptionItem } from "@/services/notification.api";
import type { PlaylistItem, SearchCriteria } from "@/types/domain";
import { createPlaylistItem } from "@/utils/playlist";
import { formatIsoDateForPlaylist, toLavaDate } from "@/utils/date";

function toDetailedError(error: unknown, context: string): string {
  const message = error instanceof Error ? error.message : String(error);
  return `Erreur dans ${context}: ${message}`;
}

export const usePlaylistOffersStore = defineStore("playlistOffers", {
  state: () => ({
    listPige: [] as PlaylistItem[],
    searchCriteria: {
      date: "",
      chaine: "LAUNE",
      data: [],
    } as SearchCriteria,
    channels: [] as OptionItem[],
    productsToGenerate: [] as unknown[],
    elementsToAssign: [] as unknown[],
    loading: false,
    error: null as string | null,
  }),

  actions: {
    setSearchCriteria(criteria: SearchCriteria) {
      this.searchCriteria = criteria;
    },
    setListPige(items: PlaylistItem[]) {
      this.listPige = items;
      this.searchCriteria.data = items;
    },
    setElementsToAssign(items: unknown[]) {
      this.elementsToAssign = items;
    },
    setProductsToGenerate(items: unknown[]) {
      this.productsToGenerate = items;
    },
    async fetchChannels() {
      this.loading = true;
      this.error = null;
      try {
        this.channels = await createNotificationApi(useHttp("playlist.fetchChannels")).listChannels();
      } catch (e: unknown) {
        this.error = toDetailedError(e, "Vod Manuel > Chargement chaines (notification/service/chaines)");
      } finally {
        this.loading = false;
      }
    },
    async fetchPlaylistByDate(channel: string, date: Date) {
      this.loading = true;
      this.error = null;
      try {
        const raw = await createPlaylistApi(useHttp("playlist.fetchPlaylistByDate")).listByDiffusion(
          channel,
          formatIsoDateForPlaylist(date),
        );
        const mapped = raw.map((item) => createPlaylistItem(item));
        this.setSearchCriteria({ date, chaine: channel, data: mapped });
        this.listPige = mapped;
      } catch (e: unknown) {
        this.error = toDetailedError(
          e,
          "Vod Manuel > Chargement playlist (sgt-listener/service/playlist/diffusion)",
        );
      } finally {
        this.loading = false;
      }
    },
    async fetchPlannedProducts(channels: string, date: Date) {
      this.loading = true;
      this.error = null;
      try {
        const lavaDate = toLavaDate(date);
        this.productsToGenerate = await createPlaylistApi(useHttp("playlist.fetchPlannedProducts")).listPlannedProducts(
          lavaDate,
          channels,
        );
      } catch (e: unknown) {
        this.error = toDetailedError(e, "Vod Manuel > Chargement planned products (lava/plannedproductsbydate)");
      } finally {
        this.loading = false;
      }
    },
  },
});
