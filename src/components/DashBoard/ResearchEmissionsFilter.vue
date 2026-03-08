<template>
  <div id="formResearchEmissions" class="research-emission pt-3 px-4 mb-2 mt-4">
    <b-row>
      <b-col cols="5" sm="3">
        <b-form-group id="date" label="Jour VOD:" label-for="date-vod">
          <b-form-datepicker
              id="date-vod"
              v-model="searchemission.voddate"
              @input="onSelectDateDay"
          />
        </b-form-group>
        <b-form-group
            v-if="showVodTypeFilter"
            id="vod-type"
            label="Type VOD:"
            label-for="vod-type-select"
        >
          <b-form-select
              id="vod-type-select"
              v-model="searchemission.vodType"
              :options="optionVodTypeList"
          />
        </b-form-group>
      </b-col>

      <b-col cols="5" sm="2">
        <b-form-group id="channel-diff" label="Chaine de difusion:" label-for="channel">
          <b-form-select
              id="channel"
              v-model="searchemission.chainedif"
              multiple
              :select-size="3"
              :options="optionchaineList"
          />
        </b-form-group>
      </b-col>

      <b-col cols="3" sm="2">
        <b-form-group id="plateforme" label="Plateforme:" label-for="plateforme">
          <b-form-select
              id="plateforme"
              v-model="searchemission.plateforme"
              multiple
              :select-size="3"
              :options="optionplateformList"
          />
        </b-form-group>
      </b-col>

      <b-col cols="5" sm="2">
        <b-form-group id="channel-diff" label="Statut de difusion:" label-for="status">
          <b-form-checkbox-group
              v-model="searchemission.status"
              :options="optionStatus"
              name="status"
              value-field="value"
              text-field="text"
          />
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
          Rechercher <b-icon class="ml-2" icon="search"></b-icon>
        </b-button>
        <br />

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
        <b-form-checkbox v-model="rechauto" @change="rechercheAuto()">
          Recherch auto
        </b-form-checkbox>
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
      ],
      loading: false,

      // VodType filter
      vodTypeGroups: {}, // { FAST_TV: "GR_vodoo_fasttv", FVOD_CATCHUP: "GR_vodoo_users" }
      optionVodTypeList: [], // [{value:"FAST_TV", text:"FAST"}, ...]
      searchemission: {
        voddate: new Date(),
        chainedif: [],
        plateforme: [],
        status: [],
        vodType: "", // "FAST_TV" | "FVOD_CATCHUP" | ""
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
    // Admin voit toujours le filtre
    // Non-admin: filtre visible uniquement si plusieurs vodTypes accessibles
    showVodTypeFilter() {
      return this.isAdmin || this.optionVodTypeList.length > 1;
    },

    isAdmin() {
      const userGroups = this.getCurrentUserGroups();
      // Version PROD:
      return userGroups.includes("GR_vodoo_admin");

      // Version LOCAL (décommenter pour tester en local):
      // return userGroups.includes("vodoo_api");
    },
  },

  watch: {
    "$store.state.user"() {
      this.syncVodTypeFilter();
    },
  },

  methods: {
    // -------------------------
    // Data loading
    // -------------------------
    getChannelList() {
      axios
          .get(this.$store.getters.getUrlBaseService + "notification/service/chaines")
          .then((result) => {
            result.data.forEach((elt) => {
              let newelt = {
                value: Object.keys(elt)[0],
                text: Object.values(elt)[0],
              };
              this.optionchaineList.push(newelt);
            });
          })
          .catch((error) => console.error(error))
          .finally(() => (this.loading = false));
    },

    getPlateformList() {
      axios
          .get(this.$store.getters.getUrlBaseService + "notification/service/plateformes")
          .then((result) => {
            result.data.forEach((elt) => {
              let newelt = {
                value: Object.keys(elt)[0],
                text: Object.values(elt)[0],
              };
              this.optionplateformList.push(newelt);
            });
          })
          .catch((error) => console.error(error))
          .finally(() => (this.loading = false));
    },

    getVodTypeList() {
      axios
          .get(this.$store.getters.getUrlBaseService + "notification/service/vodTypes")
          .then((result) => {
            result.data.forEach((elt) => {
              const vodType = Object.keys(elt)[0];      // FAST_TV / FVOD_CATCHUP
              const groupName = Object.values(elt)[0];  // GR_vodoo_fasttv / GR_vodoo_users
              this.$set(this.vodTypeGroups, vodType, groupName);
            });
            this.syncVodTypeFilter();
          })
          .catch((error) => console.error(error))
          .finally(() => (this.loading = false));
    },

    // -------------------------
    // VodType logic
    // -------------------------
    getVodTypeText(vodType) {
      if (vodType === "FAST_TV") return "FAST";
      if (vodType === "FVOD_CATCHUP") return "CATCH";
      return vodType;
    },

    normalizeGroups(groups) {
      if (Array.isArray(groups)) return groups;
      if (typeof groups === "string") return [groups];
      if (groups && typeof groups === "object") return Object.values(groups);
      return [];
    },

    getCurrentUserGroups() {
      const user = this.$store.getters.user;
      const groups = this.normalizeGroups(user && user.groups);

      // Version PROD:
      //return groups;

      // Version LOCAL (décommenter pour tester en local):
      return groups.includes("vodoo_api")
        ? ["GR_vodoo_fasttv", "GR_vodoo_users", "GR_vodoo_admin"]
         : groups;
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

      // Règle: si un seul groupe => filtre invisible + vodType forcé
      if (availableVodTypes.length === 1) {
        this.searchemission.vodType = availableVodTypes[0];
      } else {
        // admin ou multi-group : on laisse choisir.
        // si la valeur actuelle n'est pas permise, reset.
        if (this.searchemission.vodType && !availableVodTypes.includes(this.searchemission.vodType)) {
          this.searchemission.vodType = "";
        }
      }
    },

    // -------------------------
    // UI helpers
    // -------------------------
    onSelectDateDay(e) {
      const d = e
          ? this.searchemission.voddate
          : this.searchemission.voddate.toISOString().split("T")[0];

      this.linkDivaMonitoring = EnvironmentVariables.get().linkDivaMonitoring + "" + d;
      this.linkVodSwing = EnvironmentVariables.get().linkVodSwing + "" + d;
    },

    rechercheAuto() {
      if (!this.rechauto) {
        clearInterval(this.interval);
        this.interval = 0;
      } else {
        this.interval = setInterval(() => this.searchEmission(), 120000);
      }
    },

    rechercheAutoEvent(payload) {
      switch (payload) {
        case false:
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
        if (list[i].value === chainename) return list[i].text;
      }
      return "";
    },

    // -------------------------
    // Main search
    // -------------------------
    searchEmission() {
      this.loading = true;

      let filterchannel = "";
      for (let pas = 0; pas < this.searchemission.chainedif.length; pas++) {
        if (this.searchemission.chainedif[pas] === "NONLINEAIRE") {
          filterchannel += ","; // keep old behavior
        } else {
          filterchannel +=
              this.getTextFromValueChaineDif(this.optionchaineList, this.searchemission.chainedif[pas]) + ",";
        }
      }

      document.body.classList.add("busy-cursor");

      const vodday = moment(this.searchemission.voddate).format("DD-MM-YYYY");

      // ✅ IMPORTANT: le backend filtre déjà via vodTypes
      // Controller: @RequestParam(value="vodTypes", required=false) List<VodType> vodTypes
      const params = {
        channels: filterchannel,
      };
      if (this.searchemission.vodType) {
        // en Spring, List<VodType> peut être: vodTypes=FAST_TV (une valeur) ou vodTypes=FAST_TV&vodTypes=...
        params.vodTypes = this.searchemission.vodType;
      }

      axios
          .get(
              this.$store.getters.getUrlBaseService + "lava/plannedproductsbydate/" + vodday,
              { params }
          )
          .then((result) => {
            document.body.classList.remove("busy-cursor");

            let data = result.data;
            if (data) {
              data = data.filter((p) => p.action == null || p.action.match(/Deleted/i) == null);
            } else {
              data = [];
            }

            // ✅ pas de filtre vodType ici (backend fait déjà)
            const items = this.searchByPlateforme(data);
            this.$store.commit("setEmissions", this.searchByStatus(items));
            this.$store.commit("setJourVod", moment(this.searchemission.voddate).format("DD/MM/YYYY"));
          })
          .catch((error) => {
            console.error(error);
          })
          .finally(() => {
            this.loading = false;
            document.body.classList.remove("busy-cursor");
          });
    },

    savedateandchannel() {
      this.searchcriteria = {
        date: moment(this.searchemission.voddate).format("DD/MM/YYYY"),
        chaine: "LAUNE",
        data: "",
      };
      this.$store.commit("setSearchcriteria", this.searchcriteria);
    },

    foundPlateformeItem(plateforme, listPlateforme) {
      for (let i = 0; i < listPlateforme.length; i++) {
        if (listPlateforme[i] == plateforme) return true;
      }
      return false;
    },

    searchByPlateforme(items) {
      if (this.searchemission.plateforme.length === 0) return items;

      let filteredListByPlateforme = [];
      for (let i = 0; i < items.length; i++) {
        // ⚠️ safe access (évite crash si plateformOffers vide)
        const platformName = items[i] && items[i].plateformOffers && items[i].plateformOffers[0]
            ? items[i].plateformOffers[0].name
            : null;

        if (!platformName) continue;

        if (this.foundPlateformeItem(platformName, this.searchemission.plateforme)) {
          filteredListByPlateforme.push(items[i]);
        }
      }
      return filteredListByPlateforme;
    },

    foundStatusItem(statexport, stattranscod, statpblu, listStatus) {
      for (let i = 0; i < listStatus.length; i++) {
        if (statexport && statexport.useCase && statexport.useCase.includes(listStatus[i])) return true;
        if (stattranscod && stattranscod.useCase && stattranscod.useCase.includes(listStatus[i])) return true;
        if (statpblu && statpblu.useCase && statpblu.useCase.includes(listStatus[i])) return true;
      }
      return false;
    },

    searchByStatus(items) {
      if (this.searchemission.status.length === 0) return items;

      let filteredListByStatus = [];
      for (let i = 0; i < items.length; i++) {
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
    },

    allowsChange() {
      let change;
      if (this.$store.getters.getSelectedEmissions.length > 0) {
        change = this.$store.getters.getSelectedEmissions[0].manualRequest;
      } else {
        this.change = "Interdire traitement automatique";
        return false;
      }
      for (let index = 0; index < this.$store.getters.getSelectedEmissions.length; index++) {
        if (this.$store.getters.getSelectedEmissions[index].manualRequest != change) {
          this.change = "Interdire traitement automatique";
          return false;
        }
      }
      this.change = change ? "Autoriser traitement automatique" : "Interdire traitement automatique";
      return true;
    },
  },
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
