import request from './request'

export default {

  getJobByDay(d) {
    return request({
      url: `jobsday/Diva?date=${d}`,
      method: 'get'
    })
  }
}
