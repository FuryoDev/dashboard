const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  publicPath: process.env.K8S_INGRESS_HTTP_PATH || '/',
  transpileDependencies: true,
  devServer: {
    proxy: {
      "/restore/*": {
        target: "https://vod-dev.rtbf.be",
        changeOrigin: true,
        secure: false,
        logLevel: 'debug',
        headers: { apikey: process.env.VUE_APP_APIKEY }
      }
    }
  }
})
