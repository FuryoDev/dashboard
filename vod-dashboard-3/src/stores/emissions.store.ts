import {defineStore} from "pinia";
import {useHttp} from "@/composables/useHttp";
import {createEmissionsApi} from "@/services/emissions.api";

export type Emission = {
    id?: string | number;
    status?: string;
   [k: string]: unknown;
}

export const useEmissionsStore = defineStore("emissions", {
    state: () => ({
        items: [] as Emission[],
        loading: false,
        error: null as string | null
    }),

    getters: {
        ltoCheck: (s) => s.items.filter((e) => e.status === "TO_CHECK"),
        toExport: (s) => s.items.filter((e) => e.status === "TO_EXPORT"),
        toChangeStatus: (s) => s.items.filter((e) => e.status === "TO_CHANGE_STATUS"),
        toChangeDelay: (s) => s.items.filter((e) => e.status === "TO_CHANGE_DELAY"),
    },

    actions: {
        async fetchAll() {
            this.loading = true;
            this.error = null;

            try {
                const http = useHttp();
                const api = createEmissionsApi(http);

                this.items = await api.list();
            } catch (e: unknown) {
                this.error = e instanceof Error ? e.message : "Erreur inconnue";
            } finally {
                this.loading = false;
            }
        },
    }
});