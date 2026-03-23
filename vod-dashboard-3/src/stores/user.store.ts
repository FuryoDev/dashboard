import {defineStore} from "pinia";
import type {AuthState, User} from "@/types/auth";

export const useUserStore = defineStore("user", {
    state: (): AuthState => ({
        user: null,
        token: null,
    }),

    getters: {
        isAuthenticated: (s) => Boolean(s.token),
        groups: (s) => s.user?.groups ?? [],
        hasFastTvGroup: (s) => (s.user?.groups ?? []).includes("GR_vodoo_fasttv"),
        hasVodUsersGroup: (s) => (s.user?.groups ?? []).includes("GR_vodoo_users"),
        isAdmin: (s) =>
            (s.user?.groups ?? []).includes("GR_vodoo_admin") ||
            (s.user?.groups ?? []).includes("vodoo_api"),
        canSelectVodType(): boolean {
            return this.isAdmin || (this.hasFastTvGroup && this.hasVodUsersGroup);
        },
    },

    actions: {
        setUser(user: User | null) {
            this.user = user;
        },
        setToken(token: string | null) {
            this.token = token;
        },
        logout() {
            this.user = null;
            this.token = null;
        },
    },
});
