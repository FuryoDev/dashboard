<template>
  <div>
    <!-- <div id="emissions">
      <vue-table-dynamic  striped hover :params="params"  ref="table" ></vue-table-dynamic>
    </div> -->

    <div id="emissions" @click="contextMenu" @contextmenu.prevent="contextMenu">
      <b-table
        sticky-header
        class="sanssautdeligne"
        selected-variant="info"
        hover
        bordered
        small
        responsives
        ref="selectableTable"
        selectable
        @row-selected="onRowSelected"
        @row-contextmenu="openMenu"
        @row-clicked="SelectLigne"
        :items="this.$store.getters.emissions"
        :fields="fields"
        select-mode="range"
        aria-haspopup="true"
        aria-expanded="false"
        head-variant="dark"
      >
        <template #cell()="data">
          <p>{{ data.value }}</p>
        </template>

        <template #cell(preview)="data">
          <p v-if="data.value">1</p>
          <p v-if="!data.value">0</p>
          <!-- <p v-for="item in data.value" :key="item.code">{{item.code}} </p> -->
        </template>

        <template #cell(title)="data">
          <p
            class="text-truncate fixed-column"
            data-toggle="tooltip"
            data-placement="right"
            :title="getEpisodeTitre(data)"
          >
            {{ data.value }}
          </p>
          <!-- <p v-for="item in data.value" :key="item.code">{{item.code}} </p> -->
        </template>

        <template #cell(recordStatusTraitementItem.caseComment)="data">
          <p class="text-truncate" data-toggle="tooltip" data-placement="right">
            {{data.item.recordStatusTraitementItem?.caseComment,  }}
            {{ data.item.recordStatusTranscodageItem?.caseComment, }}
            {{ data.item.recordStatusPublicationItem?.caseComment }}
          </p>
          <!-- <p v-for="item in data.value" :key="item.code">{{item.code}} </p> -->
        </template>
        <template #cell(plannedDateTime)="data">
          <p>{{ getFormattedDate(data.value) }}</p>
          <!-- <p v-for="item in data.value" :key="item.code">{{item.code}} </p> -->
        </template>
        <template #cell(dateHeureDebutVisibilite)="data">
          <p>{{ getFormattedDate(data.value) }}</p>
          <!-- <p v-for="item in data.value" :key="item.code">{{item.code}} </p> -->
        </template>
        <template #cell(dateHeureDiffusion)="data">
          <p>{{ getFormattedDate(data.value) }}</p>
          <!-- <p v-for="item in data.value" :key="item.code">{{item.code}} </p> -->
        </template>
        <template #cell(statusEmission)="data">
          <div :class="getColorBgStatut(data.value)">
            <p>{{ data.value }}</p>
          </div>
        </template>
        <template #cell(recordStatusPublicationItem.useCase)="data">
          <div :class="getColorBgStatutPublication(data.value)">
            <p>{{ data.value }}</p>
          </div>
        </template>
        <template #cell(recordStatusTraitementItem.useCase)="data">
          <div :class="getColorBgStatutTraitement(data.value)">
            <p>{{ data.value }}</p>
          </div>
        </template>
        <template #cell(recordStatusTranscodageItem.useCase)="data">
          <div :class="getColorBgStatutTranscodage(data.value)">
            <p>{{ data.value }}</p>
          </div>
        </template>

        <template #cell(sourceClip.lastStatus)="data">
          <div :class="getColorBgStatut(data.value)">
            <p>{{ data.value }}</p>
          </div>
        </template>
        <template #cell(globalPubStatusName)="data">
          <div :class="getColorBgGlobalStatut(data.value)">
            <p>{{ getStatutDecoupeTextFr(data.value) }}</p>
          </div>
        </template>
        <template #cell(recordStatusPublicationItem.creationTimestamp)="data">
          <p>{{ getFormattedDate(data.value) }}</p>
        </template>
      </b-table>
    </div>

    <!-- Verification des métadonnées et fichiers à publier-->
    <b-modal
      v-model="showCheck"
      centered
      title="Vérification des métadonnées et fichiers à publier"
      title-tag="h3"
      size="xl"
      header-bg-variant="dark"
      header-close-variant="light"
      header-text-variant="light"
      content-class="custom-height"
    >
      <b-table
        class="tabverifemissions"
        bordered
        hover
        small
        sticky-header
        @row-clicked="onRowSelectedToCheck"
        head-variant="light"
        :items="this.$store.getters.emissionsToCheck"
        :fields="veriffields"
        select-mode="single"
        selected-variant="info"
        selectable
        aria-haspopup="true"
        aria-expanded="false"
        table-class="table-detail"
      >
        <template #cell()="data">
          <p>{{ data.value }}</p>
        </template>
        <!--   <template #cell(profil)="data">
          <p>{{ getplateform(data.value) }}</p>
           <div>
                            <p v-for="item in data.value" :key="item.code">{{item.code}} </p>
                          </div>
        </template>-->
        <template #cell(statut)="data">
          <p>
            <span :class="getIconColor(data.value)" class="material-icons">{{
              getIconName(data.value)
            }}</span>
          </p>
        </template>
      </b-table>

      <b-table
        class="tabverifoffer"
        bordered
        hover
        :items="this.infoOfOffers"
        :fields="fieldsOffers"
        sticky-header
        head-variant="light"
        select-mode="single"
        selected-variant="info"
        selectable
        small
        table-class="table-detail"
      >
        <template #cell(check)="data">
          <input
            type="checkbox"
            @click="updateCheckedPlateforme(data)"
            :checked="data.value"
          />
        </template>
      </b-table>

      <template #modal-footer>
        <div class="w-100">
          <b-button class="ml-2 float-right" @click="closeVerif()">
            Annuler
          </b-button>
          <b-button
            class="float-right"
            variant="primary"
            @click="sendToCheck()"
          >
            Vérifier
          </b-button>
        </div>
      </template>
    </b-modal>
    <!--Regeneration des sous titre -->
    <b-modal
      v-model="regenerateScreen"
      centered
      title="Régénération des sous-titres"
      title-tag="h3"
      size="xl"
      header-bg-variant="dark"
      header-close-variant="light"
      header-text-variant="light"
      content-class="custom-height"
    >
      <b-table
        class="tabverifemissions"
        bordered
        hover
        small
        sticky-header
        head-variant="light"
        :items="this.$store.getters.getProductToGenerate"
        :fields="veriffields"
        select-mode="single"
        selected-variant="info"
        selectable
        aria-haspopup="true"
        aria-expanded="false"
        table-class="table-detail"
      >
        <template #cell()="data">
          <p>{{ data.value }}</p>
        </template>
        <template #cell(statut)="data">
          <p>
            <span :class="getIconColor(data.value)" class="material-icons">{{
              getIconName(data.value)
            }}</span>
          </p>
        </template>
      </b-table>
      <template #modal-footer>
        <div class="w-100">
          <b-button class="ml-2 float-right" @click="closeRegenerate()">
            Annuler
          </b-button>
          <b-button
            class="float-right"
            variant="primary"
            @click="sendToRegenerate()"
          >
            Régénérer
          </b-button>
        </div>
      </template>
    </b-modal>

    <!-- Demande d'export des archives-->
    <b-modal
      v-model="showExport"
      centered
      size="xl"
      title="Demande d'export des archives"
      title-tag="h3"
      header-bg-variant="dark"
      header-close-variant="light"
      header-text-variant="light"
      content-class="custom-height"
    >
      <b-table
        class="tabexportemissions"
        bordered
        head-variant="light"
        hover
        small
        responsive
        sticky-header
        @row-clicked="onRowSelectedToExport"
        :items="this.$store.getters.emissionsToExport"
        :fields="veriffields"
        select-mode="multi"
        aria-haspopup="true"
        aria-expanded="false"
        table-class="table-detail"
      >
        <template #cell()="data">
          <p>{{ data.value }}</p>
        </template>
        <!-- <template #cell(profil)="data">
          <p>{{ getplateform(data.value) }}</p>
           <div>
                <p v-for="item in data.value" :key="item.code">{{item.code}} </p>
              </div>
        </template>-->
        <template #cell(statut)="data">
          <p>
            <span :class="getIconColor(data.value)" class="material-icons">{{
              getIconName(data.value)
            }}</span>
          </p>
        </template>
      </b-table>
      <!--  <b-table
        class="tabexportoffer"
        head-variant="light"
        bordered
        small
        sticky-header
        hover
        :items="this.$store.getters.offersExport.platformOffersCol"
        :fields="fieldsOffers"
        select-mode="multi"
        table-class="table-detail"
      >
        <template #cell(check)="data">
          <input
            type="checkbox"
            value="data.value"
            @click="updateCheckedPlateforme(data)"
            :checked="data.value"
          />
        </template>
      </b-table>-->

      <div class="optionexport w-25 ml-auto">
        <b-form-select
          v-model="choosedoptionexport"
          :options="optionexport"
          size="sm"
          class="mt-3"
        ></b-form-select>
        <label>
          <input class="mt-3" type="checkbox" v-model="IngestChecked" /> Forcer
          le re-traitement
        </label>
      </div>
      <div id="app"></div>
      <template #modal-footer>
        <div class="w-100">
          <b-button class="float-right ml-2" @click="closeExport()">
            Annuler
          </b-button>
          <b-button
            variant="primary ml-2"
            class="float-right mr-2"
            :disabled="clickOnConfirmer"
            @click="askToExport"
          >
            Confirmer
          </b-button>
        </div>
      </template>
    </b-modal>

    <!-- changement des statuts screen-->
    <b-modal
      v-model="showChangeStatus"
      centered
      title="Changement des statuts du traitement"
      title-tag="h3"
      size="xl"
      header-bg-variant="dark"
      header-text-variant="light"
      content-class="custom-height"
    >
      <b-table
        class="tabverifemissions"
        bordered
        hover
        small
        sticky-header
        head-variant="light"
        :items="this.$store.getters.emissionsToChangeStatus"
        :fields="statusChangefields"
        select-mode="single"
        selected-variant="info"
        selectable
        aria-haspopup="true"
        aria-expanded="false"
        table-class="table-detail"
      >
        <template #cell()="data">
          <p>{{ data.value }}</p>
        </template>
        <template #cell(statut)="data">
          <p>
            <span :class="getIconColor(data.value)" class="material-icons">{{
              getIconName(data.value)
            }}</span>
          </p>
        </template>
      </b-table>
      <div class="optionexport w-25 ml-auto">
        <b-form-select
          v-model="choosedoptionstatus"
          :options="optionstatus"
          size="sm"
          class="mt-3"
        ></b-form-select>
      </div>
      <template #modal-footer>
        <div class="w-100">
          <b-button class="ml-2 float-right" @click="closeChangeStatus()">
            Fermer
          </b-button>
          <b-button
            class="float-right"
            variant="primary"
            @click="sendToChangeStatus"
          >
            Changer
          </b-button>
        </div>
      </template>
    </b-modal>
    <!-- changement du délai de traitement -->
    <b-modal
      v-model="showChangeDelay"
      centered
      title="Changement du délais de traitement"
      title-tag="h3"
      size="xl"
      header-bg-variant="dark"
      header-text-variant="light"
      content-class="custom-height"
    >
      <b-table
        class="tabverifemissions"
        bordered
        hover
        small
        sticky-header
        head-variant="light"
        :items="this.$store.getters.emissionsToChangeDelay"
        :fields="DelayChangefields"
        select-mode="single"
        selected-variant="info"
        selectable
        aria-haspopup="true"
        aria-expanded="false"
        table-class="table-detail"
      >
        <template #cell()="data">
          <p>{{ data.value }}</p>
        </template>
        <template #cell(statut)="data">
          <p>
            <span :class="getIconColor(data.value)" class="material-icons">{{
              getIconName(data.value)
            }}</span>
          </p>
        </template>
      </b-table>
      <div class="optionexport w-25 ml-auto">
        <b-form-select
          v-model="choosedoptiondelay"
          :options="optionsdelay"
          size="sm"
          class="mt-3"
        ></b-form-select>
      </div>
      <template #modal-footer>
        <div class="w-100">
          <b-button class="ml-2 float-right" @click="closeChangeDelay()">
            Fermer
          </b-button>
          <b-button
            class="float-right"
            variant="primary"
            @click="sendToChangeDelay"
          >
            Changer
          </b-button>
        </div>
      </template>
    </b-modal>
    <!-- right click emission table-->
    <div class="box-click-right">
      <b-list-group
        v-if="viewMenu"
        class="box-click-right__wrapper w-25 position-fixed text-left"
        :style="style"
        v-click-outside="outside"
      >
        <b-list-group-item
          onMouseOver="this.style.cursor='pointer'"
          id="serie"
          @click="copyText('serie')"
        >
          Copier le n° de serie</b-list-group-item
        >
        <b-list-group-item
          onMouseOver="this.style.cursor='pointer'"
          id="episode"
          @click="copyText('episode')"
        >
          Copier le n° d'épisode</b-list-group-item
        >
        <b-list-group-item
          onMouseOver="this.style.cursor='pointer'"
          id="sgt"
          @click="copyText('id_record')"
          >Copier id record
        </b-list-group-item>
        <b-list-group-item
          onMouseOver="this.style.cursor='pointer'"
          id="stock"
          @click="copyText('stock')"
        >
          Copier le ° de stock</b-list-group-item
        >
        <b-list-group-item
          onMouseOver="this.style.cursor='pointer'"
          @click="showExportScreen"
          >Demande d'export des archives
        </b-list-group-item>
        <b-list-group-item
          onMouseOver="this.style.cursor='pointer'"
          @click="showVerifScreen"
          >Vérification avant traitement</b-list-group-item
        >
        <b-list-group-item
          onMouseOver="this.style.cursor='pointer'"
          @click="showRegenerateScreen"
          >Régénération des sous-titres
        </b-list-group-item>
        <b-list-group-item
          onMouseOver="this.style.cursor='pointer'"
          @click="showChangeStatutScreen"
          >Changement des statuts du traitement</b-list-group-item
        >
        <b-list-group-item
          onMouseOver="this.style.cursor='pointer'"
          @click="showDelayScreen"
          >Changement du délai de traitement</b-list-group-item
        >
      </b-list-group>
    </div>

    <!-- <div id="label" class="label text">{{ idepisode }} {{ titre }}</div> -->
    <b-alert show>
      <strong>Episode sélectionné:</strong> {{ idepisode }} {{ titre }}
    </b-alert>
  </div>
