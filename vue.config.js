module.exports = {
  publicPath: process.env.K8S_INGRESS_HTTP_PATH || "",
  devServer: {
    proxy: {
      "^/": {
        target: "https://vod-dev.rtbf.be",
        changeOrigin: true,
        secure: false,
        logLevel: "debug",
        headers: {
          apikey: process.env.VUE_APP_APIKEY,
        },
      },
    },
  },
};
