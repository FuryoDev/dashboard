import { createApp } from "vue";
import App from "@/App.vue";
import router from "@/router";
import { pinia } from "@/stores";
import { assertEnvVariables, buildWsUrl } from "@/config/env";
import { createHttpClient } from "@/services/http";
import { setProvidedHttpClient } from "@/composables/useHttp";

import "@/assets/css/main.scss";

assertEnvVariables();

const app = createApp(App);

app.use(pinia);
app.use(router);

const httpClient = createHttpClient();
setProvidedHttpClient(httpClient);
app.provide("http", httpClient);
app.provide("wsUrl", buildWsUrl());

app.mount("#app");
