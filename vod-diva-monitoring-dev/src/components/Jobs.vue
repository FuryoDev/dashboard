<template>
  <div class="jobs">
    <div>
      <b-table
        sticky-header="calc(100vh - 165px)"
        bordered
        striped
        small
        hover
        responsives
        head-variant="dark"
        :items="jobs"
        :fields="fields"
        :filter="filter" 
        :filter-included-fields="filterOn"
        :busy="isBusyVar"
      ><!---->
        <template #cell(status)="data">
          <div :class="getColorBgStatut(data.value)">
            <p>{{ data.value }}</p>
          </div>
        </template>
        <template #cell(progress)="data">
          <b-progress
            :value="data.value"
            max="100"
            show-progress
            animated
          ></b-progress>
        </template>
        <template #table-busy>
          <div class="text-center text-info my-2">
            <b-spinner class="align-middle"></b-spinner>
            <strong>Loading...</strong>
          </div>
        </template>
      </b-table>
    </div>
    <div class="actions"></div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import api from "../api/service";
export default {
  name: "JobS",
  data() {
    return {
      fields: [
        { key: "title", label: "Titre", sortable: true },
        { key: "mediaId", label: "Média", sortable: true },
        { key: "status", label: "Status", sortable: true },
        { key: "creation", label: "Date début", sortable: true },
        { key: "progress", label: "Progress", sortable: true },
        {
          key: "manuel",
          label: "Manuelle",
          sortable: true,
          formatter: (value) => {
            return value ? "Oui" : "Non";
          },
          filterByFormatted: true,
        },
      ],
      filterOn: ["manuel"],
      jobs: [],
      valid: false,
      isBusyVar: false,
      polling: null,
    };
  },
  mounted() {},
  computed: {
    ...mapState({
      date: (state) => state.diva.date,
      filter: (state) => state.diva.filter,
      search: (state) => state.diva.search,
    }),
  },
  watch: {
    date(n) {
      if (n) {
        this.getJobsDay();
      }
    },
    search(n) {
      if (n) {
        this.getJobsDay();
      }
    },
  },
  methods: {
    getJobsDay() {
      if (this.date) {
        this.isBusyVar = true;
        clearTimeout(this.polling);
        api
          .getJobByDay(this.date)
          .then((result) => result.data)
          .then((variables) => {
            this.jobs = variables;
          })
          .catch((error) => {
            console.log(error);
            this.jobs = [];
          })
          .finally(() => {
            this.isBusyVar = false;
            const self = this;
            this.polling = setTimeout(function () {
              self.getJobsDay();
            }, 1 * 60 * 1000);
          });
      }
    },
    getColorBgStatut(data) {
      switch (data) {
        case "DIVA_ACCOMPLI":
        case "DIVA_COMPLETED":
          return "bg-success";
        case "DIVA_RUNNING":
          return "bg-info";
        case "DIVA_ABORTED":
          return "bg-danger";
      }
      return "";
    },
  },
};
</script>

<style lang="scss">
@import "../assets/css/_variables.scss";
.jobs {
  margin: 10px 0;
  padding: 10px;
  border-radius: 10px;
  background-color: $table-bg;
  text-align: left;
  height: calc(100vh - 150px);
}
</style>