import Vue from 'vue'
import Vuex from 'vuex'
import EnvironmentVariables from '../env';
Vue.use(Vuex)
export default new Vuex.Store({
  state: {
    urlBaseService: EnvironmentVariables.get().urlBaseService,
    urlvodwonstatusservice: EnvironmentVariables.get().urlvodwonstatusservice,
    emissions: [],
    emissionstocheck: [],
    emissionstochangestatus: [],
    emissionstochangedelay: [],
    emissionstoexport: [],
    selectedemissions: [],
  
    offers: [],
    segments:[],
    soustitres:[],
    offersCheck: [],
    OffersToCheck: [],
    ProductToGenerate:[],
    offersExport: [],
    OffersToExport: [],
    jourVod: null,
    jobs: [],
    generatedXml: { data: '', success: false },
    user:{},
    listpige: [],
    searchcriteria :{date:  '', 
      chaine : 'LAUNE',
      data:[]},
    elementsToAssign: [],
    socket:{message:''}

  },
  getters: {
    generatedXml(state) {
      return state.generatedXml
    },
    getSelectedEmissions(state) {
      return state.selectedemissions
    },
    getUrlBaseService(state) {
      return state.urlBaseService
    },
    getUrlVodWonStatusServicee(state) {
      return state.urlvodwonstatusservice
    },
    
    emissions(state) {
      return state.emissions
    },
    listpige(state){
      return state.listpige
    },
    searchcriteria(state){
      return state.searchcriteria
    },
    emissionsToCheck(state) {
      return state.emissionstocheck
    },
    emissionsToChangeStatus(state) {
      return state.emissionstochangestatus
    },
    emissionsToChangeDelay(state) {
      return state.emissionstochangedelay
    },
    emissionsToExport(state) {
      return state.emissionstoexport
    },
    offers(state) {
      return state.offers
    },
    segments(state) {
      return state.segments
    },
    soustitres(state){
      return state.soustitres
    },
    offersCheck(state) {
      return state.offersCheck
    },
    offersExport(state) {
      return state.offersExport
    },
    OffersToExport(state) {
      return state.OffersToExport
    },
    OffersToCheck(state) {
      return state.OffersToCheck
    },
    jourVod(state) {
      return state.jourVod
    },
    jobs(state) {
      return state.jobs
    },
    user(state) {
      return state.user
    },
    elementsToAssign(state){
      return state.elementsToAssign
    },
    getProductToGenerate(state){
      return state.ProductToGenerate
    }
  },
  mutations: {
    setGeneratedXml(state, newxml) {
      state.generatedXml.data = newxml
      state.generatedXml.success = true

    },
    setGeneratedXmlInitial(state) {
      console.log('initialisations')
      state.generatedXml.data = ''
      state.generatedXml.success = false

    },
    setSelectedEmissions(state, neweselect) {

      state.selectedemissions = neweselect

    },
    setEmissions(state, newEmissions) {
      state.emissions = newEmissions
    },
    setListPige(state, newlistpige) {
      state.listpige = newlistpige
    },
    setSearchcriteria(state, newsearchcriteria){
      state.searchcriteria = newsearchcriteria
    },
    setEmissionsToCheck(state, newEmissions) {
      state.emissionstocheck = newEmissions
    },
    setEmissionsToChangeStatus(state, newEmissions) {
      state.emissionstochangestatus = newEmissions
    },
    setEmissionsTochangeDelay(state, newEmissions) {
      state.emissionstochangedelay = newEmissions
    },
    setEmissionsToExport(state, newEmissions) {
      state.emissionstoexport = newEmissions
    },
    setOffers(state, newoffers) {
      state.offers = newoffers
    },
    setSegments(state, newsegments) {
      state.segments = newsegments
    },
    setSousTitres(state,v){
      state.soustitres = v
    },
    setOffersCheck(state, newoffers) {
      state.offersCheck = newoffers
    },
    setOffersExport(state, newoffers) {
      state.offersExport = newoffers
    },
    setOffersToExport(state, newoffers) {
      state.OffersToExport = newoffers
    },
    setOffersToCheck(state, newoffers) {
      state.OffersToCheck = newoffers
    },
    setJourVod(state, date) {
      state.jourVod = date
    },
    setJobs(state, jobs) {
      state.jobs = jobs
    },
    setUser(state, user) {
      state.user = user
    },
    setElementToAssign(state, newelementassign){
      state.elementsToAssign = newelementassign
    },
    setProductToGenerate(state, newelementtogenerate){
       state.ProductToGenerate= newelementtogenerate
    },
    SOCKET_ONOPEN (state, event) {
      //console.log("socket 2");
      Vue.prototype.$socket = event.currentTarget;
      state.socket.isConnected = true
    },
    SOCKET_ONCLOSE (state, event) {
      console.log(event);
      state.socket.isConnected = false
    },
    SOCKET_ONERROR (state, event) {
      console.error(state, event)
    },
    // default handler called for all methods
    SOCKET_ONMESSAGE (state, message) {
      //console.log(message)
      state.socket.message = message
    },
    // mutations for reconnect methods
    SOCKET_RECONNECT (state, count) {
      console.info(state, count)
    },
    SOCKET_RECONNECT_ERROR (state) {
      state.socket.reconnectError = true;
      console.error(state);
    }
  },
  actions: {
  }
  
})