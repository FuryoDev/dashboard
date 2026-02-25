import { createApp } from "vue";
import App from "@/App.vue";
import router from "@/router";
import { pinia } from "@/stores";
import { assertEnvVariables, buildWsUrl } from "@/config/env";
import { createHttpClient } from "@/services/http";

import "@/assets/css/main.scss";

assertEnvVariables();

const app = createApp(App);

app.use(pinia);
app.use(router);

app.provide("http", createHttpClient());
app.provide("wsUrl", buildWsUrl());

app.mount("#app");
