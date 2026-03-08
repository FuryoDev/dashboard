import axios from 'axios'

const urlws = process.env.VUE_APP_SERVICE_CONTEXT;

const apiHeader = { 'Content-type': 'application/json' };
const service = axios.create({
  baseURL: urlws, headers: { ...apiHeader }
})

service.interceptors.request.use(config => config, error => {
  Promise.reject(error)
})

service.interceptors.response.use(
  response => response,
  error => Promise.reject(error)
)

export default service