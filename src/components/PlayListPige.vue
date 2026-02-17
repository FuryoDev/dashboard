<template>

<b-row>

            <b-col class="sizedivslist">
             
              <b-container fluid>
                <b-row align-v="center">
                  
                  <b-col>
                   
                    <div class="playlistpige">
                      <header class="header  mb-2 bg-dark py-2">
                           <b-col><div class="text-left">PlayList De La pige </div></b-col>
                      </header>
                            <b-table
                            class="sanssautdeligne"
                            selected-variant="info"
                          
                              sticky-header="75vh"
                              bordered
                            
                              small
                            
                              responsives
                              ref="selectableTable"
                              selectable
                              select-mode="range"
                              @row-selected="onRowSelected"
                              
                            
                            
                              aria-haspopup="true"
                              aria-expanded="false"
                            
                              head-variant="light"
                              :items="this.$store.getters.searchcriteria.data"
                              :fields="fields"
                        
                            
                            >
                      
                            
                            <template #cell(date)>
                              <p>{{ date }}</p>
                            </template>
                            <template #cell(segment)="data">
                                  <b-form-input class="input-group"
                                    type="number"
                                    v-model="data.item.segment"
                                  />
                                </template>
                            <template #cell(chaine)>
                              <p>{{ chaine }}</p>
                            </template>
                            </b-table>
                          </div>

                  </b-col>
                </b-row>
              </b-container>
         
            </b-col>
        
            
           <b-col class="mt-4">
             
              <b-row   align-v="center"><b-button size="sm" variant="dark" class=" mb-2 mt-2"   @click="clickdrag()"  type="submit" >
                   <b-icon class=""  icon="chevron-double-right"></b-icon>Ajouter</b-button>
                  
              </b-row>
              <b-row align-v="center"><b-button size="sm" variant="dark"  @click=" clickdrop()"  type="submit" >
                   <b-icon class="" icon="chevron-double-left"></b-icon> Retirer </b-button>
              </b-row>
            </b-col>

            <b-col class="sizedivslist">
        
             <b-container fluid>
               <b-row align-v="center">
                
                 <b-col>
                  <div class="playlistpige" @click="contextMenu" @contextmenu.prevent="contextMenu">
                      <header class="header  mb-2 bg-dark py-2">
                           <b-col><div class="text-left">Séquences sélectionnées </div></b-col>
                      </header>
                        <b-table
                              bordered
                              hover
                              small
                              selectable
                              sticky-header
                              head-variant="light"
                              :items="this.$store.getters.elementsToAssign"
                              :fields="elementassignfields"
                              select-mode="single"
                              @row-selected="SelectLignePige"
                              selected-variant="info"
                              aria-haspopup="true"
                              aria-expanded="false"
                              table-class="table-detail"
                            >
                        
                            
                            <template #cell(reconcile)="data">
                                <p>
                                  <span :class="getIconColor(data.value)" class="material-icons">{{
                                    getIconName(data.value)
                                  }}</span>
                                </p>
                              </template>
                              <template #cell(decoupe)="data">
                                <p>
                                  <span :class="getIconColor(data.value)" class="material-icons">{{
                                    getIconName(data.value)
                                  }}</span>
                                </p>
                              </template>
                        
                              
                            </b-table>

                            
                              
                              <b-button
                               
                                :disabled=this.lignepigeselected
                                class="mb-2 w-15 "
                                variant="primary"
                                id="search"
                                v-on:click="reconciliationProductToassign()"
                                type="submit"
                              >
                                Réconciliation des produits  </b-button
                              >
                              <b-button
                              
                                class="mb-2 w-15 ml-2"
                                variant="primary"
                                :disabled=!showdecoupebutton
                                id="search"
                                v-on:click="decoupe()"
                                type="submit"
                              >
                                Découper tous  </b-button
                              >
                              <b-button
                              :disabled=!showtranscodbutton
                                class="mb-2 w-15 ml-2"
                                variant="primary"
                                id="search"
                                v-on:click="asktoconfirmchoice()"
                                type="submit"
                              >
                                Découpe + transcodage auto </b-button
                              >
                              <b-button
                                v-if ="showdeletedbutton"
                                class="mb-2 w-15 ml-2"
                                variant="primary"
                                id="search"
                                v-on:click="dropall()"
                                type="submit"
                              >
                                Effacer tout</b-button
                              >

                                        
                            
                          
                            </div>
                    </b-col>
                </b-row>
                <!--<b-row align-v="center" v-if="showinfoproduit">
                
                <b-col>
                 <div class="playlistpige" @click="contextMenu" @contextmenu.prevent="contextMenu">
                     <header class="header  mb-2 bg-dark py-2">
                          <b-col><div class="text-left">Information produit </div></b-col>
                     </header>
                     <p show  >
                      <strong>Titre :</strong> {{ this.elementpigetoassign[0].title}} 
                     </p>
                     <p  >
                      <b-row>
                        <b-col > <strong>Date :</strong> {{this.elementpigetoassign[0].broadcastDate}}</b-col>
                        <b-col  >  <strong>Nom du fichier :</strong> {{ this.elementpigetoassign[0].fileName}} </b-col>
                       
                     </b-row>
                    </p>
                     <div>
                            <b-row >
                             <b-col>
                              <strong>Début :</strong> {{elementpigetoassign[0].heure  }}
                             <b-input show  variant="secondary"  v-model="elementpigetoassign[0].heure">
                                  
                                </b-input>
                              
                             </b-col>
                             <b-col>
                              <strong>Durée :</strong>  {{ elementpigetoassign[0].durationLabel }}
                               <b-input show  variant="secondary"  v-model="elementpigetoassign[0].durationLabel">
                                  
                                </b-input> 
                              </b-col>
                             
                              <b-col>
                                  
                                  <b-button
                                            
                                            class="mt-4 w-15 ml-2"
                                            variant="primary"
                                            id="search"
                                            v-on:click="ajuster()"
                                            type="submit"
                                          >
                                            Ajuster </b-button
                                          >  
                              </b-col>
                            </b-row>   
                     </div>                    
                           
                    </div>
                </b-col>
               </b-row>-->
               <b-row align-v="center">
                
                <b-col>
                 <div class="playlistpige" @click="contextMenu" @contextmenu.prevent="contextMenu">
                     <header class="header  mb-2 bg-dark py-2">
                          <b-col><div class="text-left">Liste des médias disponibles </div></b-col>
                     </header>
                     <b-row>
                      <b-col class="col-2 mt-3"> <strong>Répertoire :</strong> </b-col>
                      <b-col  class="col-3 " >
                        <b-form-group  id="channel-diff"  >

                          <b-form-select   v-on:change="displayListFile()"  v-model="choosedrepertory"  :options="optionrepertory"   size="sm" class="mt-3 btn-icon" ></b-form-select>
                          </b-form-group>
                      </b-col>
                      <b-col class="col-2">
                        <b-button    class="mt-2 "   variant="primary"   id="search"  v-on:click="RefreshRper()"   type="submit"  >
                      <b-icon class=""  icon="arrow-repeat"></b-icon> </b-button >
                      </b-col>
                      
                     </b-row>
                     
                     
                    
                   
      
                                    
                     <b-table  
                               @row-contextmenu="openMenu"
                                class="ongletassignation"
                                bordered
                                hover
                                responsives
                                small
                                position="top-right"
                                sticky-header="75vh"
                                head-variant="light"
                                :items="this.repertoryValue"
                                :fields="elemenrepertoryfields"
                                select-mode="range"
                                selected-variant="info"
                               
                                selectable
                                @row-selected="SelectLigneRepertoire"
                                aria-haspopup="true"
                                aria-expanded="false"
                                table-class="table-detail"
                              >
                              <template #cell(reconcile)="data">
                                <p>
                                  <span :class="getIconColor(data.value)" class="material-icons">{{
                                    getIconName(data.value)
                                  }}</span>
                                </p>
                              </template>
                              <template #cell(transcod)="data">
                                <p>
                                  <span :class="getIconColor(data.value)" class="material-icons">{{
                                    getIconName(data.value)
                                  }}</span>
                                </p>
                              </template>
                              
                              <template #cell(status)="data">
                                  <div :class="getColorBgStatutDecoupe(data.value)">
                                    <p>{{ data.value }}</p>
                                  </div>
                                </template>
                                <template #cell(orderseg)="data">
                                  <b-form-input class="input-group"
                                    type="number"
                                    v-model="data.item.orderseg"
                                  />
                                </template>
                              </b-table>

                    </div>
                </b-col>
               </b-row>
              </b-container>
            </b-col>

             <!-- pop up planned produit-->
 <b-modal
      v-model="showplannedproduct"
      centered
      title="Association d'une clé de réconciliation"
      title-tag="h3"
      size="xl"
      body-class="modalcart"
      header-bg-variant="dark"
      header-text-variant="light"
      content-class="custom-height"
    >

    <div v-if="showinfoproduit" class="playlistpige" @click="contextMenu" @contextmenu.prevent="contextMenu">
                     <header class="header  mb-2 bg-dark py-2">
                          <b-col><div class="text-left">Element sélectionné </div></b-col>
                     </header>
                  <div class="bg-light text-left mb-2" >
                    <div class="  text-left ml-2 mb-2"><strong>Titre :</strong> {{ this.titleselectedelement}}  </div>
                    <b-row>
                    <b-col class="col-3">
                      <strong>Chaine:</strong>
                      <b-form-select  v-model="chaine" :options="optionchaineList" size="sm"   class=" btn-icon"  ></b-form-select>
                    </b-col>
                    <b-col class="col-4">
                     
                    <div class=" text-left ml-2 mb-2"> 
                      <strong>Date:</strong>
                      <b-form-group   id="date"    label-for="datepicker"  class="mb-0" >
                      <b-form-datepicker   id="datepicker"   v-model="vodday"   locale="fr"   format="DD/MM/YYYY"  @change="onSelectDateDay"  ></b-form-datepicker>
                      </b-form-group>
                    <!-- </strong> {{ this.elementpigetoassign[0].broadcastDate}}  --> </div>
                    </b-col>
                    <b-col class="col-2">
                    <div class="  text-left ml-2 mb-2 mt-2">  <strong>Duration :</strong> {{ this.durationselectedelement}}   </div>
                  </b-col>
                  <b-col >
                    <b-button
                  
                  class="mb-2 w-20 mt-3"
                  variant="primary"
                  id="search"
                  v-on:click="search()"
                  type="submit"
                >
                  Rechercher <b-icon class="ml-2" icon="search"></b-icon> </b-button
                >
              </b-col>
                  </b-row>    
                  </div>    
      </div>
      <div  v-if="!showtablelava" class="text-center">
          <b-spinner variant="secondary" label="Text Centered"></b-spinner>
        </div>
      <b-table
        v-if="showtablelava"
        class="ongletassignation"
        bordered
        hover
        small
        position="top-right"
        sticky-header="75vh"
        head-variant="light"
        :items="this.plannedproduct"
        :fields="elementwhatsontoassignfields"
        select-mode="range"
        selected-variant="info"
        selectable
        @row-selected="SelectLigneLava"
        aria-haspopup="true"
        aria-expanded="false"
        table-class="table-detail"
      >
       
      </b-table>
      
      <template #modal-footer>
        <div class="w-100">
          <b-button variant="primary"  class="ml-2 float-right success " @click="reconcilier()">
            Réconcilier
          </b-button>
         
        </div>
      </template>
    </b-modal>

     <!-- confirmation transcodage avec publication-->
     <b-modal
      class="#modal-dialog"
      v-model="confirmPublication"
      centered
      id="bv-modal-example"
      hide-footer
      title="Transcodage avec/sans publication"
    >
      <div class="d-block text-center">
        <p class="text-left">
          Vous voulez les publier ?
         
        </p>
      </div>
      <div class="form-check">
          <input type="radio" class="form-check-input" id="radio1" name="optradio" value="oui" v-model="choicepubli" checked>Oui
          <label class="form-check-label" for="radio1"></label>
        </div>
        <div class="form-check">
          <input type="radio" class="form-check-input" id="radio2" name="optradio" value="non" v-model="choicepubli" >Non
          <label class="form-check-label" for="radio2"></label>
        </div>
      <b-button size="sm" class="float-right ml-2" @click="decoupetranscod()"
        >Confirmer</b-button
      >
      <b-button
        variant="danger"
        size="sm"
        class="float-right ml-2"
        @click="confirmPublication = false"
        >Annuler</b-button
      >
    </b-modal>
    <div class="box-click-right">
      <b-list-group
        v-if="rightclickmenureper"
        class="box-click-right__wrapper w-25 position-fixed text-left"
        :style="style"
        v-click-outside="outside"
      >
        <b-list-group-item
          onMouseOver="this.style.cursor='pointer'"
          @click="showreconciliationscreen"
          >Réconciliation des données</b-list-group-item
        >
        <b-list-group-item
          onMouseOver="this.style.cursor='pointer'"
          @click="asktoconfirmchoice()"
          >Demande de transcodage</b-list-group-item
        >
        <b-list-group-item
          onMouseOver="this.style.cursor='pointer'"
          @click="copiePath()"
          >Copier le path du fichier</b-list-group-item
        >
   
      </b-list-group>
      
    </div>

 </b-row>

  

     
  </template>

