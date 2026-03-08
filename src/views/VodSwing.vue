<template>
  <div class="vodswing">
    <div class="critere">
      <b-container fluid>
        <b-row class="critere__item">
          <b-col cols="3">
            <b-form-group
              id="date"
              label="Date"
              label-for="datepicker"
              class="mb-0"
            >
              <b-form-datepicker
                id="datepicker"
                v-model="datePige"
                locale="fr"
                format="DD/MM/YYYY"
                @input="onSelectDateDay"
              >
              </b-form-datepicker>
            </b-form-group>
          </b-col>
          <b-col cols="3">
            <b-form-group
              id="channel-diff"
              label="Chaine de difusion:"
              label-for="channel"
            >
              <b-form-select
                v-model="choosedchainedif"
                :options="optionchaineList"
                size="sm"
                class="mt-3 btn-icon"
              ></b-form-select>
            </b-form-group>
          </b-col>
          <b-col cols="2">
            <b-button
              size="lg"
              class="mb-2 w-20"
              variant="primary"
              id="search"
              v-on:click="searchListPige()"
              type="submit"
            >
              Rechercher <b-icon class="ml-2" icon="search"></b-icon>
            </b-button>
          </b-col>
        </b-row>
      </b-container>
    </div>
    <div>
      <PlayListPige></PlayListPige>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import moment from "moment";
import PlayListPige from "../components/PlayListPige.vue";

export default {
  components: { PlayListPige },
  name: "Vodswing",
  data() {
    return {
      onlyMan: true,
      datePige: new Date(),
      searchcriteria: this.$store.getters.searchcriteria,
      hideHeaderDatePicker: true,
      optionchaineList: [],
      choosedchainedif: this.$store.getters.searchcriteria.chaine,
    };
  },
  mounted() {
    this.getChannelList();
    this.onSelectDateDay();
  },
  methods: {
    getChannelList() {
      console.log("get channels ");
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
    onSelectDateDay() {
      this.searchcriteria.date = this.datePige;

      this.$store.commit("setSearchcriteria", this.searchcriteria);
    },
    createNewElementPige: function (item) {
      return {
        title: item.title,
        fileName: item.fileName,
        broadcastDateFull: item.broadcastDate,
        broadcastDate: item.broadcastDate.substring(
          0,
          item.broadcastDate.indexOf("T")
        ),
        heure: item.broadcastDate.substring(
          item.broadcastDate.indexOf("T") + 1
        ),
        durationLabel: item.durationLabel,
        traficId: item.traficId,
        live: item.live,
        segment: item.segment,
      };
    },
    searchListPige() {
      this.loading = true;
      //   console.log("filetredchannel = " +this.choosedchainedif+" et la date "+moment(this.datePige).format("YYYY-MM-DD"));
      (this.searchcriteria = {
        date: this.datePige,
        chaine: this.choosedchainedif,
        data: "",
      }),
        this.$store.commit("setSearchcriteria", this.searchcriteria);

      axios
        .get(
          this.$store.getters.getUrlBaseService +
            "sgt-listener/service/playlist/diffusion/" +
            this.choosedchainedif +
            "/" +
            moment(this.datePige).format("YYYY-MM-DD")
        )

        .then(
          (result) => {
            let elementsPige = [];
            for (let index = 0; index < result.data.length; index++) {
              let element = this.createNewElementPige(result.data[index]);
              elementsPige.push(element);
            }
            (this.searchcriteria = {
              date: this.datePige,
              chaine: this.choosedchainedif,
              data: elementsPige,
            }),
              this.$store.commit("setSearchcriteria", this.searchcriteria);

            //     this.$store.commit("setListPige", result.data);
          },
          (error) => {
            console.error(error);
          }
        )
        .finally(() => (this.loading = false));
    },
  },
};
</script>

<style lang="scss">
.vodswing {
  margin: 10px;
}

.header {
  color: white;
}

.sizedivslist {
  min-width: 48%;
  width: 48%;
}

.critere {
  margin: 40px 0;
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