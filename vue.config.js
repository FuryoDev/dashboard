module.exports= {
  publicPath: process.env.K8S_INGRESS_HTTP_PATH || '',
  devServer: {
      proxy: {
        "/*": {
          target: "https://vod-dev.rtbf.be/",
          headers: { apikey: process.env.VUE_APP_APIKEY },
          secure: false,
          logLevel: 'debug',
        }
      }
    }    
}