<script>
import axios from "axios";
import moment from "moment";
import clickOutside from "../Directives/clickOutside";
export default {

  name: "PlayListPige",
  
  data() {
    return {
    vodday:this.$store.getters.searchcriteria.date,
    date : this.$store.getters.searchcriteria.date,
    chaine:this.$store.getters.searchcriteria.chaine,
     fields: [
     //  { key: "chaine", label: "Chaine", sortable: true },
     //   { key: "date", label: "Date", sortable: true },
     { key: "broadcastDate", label: "Date", sortable: true },
     { key: "heure", label: "Heure", sortable: true },
        { key: "title", label: "Titre Asrun", sortable: true },
       { key: "fileName", label: "Nom du fichier", sortable: true },
      //  { key: "broadcastDate", label: "Heure", sortable: true },
        { key: "durationLabel", label: "Durée", sortable: true },
        { key: "traficId", label: "Clé SGT", sortable: true },
        { key: "segment", label: "segment", sortable: true },
        { key: "live", label: "live", sortable: true },
       
     //   { key: "cle", label: "Clé", sortable: true },
      //  { key: "id", label: "Id", sortable: true },
      //  { key: "numero", label: "n°", sortable: true }
      
      ],
      elementassignfields: [
     //   { key: "selected", label: "Sélectionner", sortable: true },
        { key: "reconcile", label: "Réconcilier", sortable: true },
        { key: "decoupe", label: "Découpe / Transcod", sortable: true },
        { key: "broadcastDate", label: "Date", sortable: true },
        { key: "title", label: "Titre Asrun", sortable: true },
       
        { key: "fileName", label: "Nom du fichier", sortable: true },
        { key: "heure", label: "Heure", sortable: true },
        { key: "durationLabel", label: "Durée", sortable: true },
        { key: "traficId", label: "Clé SGT", sortable: true },
        { key: "segment", label: "segment", sortable: true },
        { key: "live", label: "live", sortable: true },
      ],
      elementwhatsontoassignfields: [
        { key: "channel", label: "Chaine", sortable: true },
        { key: "plannedDateTime", label: "Date/heure", sortable: true },
        { key: "title", label: "Titre", sortable: true },
        { key: "duree", label: "Durée", sortable: true },
        { key: "idEpisode", label: "Episode", sortable: true },
        { key: "preview", label: "Preview", sortable: true },
        {
          key: "plateformOffers[0].startDateTime", 
          label: "Début visib.",
          sortable: true,
        },
        { key: "plateformOffers[0].name", label: "Plateforme", sortable: true },
        {
          key: "idStk",
          label: "PAD",
          sortable: true,
        },
      
      ],
      playlistpige: [],
      valid: false,
      isBusyVar: false,
      polling: null,
      viewMenu: false,
      showplannedproduct:false,
      focusedItem:'',
      plannedproduct:[],
      optionsaction: [
        "Découper",
        "Transcoder + découper"
      ],
      choosedoption: "Découper",
      elementpigetoassign:[], 
      elementlavatoassign:[],
      LigneLava: false,
      LignePige: false,
      showreconcilebutton: true, 
      showtablepige : true,
      showtablelava : false,
      showdecoupebutton: false, 
      showtranscodbutton: false,
      showdeletedbutton: true, 
      lignepigeselected:true,
      loading: true,
      showinfoproduit: false, 
      rowselected:[],
      optionrepertory: [
          { value: "SnipRecLo", text: "SnipRecLo" },
          { value: "SnipRecHi", text: "SnipRecHi" },
          { value: "manuel", text: "Manuel" },
          { value: "Diva", text: "VodStock" },
          
        ],
        choosedrepertory : "vodspace",
        preparedobjectstosend:[],
        elemenrepertoryfields: [
        { key: "reconcile", label: "Réconcilier", sortable: true },
        { key: "transcod", label: "Transcod", sortable: true },
        { key: "orderseg", label: "Ordre", sortable: true },
        { key: "status", label: "Statut", sortable: true },
        { key: "filiere", label: "Filière", sortable: true },
        { key: "chaine", label: "Chaine", sortable: true },
      //  { key: "file_name", label: "Fichier", sortable: true },
        { key: "title", label: "Titre", sortable: true },
        { key: "episodeId", label: "Episode", sortable: true },
        { key: "mediaId", label: "MediaID", sortable: true },
        { key: "segment", label: "Seg", sortable: true },
        { key: "start", label: "Date de début", sortable: true },
        { key: "finishedDate", label: "Date de fin", sortable: true },
       // { key: "duree", label: "Durée", sortable: true },
       // { key: "size", label: "Taille", sortable: true },
       // { key: "size", label: "Taille", sortable: true },
        { key: "creation", label: "Création date", sortable: true },
       
        
        { key: "destination", label: "Path", sortable: true },
       
      ],
      repertoryValue:[],
      optionchaineList:[],
       optionchainedif: [
          { value: "NONLINEAIRE", text: "Non linéaire" },
          { value: "LAUNE", text: "La Une" },
          { value: "TIPIKTV", text: "Tipik" },
          { value: "LATROIS", text: "La Trois" },
          { value: "AUVIOKIDS", text: "Auvio Kids" },
          { value: "70ANS", text: "70 ans" },
        ],
        tableconversionchainedif: [
          { key: "NONLINEAIRE", text: "Non linéaire" },
          { key: "LAUNE", text: "La Une" },
          { key: "TIPIKTV", text: "Tipik" },
          { key: "LATROIS", text: "La Trois" },
          { key: "AUVIOKIDS", text: "Auvio Kids" },
          { key: "70ANS", text: "70 ans" },
        ],
      datedebut:'',
      choicepubli: 'oui',
      confirmPublication: false,
      rightclickmenureper: false, 
      elementRepertoirSelected:[],
      openfromreper : false,
      titleselectedelement :'',
      durationselectedelement:''
     
        };
  },
  mounted() {
    this.getChannelList();
     // this.onSelectDateDay();
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
  methods: {
    getChannelList(){
      axios
        .get(
          this.$store.getters.getUrlBaseService + "notification/service/chaines")
        .then(
          (result) => {
            
            result.data.forEach(elt => {
              let newelt= {value: Object.keys(elt)[0], text: Object.values(elt)[0]}
              this.optionchaineList.push(newelt)     
                  });
             
                  
          },
          (error) => {
            console.error(error);
          }
        )
        .finally(() => (this.loading = false));
    },
    copiePath(){
      const el = document.createElement("textarea");
      this.rightclickmenureper = false;
      el.value  =  this.elementRepertoirSelected.length >0  ? this.elementRepertoirSelected[0].destination : "";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    },
    search(){
      this.showtablelava = false;
     // this.$store.getters.searchcriteria.chaine = this.chaine
    //  console.log("je suis dans search"+ JSON.stringify(this.chaine))
     
      this.reconciliation()
    },
    onSelectDateDay() {
   
    
    this.searchcriteria.date= this.datePige;

         this.$store.commit("setSearchcriteria", this.searchcriteria);
        
    },
      
    getFormattedHeure(proposeddate) {
      return proposeddate.substring(proposeddate.indexOf("T")+1 , proposeddate.indexOf(".")); 
    },
    getFormattedDate(proposeddate) {
      return proposeddate.substring(0, proposeddate.indexOf("T")-1)  ; 
 
    },
    checklignepigetounselected(){
      
          if(this.elementpigetoassign.length> 0){
            
              this.lignepigeselected = false;

          } else {
            
            this.lignepigeselected = true;
          }
    },
    contextMenu() {},
    outside() {
      this.rightclickmenureper = false;
    },
    setMenu(top, left) {
      this.top = `${top}px`;
      this.left = `${left}px`;
    },
    closeMenu() {
      this.rightclickmenureper= false;
    },
   
    openMenu(item, index, e) {
      //this.focusedItem = item;
      this.rightclickmenureper= true;
      this.setMenu(e.y, e.x);
      e.preventDefault();
    },
   createNewElementToAssign: function (item) {
     // console.log("item = "+ JSON.stringify(item))
      return {
       
        title: item.title,
        fileName: item.fileName,
        broadcastDateFull: item.broadcastDateFull,
        broadcastDate: item.broadcastDate,
        durationLabel: item.durationLabel,
        heure: item.heure,
        traficId: item.traficId,
        live : item.live,
        segment: item.segment,
        reconcile: '',
        decoupe:'',
        lavadata:''

      };
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
    getColorBgStatutDecoupe(data) {
      switch (data) {
        case "SUCCESS":
          return "couleur-1";
        case "CREATED":
          return "couleur-2";
        case "FAILED":
          return "couleur-3";
        case "ABORTED":
           return "couleur-2";
        case "RUNNING":
          return "couleur-7";
      }
      return "couleur-4";
    },
    onRowSelectedToAssign: function(items){
      let elementsToAssign = [];
    
    this.$store.commit("setSelectedEmissions", items);
    for (let index = 0; index < items.length; index++) {
        let element = this.createNewElementToAssign(items[index]);
        elementsToAssign.push(element);


      
    }
   
    },
    clickdrag(){
      let elementsToAssign = [];
      this.preparedobjectstosend =[];
      for (let index = 0; index <  this.rowselected.length; index++) {
        let element = this.createNewElementToAssign( this.rowselected[index]);
        elementsToAssign.push(element);
       }
       // console.log("element to assigne " + JSON.stringify( elementsToAssign))
      this.$store.commit("setElementToAssign", elementsToAssign);
      this.date =  moment(this.$store.getters.searchcriteria.date).format("DD/MM/YYYY") ;
      this.chaine=this.$store.getters.searchcriteria.chaine;
     
    },
    clickdrop(){
      
      for (let index = 0; index <  this.$store.getters.elementsToAssign.length; index++) {
        
        if(this.$store.getters.elementsToAssign[index].traficId === this.elementpigetoassign[0].traficId){
          
          this.$store.getters.elementsToAssign.splice(index, 1);
        }
       
       }
     
    },
    dropall(){
      this.showdecoupebutton = false;
      this.showtranscodbutton = false;
      let elementsToAssign = [];
      this.$store.commit("setElementToAssign", elementsToAssign);
      
    
    },
    onRowSelected(items) {
      this.rowselected = items;
      
  /*    this.viewMenu = false;
      let elementsToAssign = [];
      for (let index = 0; index < items.length; index++) {
        let element = this.createNewElementToAssign(items[index]);
        elementsToAssign.push(element);
       }
       // console.log("element to assigne " + JSON.stringify( elementsToAssign))
      this.$store.commit("setElementToAssign", elementsToAssign);
      this.date =  moment(this.$store.getters.searchcriteria.date).format("DD/MM/YYYY") ;
      this.chaine=this.$store.getters.searchcriteria.chaine;*/
    },
    updateOptionAssign(data) {
      if (data.item.check) {
        data.item.check = false;
      } else {
        data.item.check = true;
      }
    },
    SelectLignePige: function (item) {
      this.showdecoupebutton = false;
      this.showtranscodbutton = false;
      
      if(item.length>0)
      {
        this.titleselectedelement = item[0].title;
        this.durationselectedelement= item[0].durationLabel;
        this.showinfoproduit = true;
        this.elementpigetoassign = item;
        this.lignepigeselected =false;
        this.datedebut = this.getFormattedHeure(item[0].broadcastDate);
        this.checklignepigetounselected();

     }
        
        else {
          this.lignepigeselected =true;
          this.showinfoproduit = false;}
          this.activateDecoupeButton();
    },
    ajuster(){

    
      //this.elementpigetoassign[0].heure = this.datedebut;
      for (let index = 0; index <  this.$store.getters.elementsToAssign.length; index++) {
        
        if(this.$store.getters.elementsToAssign[index].traficId === this.elementpigetoassign[0].traficId){
          
          this.$store.getters.elementsToAssign[index]= this.elementpigetoassign[0];
        }
       
       }

    },
    SelectLigneLava: function (item) {
      this.closeMenu();
    //  console.log('selected element pige : '+JSON.stringify(item) )
      this.viewMenu = false;
      item.length > 0 ? this.LigneLava = true : this.LigneLava = false ;
      
      this.elementlavatoassign = item
    //  this.showreconcilebutton = this.LignePige && this.LigneLava
   //   console.log(JSON.stringify(item)+this.showreconcilebutton )

    },
    SelectLigneRepertoire: function (item) {
      this.elementRepertoirSelected=[];
      this.titleselectedelement = item[0].title;
      this.durationselectedelement ='';
      for (let i = 0; i < item.length; i++) {
          /*let elt = {
            repertoryInfo : item[i],
            lavadata :''*/
       //     console.log('selected element reper  : '+JSON.stringify(item[i]))
            this.elementRepertoirSelected.push(item[i]);
          }
         
      
      
      this.rightclickmenureper = false; 

    },
    closeSearchListPige() {
      
    
 
      this.showAssign = false;
    //  console.log("je suis la" +  this.showAssign)
    
    },
    showAssignationScreen() {
      
      this.viewMenu = false;
      this.showAssign = true;
     
      this.$store.commit("setproducttoassign", []);
      
    },
    activateDecoupeButton(){
      for (let i = 0; i < this.$store.getters.elementsToAssign.length; i++) {

         // console.log("valeur de reconcile = "+this.$store.getters.elementsToAssign[i].reconcile)

          if(this.$store.getters.elementsToAssign[i].reconcile !== "success" ) {

 
          this.showdecoupebutton = false;
          this.showtranscodbutton = false
          return

          }  }

    
     this.showdecoupebutton = true
     this.showtranscodbutton = true;
    },
    updateStatusFronted(item) {
        
       for (let i = 0; i < this.$store.getters.elementsToAssign.length; i++) {

       

        if(item[0].title === this.$store.getters.elementsToAssign[i].title) {
       

         this.$store.getters.elementsToAssign[i].reconcile ="success"

        }  
             
              }  

             
           this.activateDecoupeButton();
           //   console.log("nouvelle valeurs = "+JSON.stringify(this.$store.getters.elementsToAssign) )
     
    },
    
    reconciliationProductToassign(){

      this.openfromreper= false; 
      this.vodday = this.elementpigetoassign[0].broadcastDate; 
      
      this.reconciliation();
    },
    reconciliation(){
      this.loading = true;
      this.showtablelava = false
     
     if(this.openfromreper){
        this.showinfoproduit=true;
      }
     // this.$store.getters.searchcriteria.chaine= this.optionchainedif
     
      let channel=this.chaine;
      for (let i = 0; i < this.tableconversionchainedif.length; i++) {
       
       if(this.tableconversionchainedif[i].key ===this.chaine){
         // console.log("la chaine selectionné = "+this.optionchainedif[i])
         channel=this.tableconversionchainedif[i].text;
       }
      }
      if(this.chaine==="NONLINEAIRE"){
        channel =",";
      }
   //   console.log("channel= "+this.chaine)
  
      this.showplannedproduct = true;

     // console.log("chaine = "+channel);
      if(this.vodday.length < 1){
        this.vodday =  moment(this.$store.getters.searchcriteria.date).format("YYYY-MM-DD") ;
      } 
      let date =  moment(this.vodday).format("DD-MM-YYYY") ;
    
      axios
        .get(
          this.$store.getters.getUrlBaseService + "lava/plannedproductsbydate/"+date +"?channels="+channel)
        .then(
          (result) => {

           this.showtablelava = true
            this.plannedproduct=result.data;
       
          },
          (error) => {
            console.error(error);
          }
        )
        .finally(() => (this.loading = false));
    
    


    },
   
    reconcilier(){
      
       if(this.openfromreper){
  
        this.updateListElementReper();
       } else {
  
          this.updateListElementToAssign();
       }
       this.activateDecoupeButton();
      // this.updateStatusFronted(this.elementpigetoassign);
       this.showplannedproduct = false;

    },
     
    updateListElementToAssign() {

        for (let i = 0; i < this.$store.getters.elementsToAssign.length; i++) {
 
       // console.log("element to assign"+JSON.stringify(this.elementpigetoassign[0])+' et '+JSON.stringify(this.$store.getters.elementsToAssign[i]))
       let titletocompare =this.elementpigetoassign[0].title;
       if(this.elementpigetoassign[0].title.match(RegExp('-\\s*\\d*\\s*\\(*\\s*\\d+\\s*/\\s*\\d+\\s*\\)*\\s*$'))){
            
          if(this.elementpigetoassign[0].title.slice(0, titletocompare.lastIndexOf('-'))=== 
          this.$store.getters.elementsToAssign[i].title.slice(0, this.$store.getters.elementsToAssign[i].title.lastIndexOf('-')) ) {
        
              this.$store.getters.elementsToAssign[i].lavadata =this.elementlavatoassign
               this.$store.getters.elementsToAssign[i].reconcile ="success"
          }
        } else {
          if(this.elementpigetoassign[0].title === this.$store.getters.elementsToAssign[i].title ) {
        
              this.$store.getters.elementsToAssign[i].lavadata =this.elementlavatoassign
               this.$store.getters.elementsToAssign[i].reconcile ="success"
          }

        }


           
              
               }  
         

      
     },
     
     updateStatusFrontedReconcileReper(object){
      for (let i = 0; i < this.repertoryValue.length; i++) {
        
         if(this.repertoryValue[i].destination === object.destination){
          this.repertoryValue[i].reconcile ="success"
         }
      }
     },
     updateListElementReper() {
     
      for (let i = 0; i < this.elementRepertoirSelected.length; i++) {
           
            this.elementRepertoirSelected[i].lavadata=this.elementlavatoassign;
            this.updateStatusFrontedReconcileReper( this.elementRepertoirSelected[i]);
          

       }  
            
             
       
    
   },
   searchIfSegmentIsPresent(elt,preparedobjectstosend ){        
       for (let j = 0; j < preparedobjectstosend.segments.length; j++) {                        
              if(preparedobjectstosend.segments[j].traficId == elt.traficId && 
              preparedobjectstosend.segments[j].number === elt.segment){
                return true;
              }
       }    
    return false;
   },
     existObjectReconcilier(objecttoassign,preparedobjectstosend){
      for (let i = 0; i < preparedobjectstosend.length; i++) {
          if(preparedobjectstosend[i].episodeId === objecttoassign.lavadata[0].idEpisode
               && preparedobjectstosend[i].vodDay=== objecttoassign.lavadata[0].datePublicationAsString){

                return i ;
               }
          return null;
      }
     },
     updateObjectReconcilier(elementtoadd,preparedobjectstosend){
         if(!this.searchIfSegmentIsPresent(elementtoadd, preparedobjectstosend)){
          
            let newseg ={
              number : elementtoadd.segment ,
              traficId: elementtoadd.traficId
            }
            preparedobjectstosend.segments.push(newseg)
         }
     },
     createPreparedobjectstosend(){
      for (let i = 0; i < this.$store.getters.elementsToAssign.length; i++) {   
       let objecttodecoupe= this.creationObjectRecocilier (this.$store.getters.elementsToAssign[i]);
       this.preparedobjectstosend.push(objecttodecoupe);
       }
     },
     decoupe(){
      this.preparedobjectstosend=[];
    
          this.createPreparedobjectstosend();
          
         
           this.sendToRestore(this.preparedobjectstosend);
         
       
     },
     decoupetranscod(){
       
       let choicetopubli = this.choicepubli =="oui" ? true : false ;
      if(this.openfromreper){
        let preparedobjecttosendreperlist=[];
        
       for (let i = 0; i < this.elementRepertoirSelected.length; i++) {
       //  console.log("Object a transcoder ======== "+JSON.stringify(this.elementRepertoirSelected))
          let objecttodecoupe= this.creationObjectRecocilierFromReper(this.elementRepertoirSelected[i]);
          objecttodecoupe.transcode = true;
          objecttodecoupe.publish = choicetopubli ;
          preparedobjecttosendreperlist.push(objecttodecoupe);
       }
        this.sendToRestoreFromReper(preparedobjecttosendreperlist);
        }else {

        
      if(this.preparedobjectstosend.length>0){
        
          
          for (let i = 0; i < this.preparedobjectstosend.length; i++) {
              this.preparedobjectstosend[i].transcode = true;
              this.preparedobjectstosend[i].publish = choicetopubli ;
             // this.sendToRestore( this.preparedobjectstosend[i]);
            
          }
          this.sendToRestore(this.preparedobjectstosend)
        } else {          
            this.createPreparedobjectstosend();
            for (let i = 0; i < this.preparedobjectstosend.length; i++) {
              this.preparedobjectstosend[i].transcode = true;
              this.preparedobjectstosend[i].publish = choicetopubli ;
              //this.sendToRestore( this.preparedobjectstosend[i]);
            
          }
          this.sendToRestore(this.preparedobjectstosend)
          
        }
        }
        this.confirmPublication= false;
             
      },
      asktoconfirmchoice(){
      //  console.log("la valeur = "+this.choicepubli )
        this.confirmPublication= true;  
      },
      existeSegment(segment, listSegment){
        for (let i = 0; i < listSegment.length; i++) {
          if(listSegment[i].number == segment.number && listSegment[i].traficId == segment.traficId){
            return true
          }
        }
        return false;
      },
      getSegments(object){
        let segments= [];
        if(object.segment != null && object.traficId != null) {
              let segment =  {
                              number:  object.segment  ,
                              traficId: object.traficId,
                            }
                            segments.push(segment)
            }

            // a enelever une fois que mbas fourni le service
      /*      if(this.openfromreper){   
          for (let i = 0; i < object.lavadata[0].segments.length; i++) {
            
           
            let segment =  {
                              number:  object.lavadata[0].segments[i].number ,
                              traficId: object.lavadata[0].segments[i].sgtKey,
                            }
            if(!this.existeSegment(segment, segments)){

              segments.push(segment)
            }

        
          }}*/
                          return segments
                        }
      ,
      getPlateforms(object)
         {
         
           let plateforms =[];
          for (let i = 0; i < object.lavadata.length; i++) {
            let plateform =  {
                            //  id: "",
                              name:object.lavadata[i].plateformOffers[0] ? object.lavadata[i].plateformOffers[0].name :'',
                              mediaId: object.fileName,
                             // offerId: "",
                              offerName:object.lavadata[i].plateformOffers[0] ? object.lavadata[i].plateformOffers[0].offerName :'',
                              recordId:object.lavadata[i].idRecord,
                              reference:object.lavadata[i].plateformOffers[0] ? object.lavadata[i].plateformOffers[0].caseReferenceExterne :'' ,
                              recordVodXmlId: object.lavadata[i].plateformOffers[0] ? object.lavadata[i].plateformOffers[0].recordvodxmlid : '',
                              //vodDay:"",
                              signaletique: {
                            //    additionalProp1: "",
                             //   additionalProp2: "",
                            //    additionalProp3: ""
                              },
                            

                              
        
                            };

                            plateforms.push(plateform)
          }
          return plateforms;

         },
    creationObjectRecocilier (object){
     //  console.log("CREATION object line 1205 = "+JSON.stringify(object));
   let day = moment(object.broadcastDate).format("DD/MM/YYYY")
    
       let objectReconcilier = {
                chaine: this.chaine ==='NONLINEAIRE' ? '': this.chaine,
                vodDay:  ""+day,
                mediaId: object.fileName,
                episodeId:  object.lavadata[0] ? object.lavadata[0].idEpisode: '',
                startDate:object.broadcastDateFull,
                duration: object.durationLabel,
                titre: object.title,
                segments :  this.getSegments(object) ,
                publish: false,
                live: object.live,
                byAutomation:  this.chaine ==='NONLINEAIRE' ? false : true,
                transcode: false,
                manual: true,
                platforms:this.getPlateforms(object)
         };
         return objectReconcilier;
    },
    getSegmentsReper(object){
           let segments =[];
      
         let segment ={
          number :object.orderseg,
          name :object.destination
         }
         segments.push(segment);
      
       return segments;
    },
    creationObjectRecocilierFromReper (object){
      let day =moment(this.$store.getters.searchcriteria.date).format("DD/MM/YYYY");
     
      let objectReconcilier = {
                chaine: this.chaine ==='NONLINEAIRE' ? '': this.chaine,
                vodDay:  ""+day,
                mediaId: object.lavadata[0].idStk,
                episodeId: object.lavadata[0] ? object.lavadata[0].idEpisode: '',
                titre: object.title,
                filiere: this.choosedrepertory,
                segments : this.getSegmentsReper(object) ,
                publish: false,
                transcode: false,
                byAutomation:  this.chaine ==='NONLINEAIRE' ? false : true,
                manual: true,
                platforms:this.getPlateforms(object)
         };
         
        // console.log("oject to reconcile = "+JSON.stringify(objectReconcilier))
         return objectReconcilier;
        

      

    },
    sendToRestoreList(ObjectList){
      

      for(let i=0; i<ObjectList.length ; i++){
       
        this.sendToRestore(ObjectList[i]);
      }
    },
    sendToRestore(object){
      

      console.log("Object to restore : "+JSON.stringify(object))


      axios
          .post(
            this.$store.getters.getUrlBaseService +"restore/service/record/start" ,
             object
          )
          .then(
      
          (result) => {

       
            if (result.status == "200" ) {

              console.log('la demande a ete effectué')

              

                for (let i = 0; i < this.$store.getters.elementsToAssign.length; i++) {

       
                  for (let j = 0; j < object.length; j++) {
                      if(object[j].titre === this.$store.getters.elementsToAssign[i].title ) {


                      this.$store.getters.elementsToAssign[i].decoupe ="success"

                      }  
                    }    
                 } 
              
              

            } 
       
          },
          (error) => {
          //  console.log("je sors"+JSON.stringify(object));
            console.error(error);
           

            for (let i = 0; i < this.$store.getters.elementsToAssign.length; i++) {
              for (let j = 0; j < object.length; j++) {
                        if(object[j].titre === this.$store.getters.elementsToAssign[i].title ) {
                               this.$store.getters.elementsToAssign[i].decoupe ="error"

                        }         
                }
                        
             } 
              
          }
          
        )
        .finally(() => (this.loading = false));
    },
    sendToRestoreFromReper(object){
      console.log("Object to restore from repertory: "+JSON.stringify(object))
          axios
          .post(
            this.$store.getters.getUrlBaseService +"restore/service/record/save" ,
             object

          )
          .then(
      
          (result) => {

       
            if (result.status == "200" ) {

             
              for (let i = 0; i < this.repertoryValue.length; i++) {
                for (let j = 0; j < object.length; j++) {
                  
                        if((object[j].titre === this.repertoryValue[i].title  && object[j].episodeId === this.repertoryValue[i].episodeId ) || this.repertoryValue[i].destination === object[j].destination ) { 
                             this.repertoryValue[i].transcod ="success"

                        }  
                            
                }          
              }

            } 
       
          },
          (error) => {
          //  console.log("je sors"+JSON.stringify(object));
            console.error(error);
          
              for (let i = 0; i < this.repertoryValue.length; i++) {

                for (let j = 0; j < object.length; j++) {

                //   console.log("je compte "+this.repertoryValue[i].destination +" et "+object.destination);
                        
                  if((object[j].titre === this.repertoryValue[i].title && object[j].episodeId === this.repertoryValue[i].episodeId )|| this.repertoryValue[i].destination === object[j].destination ) {


                     this.repertoryValue[i].transcod ="error"

                  }  
                      
                } 
              }
            
          }
        )
        .finally(() => (this.loading = false));
    },
    showreconciliationscreen: function () {
      console.log("la chaine = "+ this.$store.getters.searchcriteria.chaine)
      this.rightclickmenureper = false;
      this.openfromreper =true;
      this.reconciliation();
      //this.showplannedproduct=true;
     
   
    },
    createNewElementRepertory: function (item) {
    
      return {
       
        title: item.title,
        filiere: item.filiere,
        file_name: item.file_name,
        segment: item.segment,
        mediaId: item.mediaId,
        status : item.status,
        chaine: item.chaine,
        progress: item.progress,
        episodeId: item.episodeId,
        start: item.start,
        finishedDate: item.finishedDate ? item.finishedDate.replace('T', '  '): "",
        duree: item.duree,
        size : item.size,
        creation: item.creation ? item.creation.replace('T', '  '): "",
        orderseg :item.segment,
        destination: item.destination,
        reconcile: '',
        transcod:'',
        lavadata:''

      };
    },
    RefreshRper(){
      this.displayListFile();
    },
    displayListFile(){
    //  let current = new Date();
   //   let current =  this.$store.getters.searchcriteria.date;
     // let date =  moment(current).format("YYYY-MM-DD") ;
      this.repertoryValue=[];
    // console.log("on cherche pour la date : "+date)
      axios
        .get(
        this.$store.getters.getUrlBaseService+ "restore/service/mediarestore/"+this.choosedrepertory)
       // " http://localhost:8080/service/mediarestore/"+this.choosedrepertory+"/"+date)
        .then(
          (result) => {

           // console.log("je suis laa")
            for(let i=0; i< result.data.length; i++){
               let elt = this.createNewElementRepertory(result.data[i]);
               this.repertoryValue.push(elt);
            }
           // this.repertoryValue = result.data;
       
          },
          (error) => {
            console.error(error);
          }
        )
        .finally(() => (this.loading = false));
    }
  }
 
 
 
  
};
</script>


<style lang="scss">
.sizedivslist {
  min-width: 49%;
  width: 49%;
   }
.modalcart {
  font-family: 'poppins-bold';
   .modal-product-content {
    padding: 3rem;
    margin: 0 auto !important;
     .modal-image {
      height: 300px;
      margin-bottom: 2rem;
      }
    }
  
  }
.home {
  margin: 10px;
  
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
.header {
  color: white;
}
.input-group {
  height: 28dpx;
  
}
.ongletassignation {
  min-height: 38vh !important;
  max-height: 38vh !important;
}
@import "../assets/css/_variables.scss";
.playlistpige {
  margin: 10px 0;
  padding: 10px;
  border-radius: 10px;

  background-color: #fff;
  text-align: left;
 // height: calc(100vh - 150px);
}
.box-click-right {
  &__wrapper {
    z-index: 10;
  }
}
</style>