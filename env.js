const dev = {
  urlBaseService: '/',
  linkDivaMonitoring: 'https://vod-dev.rtbf.be/diva-monitoring/#/',
 
  urlvodwonstatusservice: 'https://vod-dev.rtbf.be/vod-dashboard-ws/service/'
}
const test = {
  urlBaseService: '/',
  linkDivaMonitoring: 'https://vod-test.rtbf.be/diva-monitoring/#/',
 
}
const prod = {
  urlBaseService: '/',
  linkDivaMonitoring: 'https://vod.rtbf.be/diva-monitoring/#/'
}

class EnvironmentVariables {
  constructor() {
    const { origin } = window.location
    if (/localhost|127.0.0.1|.*-dev.*/.test(origin)) {
      this.env = dev
    }
    else if (/.*-(jas2|test).*/.test(origin)) {
      this.env = test
    }
    else {
      this.env = prod
    }
  } 
  get() {
    return this.env
  }
}
const instance = new EnvironmentVariables();
Object.freeze(instance);
export default instance