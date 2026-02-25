import {defineStore} from 'pinia';

export const userPlaylistOffersStore = defineStore("playlistOffers", {
    state: () => ({
        items: [] as any [],
        loading: false,
        error: null as string | null
    }),
    actions: {
        async fetchAll() {
            this.loading = false;
            this.error = null;
            try {
                this.items = [];
            } catch (e) {
                if (e instanceof Error) {
                    this.error = e.message;
                } else {
                    this.error = "Erreur inconnue";
                }
            } finally {
                this.loading = false;
            }
        },
    },
});