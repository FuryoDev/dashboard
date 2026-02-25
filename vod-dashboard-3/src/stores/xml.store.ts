import { defineStore } from "pinia";

export interface GeneratedXml {
    data: string;
    success: boolean;
}

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
        resetGeneratedXml() {
            this.generatedXml.data = "";
            this.generatedXml.success = false;
        },
    },
});