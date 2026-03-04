<template>
  <div class="home">
    <header class="header bg-dark py-2">
      <b-container fluid>
        <b-row align-v="center">
          <b-col><div class="text-left">Exportation Diva</div></b-col>
        </b-row>
      </b-container>
    </header>
    <div class="critere">
      <b-container fluid>
        <b-row>
          <b-col class="critere__item">
            <b-form-group
              id="date"
              label="Date"
              label-for="datepicker"
              class="mb-0 ml-3"
            >
              <b-form-datepicker
                id="datepicker"
                v-model="dateJob"
                :date-format-options="{
                  year: 'numeric',
                  month: 'numeric',
                  day: 'numeric',
                }"
                locale="fr"
                class="fix-width"
                label-no-date-selected=""
              >
              </b-form-datepicker>
            </b-form-group>
            <b-form-group class="mb-0 ml-3" style="width: 250px">
              <b-form-checkbox
                v-model="onlyMan"
                id="check-export"
                switch
                @change="filtreJobs()"
              >
                <span>Uniquement manuelle</span>
              </b-form-checkbox>
            </b-form-group>
            <b-button
              class="ml-3 btn-icon"
              size="sm"
              @click="update"
              variant="primary"
            >
              <span class="material-icons icon">search</span>
            </b-button>
          </b-col>
        </b-row>
      </b-container>
    </div>
    <jobs></jobs>
  </div>
</template>

<script>
import Jobs from "@/components/Jobs.vue";
export default {
  components: { Jobs },
  name: "HomE",
  data() {
    return {
      onlyMan: false,
      hideHeaderDatePicker: true,
    };
  },
  mounted() {
    this.dateJob = this.$route.params.date;
  },
  computed: {
    dateJob: {
      get: function () {
        return this.$store.state.diva.date;
      },
      set: function (v) {
        this.$store.dispatch("diva/selectDate", v);
      },
    },
  },
  methods: {
    update(){
       this.$store.dispatch("diva/selectSearch", Date.now());
    },
    filtreJobs() {
      this.$store.dispatch("diva/selectFilter", this.onlyMan ? "oui" : null);
    },
  },
};
</script>

<style lang="scss">
.home {
  margin: 10px;
  
}
.header {
  color: white;
}
.critere {
  margin: 10px 0;
  background-color: #fff;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;

  // height: 80px;

  &__item {
    display: flex;
    align-items: center;
    margin: 1rem 0;
  }
  .fix-width {
    width: 150px;
  }
  .form-group {
    display: flex;
    align-items: center;

    label {
      margin-right: 1rem;
      margin-bottom: 0;
    }
  }
}
</style>