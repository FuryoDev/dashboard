<template>
  <b-container fluid id="dashboard">
    <div class="sizedivsearch">
       <ResearchEmissionsFilter ref="rechercheauto"/>
    </div>
    <div class="sizediv">
     <Emissions @rechautoevent="rechercheAutoEvent" @statusChangeEvent="updateDb"/>
    </div>
    <div class="sizedivsdetail">
    <DetailOfferTranscodeEmission />
    </div>
  </b-container>
  <!-- <div class="fill">
    <div class="sizedivsearch ">
       <ResearchEmissionsFilter />
    </div>
    <div class="sizediv">
     <Emissions/>
    </div>
    <div class="sizedivsdetail">
    <DetailOfferTranscodeEmission />
    </div>
  </div> -->
</template>

<script>
import Emissions from '../components/DashBoard/Emissions.vue'
import ResearchEmissionsFilter from '../components/DashBoard/ResearchEmissionsFilter.vue'
import DetailOfferTranscodeEmission from '../components/DashBoard/DetailOfferTranscodeEmission.vue'
//import VodSwing from '../components/DashBoard/VodSwing.vue'
export default {
  name: 'dashboard',
  data() {
    return {
      selectedLigne:""
    }
  },
  components: {
    Emissions, 
    ResearchEmissionsFilter,
    DetailOfferTranscodeEmission,

  },
  methods: {

    rechercheAutoEvent (payload){
      this.$refs.rechercheauto.rechercheAutoEvent(payload);
    },
    updateDb(){
    //   console.log("je suis dans le parent")
       this.$refs.rechercheauto.searchEmission() 
    }
   /*     updateTable() {
             this.$refs.emissionsRef.updateSelectLigne(this.selectedLigne);
        },
        updateSelectedLigne(item){
          this.selectedLigne = item

        }*/
    }
}
</script>

<style lang="scss">
#dashboard {
  height: 100%;
  min-height: 100%; 
  margin-top: 40px;
  
}
.sizediv { 
  height: calc(55vh - 10px);
  border-radius: 10px;
  padding: 10px;
  margin-bottom: 10px;
  background: #fff;
}
.sizedivsearch {
  min-width: 100%;
  width: 100%;
}
.sizedivsdetail {
  background: #fff;
  border-radius: 10px;
  height: 25vh;

  .tab-content {
    height: 19vh;
    overflow: auto;
  }
}
</style>
