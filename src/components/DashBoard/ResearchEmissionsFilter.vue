<template>
  <div id="formResearchEmissions" class="research-emission pt-3 px-4 mb-2 mt-4">
    <b-row>
      <b-col cols="5" sm="3">
        <b-form-group id="date" label="Jour VOD:" label-for="date-vod">
          <b-form-datepicker
            id="date-vod"
            v-model="searchemission.voddate"
            @input="onSelectDateDay"
          >
          </b-form-datepicker>
        </b-form-group>
      </b-col>
      <b-col cols="5" sm="2">
        <b-form-group
          id="channel-diff"
          label="Chaine de difusion:"
          label-for="channel"
        >
          <b-form-select
            id="channel"
            v-model="searchemission.chainedif"
            multiple
            :select-size="3"
            :options="optionchaineList"
          ></b-form-select>
        </b-form-group>
      </b-col>
      <b-col cols="3" sm="2">
        <b-form-group
          id="plateforme"
          label="Plateforme:"
          label-for="plateforme"
        >
          <b-form-select
            id="plateforme"
            v-model="searchemission.plateforme"
            multiple
            :select-size="3"
            :options="optionplateformList"
          ></b-form-select>
        </b-form-group>
      </b-col>
      <b-col v-if="showVodTypeFilter" cols="1" sm="2">
        <b-form-group id="vod-type" label="Type VOD:" label-for="vod-type-select">
          <b-form-select
            id="vod-type-select"
            v-model="searchemission.vodType"
            :options="optionVodTypeList"
          ></b-form-select>
        </b-form-group>
      </b-col>
      <b-col cols="5" sm="2">
        <b-form-group
          id="channel-diff"
          label="Statut de difusion:"
          label-for="status"
        >
          <b-form-checkbox-group
            v-model="searchemission.status"
            :options="optionStatus"
            name="status"
            value-field="value"
            text-field="text"
          ></b-form-checkbox-group>
        </b-form-group>
      </b-col>
      <b-col cols="5" sm="3">
        <b-button
          size="lg"
          class="mb-3 w-100"
          variant="primary"
          id="search"
          v-on:click="searchEmission()"
          type="submit"
        >
          Rechercher <b-icon class="ml-2" icon="search"></b-icon> </b-button
        ><br />

        <router-link target="_blank" to="/vodmanuel">
          <b-button
            variant="secondary"
            size="sm"
            class="w-100"
            v-on:click="savedateandchannel()"
          >
            Vod Manuel
          </b-button>
        </router-link>
        <b-button
          variant="secondary"
          size="sm"
          class="mt-3 w-100"
          :href="linkDivaMonitoring"
          target="_blank"
        >
          Diva Monitoring
        </b-button>
      </b-col>
    </b-row>

    <b-row>
      <b-col cols="5" sm="3" class="mb-2">
        <b-form-checkbox v-model="rechauto" @change="rechercheAuto()"
          >Recherch auto</b-form-checkbox
        >
      </b-col>
    </b-row>
  </div>
</template>

<script>
import axios from "axios";
import moment from "moment";
import EnvironmentVariables from "../../../env";

