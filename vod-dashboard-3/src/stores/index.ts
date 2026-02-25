import { createPinia } from "pinia";

export const pinia = createPinia();

export * from "@/stores/app.store";
export * from "@/stores/emissions.store";
export * from "@/stores/offers.store";
export * from "@/stores/playlist.offer";
export * from "@/stores/user.store";
export * from "@/stores/xml.store";