</template>

<script>
import axios from "axios";
import clickOutside from "../../Directives/clickOutside";
import moment from "moment";

export default {
  name: "emissions",
  data() {
    return {
      fields: [
        { key: "channel", label: "Chaine", sortable: true },
        { key: "plannedDateTime", label: "Date/heure", sortable: true },
        {
          key: "title",
          label: "Titre",
          sortable: true,
          tdClass: "widthemissioncol",
        },
        { key: "duree", label: "Durée", sortable: true },
        { key: "idEpisode", label: "Episode", sortable: true },
        // { key: "program_segment", label: "Segment", sortable: true },
        { key: "preview", label: "Preview", sortable: true },
        {
          key: "plateformOffers[0].startDateTime",
          formatter: (value) => {
            return value ? new Date(value).toLocaleString() : "";
          },
          label: "Début visib.",
          sortable: true,
        },
        { key: "plateformOffers[0].name", label: "Plateforme", sortable: true },
        //    { key: 'idStock', label: 'Stock' ,sortable: true},
        ///    { key: 'reconcileKey', label: 'Clé SGT' ,sortable: true},
        //     { key: 'estSousTitre', label: 'ST' },
        {
          key: "recordStatusTraitementItem.useCase",
          label: "Traitement",
          sortable: true,
        },
        {
          key: "recordStatusTraitementItem.caseComment",
          label: "Commentaire",
          sortable: true,
          tdClass: "widthemissioncommentairecol text-truncate",
        },
        {
          key: "recordStatusTraitementItem.scheduleDelay",
          label: "Délai",
          sortable: true,
        },
        {
          key: "recordStatusTraitementItem.createdBy",
          label: "Par",
          sortable: true,
        },
        {
          key: "recordStatusTranscodageItem.useCase",
          label: "Statut transcodage",
          sortable: true,
        },
        {
          key: "recordStatusTranscodageItem.transcodeProgress",
          label: "% transcod.",
          sortable: true,
        },
        {
          key: "recordStatusPublicationItem.useCase",
          label: "Publication",
        },
        {
          key: "recordStatusPublicationItem.creationTimestamp",
          label: "Date publication",
        },

        {
          key: "idStk",
          label: "PAD",
          sortable: true,
        },
      ],
      veriffields: [
        { key: "titre", label: "Titre", sortable: true },
        { key: "idEpisode", label: "Episode", sortable: true },
        { key: "profil", label: "Profile", sortable: true },
        { key: "statut", label: "", sortable: true },
        {
          key: "erreur",
          label: "Erreur",
          sortable: true,
          tdClass: "errorClass",
        },
      ],
      statusChangefields: [
        { key: "titre", label: "Titre", sortable: true },
        { key: "idEpisode", label: "Episode", sortable: true },
        { key: "traitement", label: "Traitement", sortable: true },
        { key: "statut", label: "", sortable: true },
      ],
      DelayChangefields: [
        { key: "titre", label: "Titre", sortable: true },
        { key: "idEpisode", label: "Episode", sortable: true },
        { key: "traitement", label: "Traitement", sortable: true },
        { key: "statut", label: "", sortable: true },
      ],
      exportfields: [
        { key: "titre", label: "Titre", sortable: true },
        { key: "idEpisode", label: "Episode", sortable: true },
        { key: "profil", label: "Profile", sortable: true },
        { key: "statut", label: "Statut", sortable: true },
        { key: "erreur", label: "Erreur", sortable: true },
      ],
      fieldsOffers: [
        //  { key: "check", label: "" },
        { key: "name", label: "Plateform" },
        { key: "offer", label: "Offre" },
        { key: "price", label: "Prix" },
        { key: "startdate", label: "Début" },
        { key: "endate", label: "Fin" },
        { key: "geoloc", label: "Territoire" },
        //   { key: "offers[0].oid", label: "oid" },
      ],
      dashboarditems: null,
      loading: true,
      idepisode: "",
      titre: "",
      showemission: false,
      showCheck: false,
      regenerateScreen: false,
      showChangeStatus: false,
      showChangeDelay: false,
      showExport: false,
      viewMenu: false,
      top: "0px",
      left: "0px",
      focusedItem: "",
      selected: [],
      generatedXml: "",
      generatedXmlsize: 0,
      statusChangeSize: 0,
      optionexport: ["vodstock", "vodauto"],
      choosedoptionexport: "vodstock",
      optionstatus: [
        "USER_FORCE_LINEAIRE",
        "TRAITEMENT_MANUEL",
        "FORCE_LINEAIRE",
        "EXPORT_PREVU",
        "ETAT_INITIAL",
      ],
      choosedoptionstatus: "USER_FORCE_LINEAIRE",
      choosedoptiondelay: 12,
      optionsdelay: [
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
        21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38,
        39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56,
        57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74,
        75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92,
        93, 94, 95, 96,
      ],
      listOffersToExport: [],
      listOffersToCheck: [],
      choosedoptionplateforme: [],
      clickOnConfirmer: false,
      statusChange: false,
      statusDelay: false,
      infoOfOffers: [],
      infojob: "",
      socket: null,
      messageToSend: "",
      messages: [],
      IngestChecked: false,
    };
  },
  computed: {
    notification() {
      return this.$store.state.socket.message;
    },
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
  mounted() {},
  methods: {
    refreshDashBoard(emtomodif, index, newelt) {
      switch (newelt.traitementType) {
        case 1:
          if (emtomodif.recordStatusTraitementItem) {
            emtomodif.recordStatusTraitementItem.useCase = newelt.status;
            emtomodif.recordStatusTraitementItem.caseComment = newelt.message;
          } else {
            emtomodif["recordStatusTraitementItem"] = {
              useCase: newelt.status,
              caseComment: newelt.message,
            };
          }

          break;
        case 2:
          if (emtomodif.recordStatusTranscodageItem) {
            emtomodif.recordStatusTranscodageItem.useCase = newelt.status;
            emtomodif.recordStatusTranscodageItem.transcodeProgress =
              newelt.progress;
            emtomodif.recordStatusTranscodageItem.caseComment = newelt.message;
          } else {
            emtomodif["recordStatusTranscodageItem"] = {
              useCase: newelt.status,
              caseComment: newelt.message,
              transcodeProgress: newelt.progress,
            };
          }
          this.updateJobs(newelt);
          emtomodif.recordStatusTranscodageItem.useCase = newelt.status;
          emtomodif.recordStatusTranscodageItem.transcodeProgress =
            newelt.progress;
          emtomodif.recordStatusTranscodageItem.caseComment = newelt.message;
          break;
        case 3:
          if (emtomodif.recordStatusPublicationItem) {
            emtomodif.recordStatusPublicationItem.useCase = newelt.status;
            emtomodif.recordStatusPublicationItem.caseComment = newelt.message;
            emtomodif.recordStatusPublicationItem.creationTimestamp =
              newelt.creation;
          } else {
            emtomodif["recordStatusPublicationItem"] = {
              useCase: newelt.status,
              caseComment: newelt.message,
              creationTimestamp: newelt.creation,
            };
          }

          break;
      }
      const oldem = this.$store.getters.emissions;
      oldem[index] = emtomodif;
      this.$store.commit("setSelectedEmissions", oldem);
      this.$forceUpdate();
    },
    updateJobs(newelt) {
      for (let i = 0; i < this.$store.getters.jobs.length; i++) {
        if (this.$store.getters.jobs[i].id == newelt.id) {
          this.$store.getters.jobs[i].lastStatus = newelt.status;
          this.$store.getters.jobs[i].lastProgressValue = newelt.progress;
        }
      }
    },

    testclavier() {
      //console.log("change")
    },
    closeVerif() {
      this.$emit("rechautoevent", "activerechauto");
      this.showCheck = false;
      this.initStatus(this.$store.getters.emissionsToCheck);
    },
    closeRegenerate() {
      this.regenerateScreen = false;
      this.initStatus(this.$store.getters.getProductToGenerate);
    },
    closeChangeStatus() {
      this.$emit("rechautoevent", "activerechauto");
      this.showChangeStatus = false;
      this.initStatus(this.$store.getters.emissionsToChangeStatus);
      if (this.statusChange) {
        this.$emit("statusChangeEvent");
        this.statusChange = false;
      }
    },
    closeChangeDelay() {
      this.$emit("rechautoevent", "activerechauto");
      this.showChangeDelay = false;
      this.initStatus(this.$store.getters.emissionsToChangeStatus);
      if (this.statusChange) {
        this.$emit("statusChangeEvent");
        this.statusChange = false;
      }
    },
    closeExport() {
      this.$emit("rechautoevent", "activerechauto");
      this.showExport = false;
      this.IngestChecked = false;
      this.initStatus(this.$store.getters.emissionsToExport);
      this.$emit("statusChangeEvent");
    },
    getIconColor(data) {
      //console.log("je rentre = "+ data)
      switch (data) {
        case true:
        case "error":
          return "text-danger";
        case "warning":
          return "text-info";
        case false:
        case "success":
          return "text-success";
      }
      return "";
    },
    getIconName(data) {
      switch (data) {
        case true:
        case "error":
          return "error";
        case "warning":
          return "warning";
        case false:
        case "success":
          return "check_circle";
      }
      return data;
    },
    getStatusColor(status) {
      switch (status) {
        case "ECHEC":
          return "text-danger";
        case "fail":
          return "text-danger";
        case "ACCOMPLI":
          return "text-success";
        case "OK":
          return "text-success";
      }
      return "text-dark";
    },

    getColorBgStatut(data) {
      switch (data) {
        case "ACCOMPLI":
        case "TERMINE":
          return "couleur-1";
        case "ANNULE":
          return "couleur-2";
        case "ECHEC":
        case "ERREUR":
        case "BLOQUE":
          return "couleur-3";
      }
      return "couleur-4";
    },
    getColorBgStatutPublication(data) {
      switch (data) {
        case "Publié":
        case "Revoke":
          return "couleur-1";
        case "Empêchée":
        case "XML invalide":
          return "couleur-2";
        case "Echec":
          return "couleur-3";
        case "En cours":
        case "En attente":
          return "couleur-7";
      }
      return "couleur-4";
    },
    getColorBgStatutTraitement(data) {
      switch (data) {
        case "EXPORT_TERMINE":
        case "FASTCATCH_TERMINEE":
          return "couleur-1";
        case "FORCE_LINEAIRE":
        case "FORCE_LINEAIRE_PREVU":
          return "couleur-2";
        case "EXPORT_ECHEC":
        case "FASTCATCH_ECHEC":
          return "couleur-3";
        case "EXPORT_DEMANDE":
        case "EXPORT_EN_COURS":
        case "FASTCATCH_EN_COURS":
          return "couleur-7";
        case "USER_FORCE_LINEAIRE":
        case "TRAITEMENT_MANUEL":
          return "couleur-8";
      }
      return "couleur-4";
    },
    getColorBgStatutTranscodage(data) {
      switch (data) {
        case "TRANSCODAGE_TERMINE":
          return "couleur-1";
        case "TRANSCODAGE_ANNULE":
          return "couleur-2";
        case "TRANSCODAGE_ECHEC":
          return "couleur-3";
        case "TRANSCODAGE_EN_COURS":
          return "couleur-7";
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
    getEpisodeTitre(data) {
      return (
        "Titre: " + data.item.title + " - Sous-titre: " + data.item.subTitle
      );
    },
    getFormattedDate(proposeddate) {
      //  console.log(proposeddate)
      if (proposeddate == "") {
        return "";
      } else {
        var date = new Date(proposeddate);
        return moment(date, "YYYY-MM-DD H:mm").format("DD/MM/YYYY H:mm");
      }
    },

    getLocalDate(proposeddate) {
      //  console.log(proposeddate)
      if (proposeddate == "") {
        return "";
      } else {
        var date = new Date(proposeddate);
        return moment(date, "YYYY-MM-DD H:mm").format("DD/MM/YYYY H:mm");
      }
    },
    getplateform(data) {
      let plateforms = "";
      console.log("date = " + JSON.stringify(data));
      for (let index = 0; index < data.length; index++) {
        plateforms += data[index].name + ", ";
      }

      return plateforms;
    },
    /*   getstatuttraitement(data) {
      let traitement = "";
    
      if(data !== null){
        if(data.treatmentType == 1){
          console.log("------------------------------------------------------- "+data.treatmentType)
           traitement =data.useCase;
        }
        
      
      }
      return traitement;
    },
    getstatutpublication(data)  {
      let publication = "";
        if(data.recordStatusItem !== null){
        if(data.recordStatusItem.treatmentType == 3){
          console.log("------------------------------------------------------- "+data.recordStatusItem.treatmentType)
           publication =data.recordStatusItem.useCase;
        }
        }
      
   
      return publication;
    },*/

    contextMenu() {},
    outside() {
      this.viewMenu = false;
    },
    setMenu(top, left) {
      this.top = `${top}px`;
      this.left = `${left}px`;
    },
    closeMenu() {
      this.viewMenu = false;
    },
    openMenu(item, index, e) {
      this.focusedItem = item;
      this.viewMenu = true;
      this.setMenu(e.y, e.x);
      e.preventDefault();
    },
    copyText(type) {
      this.viewMenu = false;
      const el = document.createElement("textarea");

      switch (type) {
        case "reconcile":
          el.value = this.focusedItem.reconcileKey;

          break;
        case "sgt":
          // console.log(JSON.stringify(this.focusedItem))
          el.value = this.focusedItem.sgtKey;
          break;
        case "episode":
          el.value = this.focusedItem.idEpisode;

          break;
        case "serie":
          //console.log(JSON.stringify(this.focusedItem.idSerie.length));
          el.value =
            this.focusedItem.idSerie.length > 0
              ? this.focusedItem.idSerie
              : this.focusedItem.idEpisode;

          break;
        case "stock":
          el.value = this.focusedItem.idStk;

          break;
        case "id_record":
          el.value = this.focusedItem.idRecord;
          break;
      }
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    },
    showVerifScreen: function () {
      this.$emit("rechautoevent", "stoprechauto");
      this.viewMenu = false;
      this.showCheck = true;
      this.$store.commit("setOffersCheck", []);
      //    this.$store.commit('setOffersToCheck', []);
      this.listOffersToCheck = [];
    },
    showRegenerateScreen: function () {
      this.viewMenu = false;
      this.regenerateScreen = true;
      //   this.$store.commit("setProductToGenerate", []);
      this.listOffersToCheck = [];
    },
    showExportScreen() {
      this.$emit("rechautoevent", "stoprechauto");
      this.viewMenu = false;
      this.clickOnConfirmer = false;
      this.generatedXmlsize = 0;
      this.showExport = true;
      this.IngestChecked = false;
      this.$store.commit("setOffersExport", []);
      // this.$store.commit('setOffersToExport', []);
      this.listOffersToExport = [];
    },
    showChangeStatutScreen: function () {
      this.statusChangeSize = 0;
      this.$emit("rechautoevent", "stoprechauto");
      this.viewMenu = false;
      this.showChangeStatus = true;
      this.$store.commit("setOffersCheck", []);
      //    this.$store.commit('setOffersToCheck', []);
      this.listOffersToCheck = [];
      //   this.getListOffersToChangeStatus();
    },
    showDelayScreen: function () {
      this.$emit("rechautoevent", "stoprechauto");
      this.viewMenu = false;
      this.showChangeDelay = true;
      this.$store.commit("setOffersCheck", []);
      //    this.$store.commit('setOffersToCheck', []);
      this.listOffersToCheck = [];
      //   this.getListOffersToChangeStatus();
    },
    createNewElementCheck: function (item) {
      return {
        id: item.recordStatusTraitementItem
          ? item.recordStatusTraitementItem.id
          : -1,
        titre: item.title,
        idEpisode: item.idEpisode,
        id_record: item.idRecord,
        creationTimestamp: item.recordStatusTraitementItem
          ? item.recordStatusTraitementItem.creationTimestamp
          : "",
        traficId: item.sgtKey,
        recordvodxmlid: item.plateformOffers[0].recordvodxmlid,
        sourceClip: item.sourceClip,
        itemId: item.itemId,
        reference: item.plateformOffers[0].caseReferenceExterne,
        treatmentType: item.recordStatusTraitementItem
          ? item.recordStatusTraitementItem.treatmentType
          : -1,
        scheduleDelay: item.recordStatusTraitementItem
          ? item.recordStatusTraitementItem.scheduleDelay
          : -1,
        platformOffersCol: item.platformOffersCol,
        reconcileKey: item.reconcileKey,
        profil: item.plateformOffers[0].name,
        item: item,
        traitement: item.recordStatusTraitementItem
          ? item.recordStatusTraitementItem.useCase
          : "",
        chexplateforme: [],
        statut: "",
        erreur: "",
      };
    },
    createNewElementToGenerate: function (item) {
      return {
        id: item.recordStatusTraitementItem
          ? item.recordStatusTraitementItem.id
          : -1,
        titre: item.title,
        idEpisode: item.idEpisode,
        id_record: item.idRecord,
        statut: "",
        erreur: "",
      };
    },
    elementexist: function (element, elementsList) {
      for (let index = 0; index < elementsList.length; index++) {
        if (element == elementsList[index].idEpisode) {
          return true;
        }
      }
      return false;
    },
    onRowSelected(items) {
      this.selected = items;

      let elementsTocheck = [];
      let elementsToExport = [];
      let elementsToChangeStatus = [];
      let elementsToChangeDelay = [];
      let elementsToGenerate = [];
      this.$store.commit("setSelectedEmissions", items);
      for (let index = 0; index < items.length; index++) {
        //  console.log("element selected = "+ JSON.stringify(items[index]))

        let element = this.createNewElementCheck(items[index]);
        elementsTocheck.push(element);

        //   console.log('je vais rajouter = '+ JSON.stringify(element))
      }
      for (let index = 0; index < items.length; index++) {
        let element = this.createNewElementCheck(items[index]);
        elementsToExport.push(element);
      }
      for (let index = 0; index < items.length; index++) {
        let element = this.createNewElementCheck(items[index]);
        elementsToChangeStatus.push(element);

        //   console.log('je vais rajouter = '+ JSON.stringify(element))
      }
      for (let index = 0; index < items.length; index++) {
        let element = this.createNewElementCheck(items[index]);
        elementsToChangeDelay.push(element);

        //  console.log('je vais rajouter = '+ JSON.stringify(element))
      }
      for (let index = 0; index < items.length; index++) {
        let element = this.createNewElementCheck(items[index]);
        elementsToGenerate.push(element);

        //  console.log('je vais rajouter = '+ JSON.stringify(element))
      }
      this.$store.commit("setEmissionsToCheck", elementsTocheck);
      this.$store.commit("setEmissionsToExport", elementsToExport);
      this.$store.commit("setEmissionsToChangeStatus", elementsToChangeStatus);
      this.$store.commit("setEmissionsTochangeDelay", elementsToChangeDelay);
      this.$store.commit("setProductToGenerate", elementsToGenerate);

      //  console.log('taille generate= '+ elementsToGenerate.length+" et "+ JSON.stringify(this.$store.getters.getProductToGenerate));
    },

    onRowSelectedToCheck(items) {
      this.infoOfOffers = [];
      this.$store.getters.OffersToCheck.forEach((element) => {
        if (element.idEpisode == items.idEpisode) {
          this.$store.commit("setOffersCheck", element);
        }
      });

      this.infoOfOffers.push({
        name: items.item.plateformOffers[0].name,
        offer: items.item.plateformOffers[0].offerName,
        price: items.item.plateformOffers[0].priceCode,
        startdate: items.item.plateformOffers[0].startDateTime,
        endate: items.item.plateformOffers[0].endDateTime,
        geoloc: items.item.plateformOffers[0].territoire,
      });
      console.log("offer info  : " + JSON.stringify(this.infoOfOffers));
    },
    onRowSelectedToExport(items) {
      this.$store.getters.OffersToExport.forEach((element) => {
        if (element.idEpisode == items.idEpisode) {
          this.$store.commit("setOffersExport", element);
        }
      });
    },
    /*  onRowSelectedToGenerate(items) {
      this.$store.getters.getProductToGenerate.forEach((element) => {
           console.log("item =", element, items)
      });
    },*/
    updateCheckedPlateforme(data) {
      if (data.item.check) {
        data.item.check = false;
      } else {
        data.item.check = true;
      }
    },
    SelectLigne: function (items) {
      this.$emit("update-selected-ligne", items);
      this.idepisode = items.idEpisode;
      this.titre = items.title;
      this.$store.commit("setOffers", []);
      this.$store.commit("setJobs", []);
      this.getOffers(items);
      this.getJobs(items);
      this.getSegments(items);
      this.getSousTitres(items);
    },
    updateSelectLigne(items) {
      //  console.log('updateSelectLigne')
      console.log("je redemande les offres" + JSON.stringify(items));
      this.getJobs(items);
    },
    getOffers: function (record) {
      // console.log("je vais chercher les offres" + JSON.stringify(record.plateformOffers));
      this.$store.commit("setOffers", record.plateformOffers);
    },
    getJobs: function (record) {
      // let episodeId = record.idEpisode;
      let transcodageList = [];
      axios
        .get(
          this.$store.getters.getUrlBaseService +
            "transcode/service/status/" +
            record.idRecord
        )
        .then(
          (result) => {
            for (let i = 0; i < result.data.length; i++) {
              let traitementelt = {};
              traitementelt.profileName = record.plateformOffers[0].name;
              traitementelt.offer = record.plateformOffers[0].offerName;
              //  console.log("elemenet = "+JSON.stringify(result.data[i]));
              traitementelt.lastStatus = result.data[i].status;
              traitementelt.lastProgressValue = result.data[i].progress;
              traitementelt.endDate = result.data[i].end;
              traitementelt.startDate = result.data[i].start;
              traitementelt.comment = result.data[i].message;
              traitementelt.requester = result.data[i].user;
              traitementelt.guid = result.data[i].jobGuid;
              traitementelt.id = result.data[i].id;
              //  console.log("elemenettraitement = "+JSON.stringify(traitementelt));
              //  console.log("liste = "+JSON.stringify( transcodageList));
              transcodageList.push(traitementelt);

              //console.log("liste = "+JSON.stringify( transcodageList))
            }
          },
          (error) => {
            console.error(error);
          }
        )
        .finally(() => (this.loading = false));
      // console.log("la liste des transcodage = "+transcodageList )
      this.$store.commit("setJobs", transcodageList);
    },
    getSegments: function (record) {
      axios
        .get(
          this.$store.getters.getUrlBaseService +
            "restore/service/segment/" +
            record.idRecord
        )
        .then(
          (result) => {
            this.$store.commit("setSegments", result.data);
          },
          (error) => {
            console.error(error);
          }
        )
        .finally(() => (this.loading = false));
    },
    getSousTitres: function (record) {
      axios
        .get(
          this.$store.getters.getUrlBaseService +
            "subtitle/service/medias/episode/" +
            record.idEpisode
        )
        .then(
          (result) => {
            this.$store.commit("setSousTitres", result.data);
          },
          (error) => {
            console.error(error);
          }
        )
        .finally(() => (this.loading = false));
    },
    getInfoJob(item) {
      console.log("getInfoJob", item);
      axios
        .get(
          this.$store.getters.getUrlBaseService +
            "transcode/service/status/" +
            item.id_record
        )

        .then(
          (result) => {
            this.infojob = result.data;
            this.getVerifAnswer(result.data[0]);
          },
          (error) => {
            console.error(error);
          }
        )
        .finally(() => (this.loading = false));
    },
    getVerifAnswer(element) {
      axios
        .post(
          this.$store.getters.getUrlBaseService +
            "distribution/service/checkup/" +
            element.id
        )
        .then(
          (result) => {
            let answerCheck = {
              status: result.data.success ? "success" : "error",
              comment: result.data.message,
              key: element.platform.record.episodeId,
            };

            this.updateStatusCheck(answerCheck);
          },
          (error) => {
            console.error(error);
          }
        )
        .finally(() => (this.loading = false));
    },
    createElementTockeck(object) {
      let date = new Date(object.item.broadcastDateTime);
      return {
        name: object.item.plateformOffers[0].name,
        offerName: object.offerName,
        recordId: object.item.idRecord,
        vodDay: date.getTime(),
        signaletique: {
          CSA: "",
          pp: "",
        },
        record: {
          mediaId: object.item.idStk,
          episodeId: object.idEpisode,
          title: object.titre,
        },
      };
    },
    sendToCheck() {
      document.body.classList.add("busy-cursor");

      let listElementToCheck = [];
      for (
        let index = 0;
        index < this.$store.getters.emissionsToCheck.length;
        index++
      ) {
        listElementToCheck.push(
          this.createElementTockeck(this.$store.getters.emissionsToCheck[index])
        );
      }

      axios
        .post(
          this.$store.getters.getUrlBaseService +
            "distribution/service/checkup",
          listElementToCheck
        )
        .then(
          (result) => {
            //let iterator1 = result.data.keys();
            Object.keys(result.data).forEach((key) => {
              let answerCheck = {
                status: result.data[key].success ? "success" : "error",
                comment: result.data[key].message,
                key: key,
              };

              this.updateStatusCheck(answerCheck);
            });

            document.body.classList.remove("busy-cursor");
          },
          (error) => {
            console.error(error);
          }
        )
        .finally(() => (this.loading = false));
      //this.checkElements(listElementToCheck);
      //   document.body.classList.remove("busy-cursor");
    },
    sendToRegenerate() {
      document.body.classList.add("busy-cursor");
      let listElementToRegenerate = [];
      for (
        let index = 0;
        index < this.$store.getters.getProductToGenerate.length;
        index++
      ) {
        listElementToRegenerate.push(
          this.$store.getters.getProductToGenerate[index].id_record
        );
      }

      axios
        .post(
          this.$store.getters.getUrlBaseService + "restore/service/subtitling",
          listElementToRegenerate
        )
        .then(
          (result) => {
            // console.log("resultat = "+JSON.stringify(result.data))
            Object.keys(result.data).forEach((key) => {
              let answerGenerate = {
                status:
                  result.data[key].statusCode == 200 ? "success" : "error",
                comment: result.data[key].message,
                key: key,
              };

              this.updateStatusGenerate(answerGenerate);
            });

            document.body.classList.remove("busy-cursor");
          },
          (error) => {
            console.error(error);
          }
        )
        .finally(() => (this.loading = false));
      //  console.log("liste recode id = ",listElementToRegenerate )
      //   document.body.classList.remove("busy-cursor");
    },

    updateStatusCheck(answerCheck) {
      for (
        let index = 0;
        index < this.$store.getters.emissionsToCheck.length;
        index++
      ) {
        if (
          this.$store.getters.emissionsToCheck[index].id_record ==
          answerCheck.key
        ) {
          this.$store.getters.emissionsToCheck[index].statut =
            answerCheck.status;
          this.$store.getters.emissionsToCheck[index].erreur =
            answerCheck.comment;
          break;
        }
      }
    },
    updateStatusGenerate(answerGenerate) {
      for (
        let index = 0;
        index < this.$store.getters.getProductToGenerate.length;
        index++
      ) {
        if (
          this.$store.getters.getProductToGenerate[index].id_record ==
          answerGenerate.key
        ) {
          this.$store.getters.getProductToGenerate[index].statut =
            answerGenerate.status;
          this.$store.getters.getProductToGenerate[index].erreur =
            answerGenerate.comment;
          break;
        }
      }
    },
    sendToChangeStatus() {
      document.body.classList.add("busy-cursor");
      //console.log("valuer = " + this.choosedoptionstatus);
      this.statusChange = true;
      for (
        let index = 0;
        index < this.$store.getters.emissionsToChangeStatus.length;
        index++
      ) {
        //changement statut dashboard
        let emission = this.$store.getters.emissionsToChangeStatus[index].item;
        emission.recordStatusTraitementItem =
          emission.recordStatusTraitementItem || {};
        let recordStatus = emission.recordStatusTraitementItem;
        recordStatus.useCase =
          this.choosedoptionstatus == "ETAT_INITIAL"
            ? null
            : this.choosedoptionstatus;
        recordStatus.createdBy = this.$store.getters.user.username;

        axios
          .post(
            `${this.$store.getters.getUrlBaseService}lava/recordstatus/update/${emission.vodType}/${emission.idRecord}?clean=true`,
            recordStatus
          )
          .then(
            (result) => {
              this.updateStatusChangeFronted(
                result.status,
                this.$store.getters.emissionsToChangeStatus[index].id_record
              );
            },
            (error) => {
              this.updateStatusChangeFronted(
                400,
                this.$store.getters.emissionsToChangeStatus[index].itemId.id
              );
              console.error(error);
            }
          )
          .finally(() => {
            this.loading = false;
            document.body.classList.remove("busy-cursor");
          });

        //remontee de statut whatson
        this.statusChangeSize++;
      }
    },
    sendToChangeDelay() {
      document.body.classList.add("busy-cursor");
      this.statusChange = true;
      for (
        let index = 0;
        index < this.$store.getters.emissionsToChangeDelay.length;
        index++
      ) {
        let emission = this.$store.getters.emissionsToChangeDelay[index].item;
        emission.recordStatusTraitementItem =
          emission.recordStatusTraitementItem || {};
        let recordStatus = emission.recordStatusTraitementItem;
        recordStatus.scheduleDelay = this.choosedoptiondelay;
        recordStatus.createdBy = this.$store.getters.user.username;
        axios
          .post(
            `${this.$store.getters.getUrlBaseService}lava/recordstatus/update/${emission.vodType}/${emission.idRecord}`,
            recordStatus
          )
          .then(
            (result) => {
              console.log("sucess = " + result.data);
              this.updateStatusDelayFronted(
                result.status,
                this.$store.getters.emissionsToChangeDelay[index].id_record
              );
              document.body.classList.remove("busy-cursor");
            },
            (error) => {
              console.log("echec = " + error.data);
              this.updateStatusDelayFronted(
                400,
                this.$store.getters.emissionsToChangeDelay[index].id
              );
              document.body.classList.remove("busy-cursor");
              console.error(error);
            }
          )
          .finally(() => (this.loading = false));

        this.statusChangeSize++;
      }
    },
    updateStatusChangeFronted(answerChange, id_record) {
      let answerTag = "";
      if (answerChange == 200) {
        answerTag = "success";
      } else {
        answerTag = "error";
      }
      for (
        let index = 0;
        index < this.$store.getters.emissionsToChangeStatus.length;
        index++
      ) {
        if (
          this.$store.getters.emissionsToChangeStatus[index].id_record ==
          id_record
        ) {
          console.log();
          this.$store.getters.emissionsToChangeStatus[index].statut = answerTag;
          //  this.$store.getters.emissionsToChangeStatus[index].erreur =    answerChange.comment;
          break;
        }
      }
    },
    updateStatusDelayFronted(answerChange, id_record) {
      let answerTag = "";
      if (answerChange == 200) {
        answerTag = "success";
      } else {
        answerTag = "error";
      }
      for (
        let index = 0;
        index < this.$store.getters.emissionsToChangeDelay.length;
        index++
      ) {
        //   console.log(this.$store.getters.emissionsToChangeDelay[index].id_record +" et "+id_record )
        if (
          this.$store.getters.emissionsToChangeDelay[index].id_record ==
          id_record
        ) {
          //    console.log()
          this.$store.getters.emissionsToChangeDelay[index].statut = answerTag;
          //  this.$store.getters.emissionsToChangeStatus[index].erreur =    answerChange.comment;
          break;
        }
      }
    },
    askToExport() {
      this.clickOnConfirmer = true;
      document.body.classList.add("busy-cursor");
      //this.generatedXmlsize = 0;
      //this.$store.commit("setGeneratedXmlInitial");
      //this.createPayloadXml();
      this.sendExportRequest();
    },

    sendExportRequest() {
      // console.log("la liste des items = "+JSON.stringify(this.$store.getters.emissionsToExport) )
      const jobList = [];
      const offersToExport = this.$store.getters.emissionsToExport;
      for (let index = 0; index < offersToExport.length; index++) {
        jobList.push(offersToExport[index].item);
      }
      //   console.log("les element a exporter = "+JSON.stringify(jobList) )
      axios
        .post(
          this.$store.getters.getUrlBaseService +
            "archive/service/restore/" +
            this.choosedoptionexport +
            "/" +
            this.IngestChecked,
          jobList
        )
        .then(
          (result) => {
            this.updateStatusFronted(result.data);
            document.body.classList.remove("busy-cursor");

            console.log("success " + JSON.stringify(result.data));
          },
          (error) => {
            console.error(error);
          }
        )
        .finally(() => (this.loading = false));
    },
    createPayloadXml() {
      //console.log('new xml = '+ this.generatedXmlsize)
      //console.log('offertoexepoetr = '+ JSON.stringify(this.$store.getters.OffersToExport))
      var builder = require("xmlbuilder");
      var root = builder.create("exportRequests");
      root.ele("destination", this.choosedoptionexport);
      root.ele("jourVod", this.$store.getters.jourVod);
      root.ele("priority", 5);
      root.ele("author", "neno");
      root.ele("email", "neno@rtbf.be");
      var elmt = root.ele("episodePlatformOffersCollection");
      //console.log('size of table = '+this.$store.getters.OffersToExport.length)
      for (
        let index = 0;
        index < this.$store.getters.OffersToExport.length;
        index++
      ) {
        var element = elmt.ele("episodePlatformOffers", {
          idEpisode: this.$store.getters.OffersToExport[index].idEpisode,
          jourVod: this.$store.getters.jourVod,
        });
        // console.log(' ***************** = ' )
        for (
          let i = 0;
          i <
          this.$store.getters.OffersToExport[index].platformOffersCol.length;
          i++
        ) {
          if (
            this.$store.getters.OffersToExport[index].platformOffersCol[i].check
          ) {
            var subelement = element.ele("platformOffers", {
              platform_name:
                this.$store.getters.OffersToExport[index].platformOffersCol[i]
                  .platform,
            });

            subelement.ele("offer", {
              offer_oid:
                this.$store.getters.OffersToExport[index].platformOffersCol[i]
                  .offers[0].oid,
              offerName:
                this.$store.getters.OffersToExport[index].platformOffersCol[i]
                  .offers[0].name,
            });
          }
        }

        this.generatedXml = root;
        this.generatedXmlsize++;
        //  console.log('increment = '+this.generatedXmlsize)
      }
    },
    updateStatusFronted(items) {
      if (items) {
        for (let i = 0; i < this.$store.getters.emissionsToExport.length; i++) {
          this.$store.getters.emissionsToExport[i].statut = "success";
        }
      } else {
        for (let i = 0; i < this.$store.getters.emissionsToExport.length; i++) {
          this.$store.getters.emissionsToExport[i].statut = "error";
        }
      }
    },
    initStatus(tabToInit) {
      for (let index = 0; index < tabToInit.length; index++) {
        tabToInit[index].statut = "";
        tabToInit[index].erreur = "";
      }
    },
  },

  watch: {
    notification(newValue) {
      //  console.log("Message from server ", JSON.stringify(newValue));
      if (newValue) {
        newValue.forEach((elt) => {
          const matchingElements = this.$store.getters.emissions
            .map((em, index) => ({ em, index }))
            .filter((item) => item.em.idRecord == elt.recordId);
          if (matchingElements.length > 0) {
            this.refreshDashBoard(
              matchingElements[0].em,
              matchingElements[0].index,
              elt
            );
          }
        });
      }
    },
    "$store.getters.generatedXml.success": function (newvalue) {
      newvalue && this.sendExportRequest();
    },
    generatedXmlsize: function (newvalue) {
      if (
        newvalue &&
        newvalue == this.$store.getters.emissionsToExport.length
      ) {
        this.$store.commit("setGeneratedXml", this.generatedXml);
        //  console.log('generatedxml = '+ newvalue)
      }
    },
    statusChangeSize: function (newvalue) {
      if (
        newvalue &&
        newvalue == this.$store.getters.emissionsToChangeStatus.length
      ) {
        //this.updateReasonReject(this.$store.getters.emissionsToChangeStatus);
        //  console.log(' statusChangeSize = '+ newvalue)
      }
    },
    listOffersToExport: function (newvalue) {
      if (
        newvalue &&
        newvalue.length == this.$store.getters.emissionsToExport.length
      ) {
        this.initStatus(this.$store.getters.emissionsToExport);
        this.$store.commit("setOffersToExport", newvalue);

        // console.log('changement = '+ newvalue.length);
      }
    },
    listOffersToCheck: function (newvalue) {
      if (
        newvalue &&
        newvalue.length == this.$store.getters.emissionsToCheck.length
      ) {
        this.initStatus(this.$store.getters.emissionsToCheck);
        // console.log(JSON.stringify(newvalue))
        this.$store.commit("setOffersToCheck", newvalue);
      }
    },
  },
  components: {},
};
</script>

<style lang="scss" >
.sanssautdeligne {
  white-space: nowrap;

  min-height: calc(45vh - 10px);
  margin-bottom: 10px !important;

  p {
    white-space: nowrap;
    padding-bottom: 0;
    margin-bottom: 0;
  }
}

body.busy-cursor {
  cursor: progress;
}

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

.custom-height {
  max-height: 80vh;
  min-height: 80vh;
}
.custom-width {
  min-width: 80%;
}
.couleur-1 {
  background: #00ff00;
}
.couleur-2 {
  background: #f0a80d;
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
.couleur-8 {
  background: #96dff5;
}
.couleur-9 {
  background: #96dff5;
}

.errorClass {
  width: 1000px;
}
.tabverifemissions {
  min-height: 38vh !important;
  max-height: 38vh !important;
}
.tabverifoffer {
  max-height: 22vh !important;
  min-height: 22vh !important;
}
.tabexportemissions {
  min-height: 32vh !important;
  max-height: 32vh !important;
}
.tabexportoffer {
  max-height: 22vh !important;
  min-height: 22vh !important;
}
.widthemissioncol {
  max-width: 200px !important;
}
.widthemissioncommentairecol {
  max-width: 600px !important;
}
.fixed-column {
}
</style>
