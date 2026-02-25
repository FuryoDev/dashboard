import { defineStore } from "pinia";
import type { GeneratedXml } from "@/types/domain";

export const useXmlStore = defineStore("xml", {
  state: () => ({
    generatedXml: { data: "", success: false } as GeneratedXml,
  }),

  getters: {
    value: (s) => s.generatedXml,
  },

  actions: {
    setGeneratedXml(xml: string) {
      this.generatedXml.data = xml;
      this.generatedXml.success = true;
    },
    setGeneratedXmlInitial() {
      this.generatedXml.data = "";
      this.generatedXml.success = false;
    },
  },
});
