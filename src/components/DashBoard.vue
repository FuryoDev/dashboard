<template>
  <b-container fluid id="dashboard">
    <div class="sizedivsearch">
      <ResearchEmissionsFilter ref="rechercheauto" />
    </div>
    <div class="sizediv">
      <Emissions @rechautoevent="rechercheAutoEvent" @statusChangeEvent="updateDb" />
    </div>
    <div class="sizedivsdetail">
      <DetailOfferTranscodeEmission />
    </div>
  </b-container>
</template>

<script>
import { defineComponent, ref } from 'vue'
import Emissions from '../components/DashBoard/Emissions.vue'
import ResearchEmissionsFilter from '../components/DashBoard/ResearchEmissionsFilter.vue'
import DetailOfferTranscodeEmission from '../components/DashBoard/DetailOfferTranscodeEmission.vue'

export default defineComponent({
  name: 'dashboard',
  components: {
    Emissions,
    ResearchEmissionsFilter,
    DetailOfferTranscodeEmission,
  },
  setup() {
    const rechercheauto = ref(null)

    const rechercheAutoEvent = (payload) => {
      rechercheauto.value?.rechercheAutoEvent(payload)
    }

    const updateDb = () => {
      rechercheauto.value?.searchEmission()
    }

    return {
      rechercheauto,
      rechercheAutoEvent,
      updateDb,
    }
  },
})
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
