<template>
  <div>
      <b-modal v-model="show" centered title="Verification des métadonnées et fichiers à publier"  >
      <b-table  striped hover   sticky-header  @row-clicked="onRowSelected" :items="this.$store.getters.emissionsToCheck" 
            :fields="veriffields" selectable select-mode="multi" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"
       > </b-table>
       <div id="detail" >
            <b-table  striped hover   :items="this.$store.getters.offers.platformOffersCol" :fields="fieldsOffers" selectable select-mode="multi" ></b-table>
      </div>
       </b-modal>
  </div>
</template>

<script>
//import VueTableDynamic from 'vue-table-dynamic';

export default {
   
  name: 'Demo',
  data() {
    return {
       veriffields: [
          { key: 'titre', label: 'Ttitre' },
          { key: 'idEpisode', label: 'Episode' },
          { key: 'titre', label: 'Profile' },
          { key: 'idEpisode', label: 'Erreur' }],
       fieldsOffers: [
          { key: 'platform', label: 'Plateform' },
          { key: 'offers[0].name', label: 'Offre' },
          { key: 'offers[0].price', label: 'Prix' },
          { key: 'offers[0].startDateString', label: 'Début' },
          { key: 'offers[0].endDateString', label: 'Fin' },
          { key: 'offers[0].geoloc', label: 'Territoire' },
          { key: 'offers[0].oid', label: 'oid' }],
    }
  },
   methods: {
     getOffers: function () {
       this.showdetail = 'offers';
     },
     getJobs: function () {
       this.showdetail = 'jobs';
     }
  },
  computed: {
      //  this.$store.getters.offers
    },
  components: 
  { 
   //   VueTableDynamic, 
      
  }

}
</script>
<style>
#detail {
 /* font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-left: 20px;
  margin-right: 20px;
  margin-top: 10px;*/
   background: #eaeff0e5;
    color: rgb(235, 243, 243);
    text-align: left;
    margin-left: 20px;
    margin-right: 20px;
    margin-bottom: 40px;
}
#buttonDetailChoice {
    margin-left: 20px;
    margin-right: 20px;
    margin-bottom: 10px;
    text-align: left;

}
</style>