import {defineStore} from "pinia";

export const userOffersStore = defineStore("offers", {
    state: () => ({
        items: [] as any [],
        loading: false,
        error: null as string | null
    }),
    actions: {
        async fetchAll() {
            this.loading = true;
            this.error = null;
            try {
                this.items = [];
                ;
            } catch (e) {
                if (e instanceof Error) {
                    this.error = e.message;
                } else {
                    this.error = "Erreur inconnue";
                }
            } finally {
                this.loading = true;
            }
        }
    },
});