export default {
  name: "Demo",
  data() {
    return {
      showReason: false,
      reason: "",
      optionchaineList: [],
      optionplateformList: [],
      optionPlateforme: [
        { value: "Auvio", text: "Auvio" },
        { value: "Proximus", text: "Proximus" },
        { value: "Voo", text: "Voo" },
        { value: "I2I", text: "I2I" },
      ],
      optionStatus: [
        { value: "PREVU", text: "PREVU" },
        { value: "attente", text: "EN_ATTENTE" },
        { value: "EN_COURS", text: "EN_COURS" },
        { value: "TERMINE", text: "TERMINE" },
        { value: "Publié", text: "PUBLIE" },
        { value: "ECHEC", text: "ECHEC" },

        // { value: "EXCLU", text: "EXCLU" },
        // { value: "IGNORE", text: "IGNORE" },
      ],
      loading: false,
      vodTypeGroups: {},
      optionVodTypeList: [],
      //  change: "Interdire traitement automatique",
      searchemission: {
        voddate: new Date(),
        chainedif: [],
        plateforme: [],
        status: [],
        vodType: "",
      },
      rechauto: false,
      reasonmissed: false,
      changerechauto: false,
      interval: 0,
      linkDivaMonitoring: EnvironmentVariables.get().linkDivaMonitoring,
      linkVodSwing: EnvironmentVariables.get().linkVodSwing,
    };
  },
  mounted() {
    this.onSelectDateDay();
    this.getChannelList();
    this.getPlateformList();
    this.getVodTypeList();
  },
  computed: {
    showVodTypeFilter() {
      return this.isAdmin || this.optionVodTypeList.length > 1;
    },
    isAdmin() {
      const userGroups = this.getCurrentUserGroups();
      // Version PROD:
      //return userGroups.includes("GR_vodoo_admin");
      // Version LOCAL (décommenter pour tester en local):
      return userGroups.includes("vodoo_api");
    },
  },
  watch: {
    "$store.state.user"() {
      this.syncVodTypeFilter();
    },
  },
  methods: {
    getChannelList() {
      axios
        .get(
          this.$store.getters.getUrlBaseService + "notification/service/chaines"
        )
        .then(
          (result) => {
            result.data.forEach((elt) => {
              let newelt = {
                value: Object.keys(elt)[0],
                text: Object.values(elt)[0],
              };
              this.optionchaineList.push(newelt);
            });
          },
          (error) => {
            console.error(error);
          }
        )
        .finally(() => (this.loading = false));
    },
    getPlateformList() {
      axios
        .get(
          this.$store.getters.getUrlBaseService +
            "notification/service/plateformes"
        )
        .then(
          (result) => {
            result.data.forEach((elt) => {
              let newelt = {
                value: Object.keys(elt)[0],
                text: Object.values(elt)[0],
              };
              this.optionplateformList.push(newelt);
            });
          },
          (error) => {
            console.error(error);
          }
        )
        .finally(() => (this.loading = false));
    },
    getVodTypeList() {
      axios
        .get(this.$store.getters.getUrlBaseService + "notification/service/vodTypes")
        .then(
          (result) => {
            result.data.forEach((elt) => {
              const vodType = Object.keys(elt)[0];
              const groupName = Object.values(elt)[0];
              this.$set(this.vodTypeGroups, vodType, groupName);
            });
            this.syncVodTypeFilter();
          },
          (error) => {
            console.error(error);
          }
        )
        .finally(() => (this.loading = false));
    },
    getVodTypeText(vodType) {
      if (vodType === "FAST_TV") {
        return "FAST";
      }
      if (vodType === "FVOD_CATCHUP") {
        return "CATCH";
      }
      return vodType;
    },
    normalizeGroups(groups) {
      if (Array.isArray(groups)) {
        return groups;
      }
      if (typeof groups === "string") {
        return [groups];
      }
      if (groups && typeof groups === "object") {
        return Object.values(groups);
      }
      return [];
    },
    getCurrentUserGroups() {
      const groups = this.normalizeGroups(this.$store.getters.user.groups);
      // Version PROD:
      return groups;

      // Version LOCAL (décommenter pour tester en local):
      // return groups.includes("vodoo_api")
      //   ? ["GR_vodoo_fasttv", "GR_vodoo_catch", "GR_vodoo_admin"]
      //   : groups;
    },
    syncVodTypeFilter() {
      const userGroups = this.getCurrentUserGroups();
      const allVodTypes = Object.keys(this.vodTypeGroups);
      const availableVodTypes = this.isAdmin
        ? allVodTypes
        : allVodTypes.filter((vodType) => userGroups.includes(this.vodTypeGroups[vodType]));

      this.optionVodTypeList = availableVodTypes.map((vodType) => ({
        value: vodType,
        text: this.getVodTypeText(vodType),
      }));

      if (availableVodTypes.length === 1) {
        this.searchemission.vodType = availableVodTypes[0];
      } else if (!availableVodTypes.includes(this.searchemission.vodType)) {
        this.searchemission.vodType = "";
      }
    },
    onSelectDateDay(e) {
      const d = e
        ? this.searchemission.voddate
        : this.searchemission.voddate.toISOString().split("T")[0];
      this.linkDivaMonitoring =
        EnvironmentVariables.get().linkDivaMonitoring + "" + d;
      this.linkVodSwing = EnvironmentVariables.get().linkVodSwing + "" + d;
    },
    rechercheAuto() {
      console.log("recher auto =" + this.rechauto);
      if (!this.rechauto) {
        clearInterval(this.interval);
        this.interval = 0;
      } else {
        this.interval = setInterval(() => this.searchEmission(), 120000);
      }
    },
    rechercheAutoEvent(payload) {
      //   console.log("eho = "+payload)
      switch (payload) {
        case false:
          //  case "stoprechauto":
          this.changerechauto = this.rechauto;
          if (this.rechauto) {
            clearInterval(this.interval);
            this.interval = 0;
            this.rechauto = false;
          }
          break;
        case true:
          this.rechauto = this.changerechauto;
          if (this.changerechauto) {
            this.interval = setInterval(() => this.searchEmission(), 120000);
          }
          break;
      }
    },
    getTextFromValueChaineDif(list, chainename) {
      for (let i = 0; i < list.length; i++) {
        if (list[i].value === chainename) {
          return list[i].text;
        }
      }
      return "";
    },
    searchEmission() {
      this.loading = true;
      /*  en commentaire pour le moment car le filtre nest pas encore implemente
     
     let status = "";

      for (let pas = 0; pas < this.searchemission.status.length; pas++) {
        status += this.searchemission.status[pas] + ",";
      }*/

      let filterchannel = "";
      //console.log("les emission recherché = "+JSON.stringify(this.searchemission.chainedif))
      for (let pas = 0; pas < this.searchemission.chainedif.length; pas++) {
        if (this.searchemission.chainedif[pas] == "NONLINEAIRE") {
          filterchannel += "" + ",";
        } else {
          console.log("elemn= ", this.searchemission.chainedif[pas]);
          filterchannel +=
            this.getTextFromValueChaineDif(
              this.optionchaineList,
              this.searchemission.chainedif[pas]
            ) + ",";
        }
      }
      document.body.classList.add("busy-cursor");

      let vodday = moment(this.searchemission.voddate).format("DD-MM-YYYY");
        axios
        .get(
          this.$store.getters.getUrlBaseService +
            "lava/plannedproductsbydate/" +
            vodday +
            "?channels=" +
            filterchannel
        )
        .then(
          (result) => {
            this.loading = false;
            // console.log("resultat = " + JSON.stringify(result.data));
            document.body.classList.remove("busy-cursor");
            let data = result.data;
            if (data) {
              data = data.filter((p) => p.action == null || p.action.match(/Deleted/i) == null);
              if (this.searchemission.vodType) {
                data = data.filter((p) => p.vodType === this.searchemission.vodType);
              }
            } else {
              data = [];
            }
            let items = this.searchByPlateforme(data);
            this.$store.commit("setEmissions", this.searchByStatus(items));
            this.$store.commit(
              "setJourVod",
              moment(this.searchemission.voddate).format("DD/MM/YYYY")
            );
          },
          (error) => {
            console.error(error);
          }
        )
        .finally(() => (this.loading = false));
    },
    savedateandchannel() {
      // const routeData = this.$router.resolve({name: 'Vodswing'});
      //        window.open(routeData.href, '_blank');
      (this.searchcriteria = {
        date: moment(this.searchemission.voddate).format("DD/MM/YYYY"),
        chaine: "LAUNE",
        data: "",
      }),
        //console.log("le jour = "+this.searchcriteria.date )
        this.$store.commit("setSearchcriteria", this.searchcriteria);
      console.log("$route", this.$route);
      // window.open(`/v2${this.$route.path}vodmanuel`, '_blank');
    },
    foundPlateformeItem(plateforme, listPlateforme) {
      for (let i = 0; i < listPlateforme.length; i++) {
        console.log("je compare = " + listPlateforme[i] + " et " + plateforme);
        if (listPlateforme[i] == plateforme) {
          return true;
        }
      }
      return false;
    },
    searchByPlateforme(items) {
      let filteredListByPlateforme = [];
      if (this.searchemission.plateforme.length > 0) {
        for (let i = 0; i < items.length; i++) {
          // console.log("plateforme" +items[i].plateformOffers[0].name);
          if (
            this.foundPlateformeItem(
              items[i].plateformOffers[0].name,
              this.searchemission.plateforme
            )
          ) {
            filteredListByPlateforme.push(items[i]);
          }
        }

        return filteredListByPlateforme;
      } else {
        return items;
      }
    },
    foundStatusItem(statexport, stattranscod, statpblu, listStatus) {
      for (let i = 0; i < listStatus.length; i++) {
        if (
          statexport != null &&
          statexport.useCase != null &&
          statexport.useCase.includes(listStatus[i])
        ) {
          return true;
        }
        if (
          stattranscod != null &&
          stattranscod.useCase != null &&
          stattranscod.useCase.includes(listStatus[i])
        ) {
          return true;
        }
        if (
          statpblu != null &&
          statpblu.useCase != null &&
          statpblu.useCase.includes(listStatus[i])
        ) {
          return true;
        }
      }
      return false;
    },
    searchByStatus(items) {
      let filteredListByStatus = [];

      if (this.searchemission.status.length > 0) {
        for (let i = 0; i < items.length; i++) {
          // console.log("plateforme" +items[i].plateformOffers[0].name);
          if (
            this.foundStatusItem(
              items[i].recordStatusTraitementItem,
              items[i].recordStatusTranscodageItem,
              items[i].recordStatusPublicationItem,
              this.searchemission.status
            )
          ) {
            filteredListByStatus.push(items[i]);
          }
        }

        return filteredListByStatus;
      } else {
        return items;
      }
    },
    allowsChange() {
      let change;
      if (this.$store.getters.getSelectedEmissions.length > 0) {
        change = this.$store.getters.getSelectedEmissions[0].manualRequest;
      } else {
        this.change = "Interdire traitement automatique";
        return false;
      }
      for (
        let index = 0;
        index < this.$store.getters.getSelectedEmissions.length;
        index++
      ) {
        if (
          this.$store.getters.getSelectedEmissions[index].manualRequest !=
          change
        ) {
          this.change = "Interdire traitement automatique";
          return false;
        }
      }
      if (change) {
        this.change = "Autoriser traitement automatique";
      } else {
        this.change = "Interdire traitement automatique";
      }

      return true;
    },
  },
  components: {},
};
</script>
<style lang="scss">
@import "../../assets/css/_variables.scss";

.research-emission {
  background: #fffafb;
  border-radius: 10px;
  margin-top: 1rem;
}
</style>
