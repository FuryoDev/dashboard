import { defineStore } from "pinia";

export interface OfferState {
  offers: unknown[];
  segments: unknown[];
  sousTitres: unknown[];
  offersCheck: unknown[];
  offersExport: Record<string, unknown>;
  offersToCheck: unknown[];
  offersToExport: unknown[];
}

export const useOffersStore = defineStore("offers", {
  state: (): OfferState => ({
    offers: [],
    segments: [],
    sousTitres: [],
    offersCheck: [],
    offersExport: {},
    offersToCheck: [],
    offersToExport: [],
  }),

  actions: {
    setOffers(offers: unknown[]) {
      this.offers = offers;
    },
    setSegments(segments: unknown[]) {
      this.segments = segments;
    },
    setSousTitres(items: unknown[]) {
      this.sousTitres = items;
    },
    setOffersCheck(items: unknown[]) {
      this.offersCheck = items;
    },
    setOffersExport(items: Record<string, unknown>) {
      this.offersExport = items;
    },
    setOffersToCheck(items: unknown[]) {
      this.offersToCheck = items;
    },
    setOffersToExport(items: unknown[]) {
      this.offersToExport = items;
    },
  },
});
