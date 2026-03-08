<template>
  <div class="p-2">
    <b-tabs content-class="">
      <b-tab title="Transcodages" active>
        <b-table
          @click="contextMenu"
          sticky-header
          responsive
          @contextmenu.prevent="contextMenu"
          @row-contextmenu="openMenu"
          striped
          hover
          head-variant="dark"
          bordered
          :items="this.$store.getters.jobs"
          :fields="fieldsJobs"
          table-class="table-detail"
          small
        >
          <template #cell(startDate)="data">
            <p>{{ getFormattedDate(data.value) }}</p>
            <!-- <p v-for="item in data.value" :key="item.code">{{item.code}} </p> -->
          </template>
          <template #cell(endDate)="data">
            <p>{{ getFormattedDate(data.value) }}</p>
            <!-- <p v-for="item in data.value" :key="item.code">{{item.code}} </p> -->
          </template>
          <template #cell(pubTimestamp)="data">
            <p>{{ getFormattedDate(data.value) }}</p>
            <!-- <p v-for="item in data.value" :key="item.code">{{item.code}} </p> -->
          </template>
          <template #cell(lastStatus)="data">
            <div :class="getColorBgJobs(data.value)">
              <p>{{ data.value }}</p>
              <!-- <p v-for="item in data.value" :key="item.code">{{item.code}} </p> -->
            </div>
          </template>
          <template #cell(pubStatusName)="data">
            <div :class="getColorBgGlobalStatut(data.value)">
              <p>{{ getStatutDecoupeTextFr(data.value) }}</p>
            </div>
          </template>
        </b-table>
      </b-tab>
      <b-tab title="Offres">
        <b-table
          hover
          responsive
          sticky-header
          head-variant="dark"
          bordered
          :items="this.$store.getters.offers"
          :fields="fieldsOffers"
          table-class="table-detail"
          small
          @contextmenu.prevent="contextMenu"
          @row-contextmenu="openMenuOffer"
          @click="contextMenu"
        >
          <template #cell(offers[0].startDate)="data">
            <p>{{ getFormattedDate(data.value) }}</p>
            <!-- <p v-for="item in data.value" :key="item.code">{{item.code}} </p> -->
          </template>
          <template #cell(offers[0].endDate)="data">
            <p>{{ getFormattedDate(data.value) }}</p>
            <!-- <p v-for="item in data.value" :key="item.code">{{item.code}} </p> -->
          </template>
        </b-table>
      </b-tab>
      <b-tab title="Segments">
        <b-table
          hover
          responsive
          sticky-header
          head-variant="dark"
          bordered
          :items="this.$store.getters.segments"
          :fields="fieldsSegments"
          table-class="table-detail"
          small
          @contextmenu.prevent="contextMenu"
          @row-contextmenu="openMenuSegment"
          @click="contextMenu"
        >
          <template #cell(offers[0].startDate)="data">
            <p>{{ getFormattedDate(data.value) }}</p>
            <!-- <p v-for="item in data.value" :key="item.code">{{item.code}} </p> -->
          </template>
          <template #cell(offers[0].endDate)="data">
            <p>{{ getFormattedDate(data.value) }}</p>
            <!-- <p v-for="item in data.value" :key="item.code">{{item.code}} </p> -->
          </template>
        </b-table>
      </b-tab>
      <b-tab title="Sous-titrages">
        <b-table
          sticky-header
          responsive
          striped
          hover
          head-variant="dark"
          bordered
          :items="this.$store.getters.soustitres"
          :fields="fieldsSousTitres"
          table-class="table-detail"
          small
        >
          <template #cell(message)="data">
            <div>
              <p
                data-toggle="tooltip"
                data-placement="right"
                :title="data.value"
              >
                {{ trunkText(data.value, 180) }}
              </p>
            </div>
          </template>
          <template #cell(status)="data">
            <div :class="getColorBgJobs(data.value)">
              <p>{{ data.value }}</p>
            </div>
          </template>
        </b-table>
      </b-tab>
    </b-tabs>

    <!-- <div id="buttonDetailChoice">
      <b-button-toolbar
        aria-label="Toolbar with button groups and dropdown menu"
      >
        <b-button-group class="mx-1">
          <b-button v-on:click="getJobs">Transcodages</b-button>
          <b-button v-on:click="getOffers">Offres</b-button>
        </b-button-group>
      </b-button-toolbar>
    </div> -->
    <div id="detail" class="d-none" v-if="showdetail == 'offers'">
      <b-table
        striped
        hover
        responsive
        sticky-header
        :items="this.$store.getters.offers"
        :fields="fieldsOffers"
      >
        <template #cell(offers[0].startDate)="data">
          <div>
            <p>{{ getFormattedDate(data.value) }}</p>
            <!-- <p v-for="item in data.value" :key="item.code">{{item.code}} </p> -->
          </div>
        </template>
        <template #cell(offers[0].endDate)="data">
          <div>
            <p>{{ getFormattedDate(data.value) }}</p>
            <!-- <p v-for="item in data.value" :key="item.code">{{item.code}} </p> -->
          </div>
        </template>
      </b-table>
    </div>
    <div id="detail" class="d-none" v-if="showdetail == 'jobs'">
      <b-table
        @click="contextMenu"
        sticky-header
        responsive
        @contextmenu.prevent="contextMenu"
        @row-contextmenu="openMenu"
        striped
        hover
        :items="this.$store.getters.jobs"
        :fields="fieldsJobs"
      >
        <template #cell(startDate)="data">
          <div>
            <p>{{ getFormattedDate(data.value) }}</p>
            <!-- <p v-for="item in data.value" :key="item.code">{{item.code}} </p> -->
          </div>
        </template>
        <template #cell(endDate)="data">
          <div>
            <p>{{ getFormattedDate(data.value) }}</p>
            <!-- <p v-for="item in data.value" :key="item.code">{{item.code}} </p> -->
          </div>
        </template>
        <template #cell(pubTimestamp)="data">
          <div>
            <p>{{ getFormattedDate(data.value) }}</p>
            <!-- <p v-for="item in data.value" :key="item.code">{{item.code}} </p> -->
          </div>
        </template>
      </b-table>
    </div>

    <!-- right click transcodage table-->
    <div class="box-click-right">
      <b-list-group
        v-if="viewMenuTranscodage"
        class="box-click-right__wrapper zindex-modal w-25 position-fixed text-left"
        :style="style"
        v-click-outside="outside"
      >
        <b-list-group-item
          onMouseOver="this.style.cursor='pointer'"
          id="jobid"
          @click="copyText('jobid')"
        >
          Copier le n° de job</b-list-group-item
        >
        <b-list-group-item
          onMouseOver="this.style.cursor='pointer'"
          @click="publier"
        >
          Publier</b-list-group-item
        >
        <b-list-group-item
          onMouseOver="this.style.cursor='pointer'"
          @click="controler"
          >Controle avant Publication
        </b-list-group-item>
        <!--     <b-list-group-item
          onMouseOver="this.style.cursor='pointer'"
          @click="regenerer"
        >
          Re-génération des fichiers</b-list-group-item
        >-->
        <b-list-group-item
          onMouseOver="this.style.cursor='pointer'"
          @click="stopperTranscodage"
          >Stopper le transcodage
        </b-list-group-item>
        <!--<b-list-group-item
          onMouseOver="this.style.cursor='pointer'"
          id="jobname"
          @click="copyText('jobname')"
          >Copier le nom du job
		</b-list-group-item>-->
      </b-list-group>
    </div>

    <!-- right click offer table-->
    <div class="box-click-right">
      <b-list-group
        v-if="viewMenuOffer"
        class="box-click-right__wrapper zindex-modal w-25 position-fixed text-left"
        :style="style"
        v-click-outside="outside"
      >
        <b-list-group-item
          onMouseOver="this.style.cursor='pointer'"
          id="oid"
          @click="copyTextOffer('oid')"
        >
          Copier oid</b-list-group-item
        >
      </b-list-group>
    </div>
    <!-- right click segment table-->
    <div class="box-click-right">
      <b-list-group
        v-if="viewMenuSegment"
        class="box-click-right__wrapper zindex-modal w-25 position-fixed text-left"
        :style="style"
        v-click-outside="outside"
      >
        <b-list-group-item
          onMouseOver="this.style.cursor='pointer'"
          id="oid"
          @click="copyTextSegment('name')"
        >
          Copier le n° de stock</b-list-group-item
        >
      </b-list-group>
    </div>
    <!-- reponse publication -->
    <b-modal
      size="lg"
      class="#modal-dialog"
      v-model="showAnswerPubli"
      centered
      id="bv-modal-example"
      hide-footer
      :title="titre"
    >
      <div class="text-left">
        <p class="text-left">Statut: {{ repPubli.status }}</p>
        <p v-if="repPubli.status != 'OK'">Description: {{ repPubli.error }}</p>
      </div>
      <b-button
        variant="danger"
        size="sm"
        class="float-right ml-2"
        @click="showAnswerPubli = false"
        >Annuler</b-button
      >
    </b-modal>

    <!-- confirmation de stoppage de transcodage-->
    <b-modal
      class="#modal-dialog"
      v-model="confirmStop"
      centered
      id="bv-modal-example"
      hide-footer
      title="Stopper transcodage"
    >
      <div class="d-block text-center">
        <p class="text-left">
          Vous voulez vraiment stopper le transcodage du job:
          {{ focusedJob.id }}
        </p>
      </div>
      <b-button size="sm" class="float-right ml-2" @click="stopper"
        >Confirmer</b-button
      >
      <b-button
        variant="danger"
        size="sm"
        class="float-right ml-2"
        @click="confirmStop = false"
        >Annuler</b-button
      >
    </b-modal>
  </div>
</template>

<script>
//import VueTableDynamic from 'vue-table-dynamic';
import clickOutside from "../../Directives/clickOutside";
import axios from "axios";
import moment from "moment";
export default {
  name: "Demo",
  data() {
    return {
      confirmStop: false,
      fieldsOffers: [
        { key: "name", label: "Plateform" },
        { key: "offerName", label: "Offre" },
        { key: "priceCode", label: "Prix" },
        {
          key: "startDateTime",
          formatter: (value) => {
            return value ? new Date(value).toLocaleString() : "";
          },
          label: "Début",
        },
        {
          key: "endDateTime",
          formatter: (value) => {
            return value ? new Date(value).toLocaleString() : "";
          },
          label: "Fin",
        },
        { key: "territoire", label: "Territoire" },
        { key: "id_record", label: "oid" },
      ],
      fieldsSegments: [
        { key: "number", label: "Nombre" },
        { key: "name", label: "Nom" },
        { key: "tcin", label: "Début" },
        { key: "tcout", label: "Fin" },
        { key: "status", label: "Statut" },
      ],

      showdetail: "jobs",
      fieldsJobs: [
        { key: "profileName", label: "Plateform", sortable: true },
        { key: "offer", label: "Offre", sortable: true },
        { key: "lastStatus", label: "Statut", sortable: true },
        { key: "lastProgressValue", label: "% Progression ", sortable: true },
        { key: "startDate", label: "Démarré à", sortable: true },
        { key: "endDate", label: "Terminé à", sortable: true },
        { key: "requester", label: "Demandeur", sortable: true },
        { key: "guid", label: "job-id" },
        { key: "comment", label: "Commentaire" },
      ],
      fieldsSousTitres: [
        { key: "media", label: "Ressource", sortable: true },
        { key: "som", label: "Début de média", sortable: true },
        { key: "status", label: "Statut", sortable: true },
        {
          key: "creation",
          label: "Date de création",
          formatter: (value) => {
            return value ? new Date(value).toLocaleString() : "";
          },
          sortable: true,
        },
        { key: "message", label: "Message", sortable: true },
        {
          key: "lookupLimit",
          label: "Date de clôture",
          formatter: (value) => {
            return value ? new Date(value).toLocaleString() : "";
          },
          sortable: true,
        },
        { key: "creator", label: "Demandeur", sortable: true },
      ],
      viewMenuTranscodage: false,
      viewMenuOffer: false,
      viewMenuSegment: false,
      focusedJob: "",
      focusedOffer: "",
      facusSegment: "",
      showAnswerPubli: false,
      repPubli: {},
      titre: "",
    };
  },
  methods: {
    getFormattedDate(proposeddate) {
      if (proposeddate == "") {
        return "";
      } else {
        var date = new Date(proposeddate);
        return moment(date, "YYYY-MM-DD H:mm").format("DD/MM/YYYY H:mm");
      }
    },
    getFormattedDate2(proposeddate) {
      var date = new Date(proposeddate);
      return moment(date, "YYYY-MM-DD H:mm").format("DD/MM/YYYY H:mm");
    },
    trunkText(v, l) {
      return v && v.length > l ? v.substring(0, l) + "..." : v;
    },
    contextMenu() {},
    outside() {
      this.viewMenuTranscodage = false;
      this.viewMenuOffer = false;
    },
    setMenu(top, left) {
      this.top = `${top - 88}px`;
      this.left = `${left}px`;
    },
    closeMenu() {
      this.viewMenuTranscodage = false;
    },
    openMenu(item, index, e) {
      this.focusedJob = item;
      this.viewMenuTranscodage = true;
      this.setMenu(e.y, e.x);
      e.preventDefault();
    },
    openMenuOffer(item, index, e) {
      this.focusedOffer = item;
      this.viewMenuOffer = true;
      this.setMenu(e.y, e.x);
      e.preventDefault();
    },
    openMenuSegment(item, index, e) {
      this.focusedSegment = item;
      this.viewMenuSegment = true;
      this.setMenu(e.y, e.x);
      e.preventDefault();
    },
    copyText(type) {
      this.viewMenuTranscodage = false;
      const el = document.createElement("textarea");
      switch (type) {
        case "jobid":
          el.value = this.focusedJob.guid;
          break;
        case "jobname":
          el.value = this.focusedJob.jobName;
          break;
      }
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    },
    copyTextOffer(type) {
      this.viewMenuOffer = false;
      const el = document.createElement("textarea");
      switch (type) {
        case "oid":
          el.value = this.focusedOffer.id_record;
          break;
      }
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    },
    copyTextSegment(type) {
      this.viewMenuSegment = false;
      const el = document.createElement("textarea");
      switch (type) {
        case "name":
          el.value = this.focusedSegment.name;
          break;
      }
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    },
    getOffers: function () {
      console.log("offer --------------------= " + this.$store.getters.offers);
      this.showdetail = "offers";
    },
    getJobs: function () {
      this.showdetail = "jobs";
    },
    publier() {
      this.viewMenuTranscodage = false;
      console.log("jobid= " + this.focusedJob.id);
      axios
        .post(
          this.$store.getters.getUrlBaseService +
            "distribution/service/publish/" +
            this.focusedJob.id
        )
        .then(
          (result) => {
            (this.titre = "Publication"),
              (this.showAnswerPubli = true),
              (this.repPubli = result.data);
            //  this.$emit('update-transcoding-table')
          },
          (error) => {
            console.error(error);
          }
        )
        .finally(() => (this.loading = false));
    },
    controler() {
      this.viewMenuTranscodage = false;
      axios
        .post(
          this.$store.getters.getUrlBaseService +
            "distribution/service/checkup/" +
            this.focusedJob.id
        )
        .then(
          (result) => {
            //this.repPubli.error = answerCheck;
            this.titre = "Controle";
            this.showAnswerPubli = true;
            // let rep = { status: "OK", error: result.data.message };
            this.repPubli.status = result.data.success ? "success" : "error";
            this.repPubli.error = result.data.message;
          },
          (error) => {
            console.error(error);
          }
        )
        .finally(() => (this.loading = false));
    },
    stopper() {
      this.viewMenuTranscodage = false;
      axios
        .post(
          this.$store.getters.getUrlBaseService +
            "transcode/service/job/stop/" +
            this.focusedJob.id
        )
        .then(
          (result) => {
            this.confirmStop = false;
            // console.log(result.data);
            this.titre = "Stopper le transcodage ";
            if (result.data.success) {
              this.showAnswerPubli = true;
              let rep = { status: "OK", error: "" };
              this.repPubli.error = rep;
            } else {
              this.showAnswerPubli = true;
              let rep = { status: "Erreur", error: result.data.error };
              this.repPubli = rep;
            }
            // this.$emit('update-transcoding-table')
            /* this.showAnswerPubli = true,
            this.repPubli = result.data*/
          },
          (error) => {
            console.error(error);
          }
        )
        .finally(() => (this.loading = false));
    },
    stopperTranscodage() {
      this.confirmStop = true;
    },
    getColorBgJobs(data) {
      switch (data.toUpperCase()) {
        case "TRANSCODAGE_TERMINE":
        case "SUCCESS":
        case "PUBLIÉ":
          return "couleur-1";
        case "TRANSCODAGE_ANNULE":
        case "ABORTED":
        case "ANNULÉ":
          return "couleur-2";
        case "TRANSCODAGE_ECHEC":
        case "FAILED":
        case "ÉCHEC":
          return "couleur-3";
        case "TRANSCODAGE_EN_COURS":
        case "WAITING":
        case "EN ATTENTE":
          return "couleur-7";
        case "PRÊT À PUBLIER":
          return "couleur-6";
      }
      return "couleur-4";
    },
    getStatutDecoupeTextFr(data) {
      switch (data) {
        case "ok":
          return "ok";
        case "fail":
          return "!";

        case "missing":
          return "manquante";

        case "pending":
          return "en attente";

        case "running":
          return "en cours";

        case "prevented":
          return "empêchée";

        case "wrongXml":
          return "xml invalide";

        case "undefined":
          return "";
      }
      return null;
    },
    getColorBgGlobalStatut(data) {
      switch (data) {
        case "ok":
          return "couleur-1";
        case "fail":
          return "couleur-3";
        case "missing":
          return "couleur-3";
        case "running":
          return "couleur-6";
        case "prevented":
        case "wrongXml":
          return "couleur-7";
      }
      return "couleur-4";
    },
  },
  computed: {
    style() {
      return {
        top: this.top,
        left: this.left,
      };
    },
  },
  directives: {
    "click-outside": clickOutside,
  },
  components: {
    //   VueTableDynamic,
  },
};
</script>
<style lang="scss">
.box-click-right {
  &__wrapper {
    z-index: 10;
  }
}
.table-detail {
  white-space: nowrap;

  p {
    white-space: nowrap;
    padding-bottom: 0;
    margin-bottom: 0;
  }
}
.couleur-1 {
  background: #00ff00;
}
.couleur-2 {
  background: #f1d952;
}
.couleur-3 {
  background: #ff0000;
}
.couleur-4 {
  background: #ffffff;
}
.couleur-5 {
  background: #ff0000;
}
.couleur-6 {
  background: #b3ffff;
}
.couleur-7 {
  background: #ffff00;
}
</style>