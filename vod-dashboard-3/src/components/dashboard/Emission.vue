<template>
  <section class="manual-page">
    <header class="page-header">
      <h1>Traitement manuel</h1>
      <hr>
      <p>Pilotage des playlists et des actions manuelles.</p>
    </header>

    <form class="manual-page__filters" @submit.prevent="search">
      <label>
        Date
        <input v-model="selectedDate" type="date"/>
      </label>

      <label>
        Chaine de diffusion
        <select v-model="selectedChannel">
          <option v-for="channel in channels" :key="channel.value" :value="channel.value">
            {{ channel.text }}
          </option>
        </select>
      </label>

      <button type="submit">Rechercher</button>
    </form>

    <p v-if="playlistStore.error" class="error">[Vod Manuel] {{ playlistStore.error }}</p>

    <PlayListPige/>
  </section>
</template>

<script setup lang="ts">
import {computed, onMounted, ref} from "vue";
import {storeToRefs} from "pinia";
import PlayListPige from "@/components/manual/PlayListPige.vue";
import {usePlaylistOffersStore} from "@/stores/playlist.offer";

const playlistStore = usePlaylistOffersStore();
const {channels} = storeToRefs(playlistStore);

const selectedDate = ref(new Date().toISOString().slice(0, 10));
const selectedChannel = ref("LAUNE");

const selectedDateAsDate = computed(() => {
  const [year, month, day] = selectedDate.value.split("-").map(Number);
  return new Date(year, month - 1, day);
});

async function search() {
  await playlistStore.fetchPlaylistByDate(selectedChannel.value, selectedDateAsDate.value);
}

onMounted(async () => {
  await playlistStore.fetchChannels();
  if (channels.value.length > 0) {
    selectedChannel.value = channels.value[0].value;
  }
  await search();
});
</script>

<style scoped lang="scss">

hr {
  border: 0;
  border-top: 1px solid rgba(143, 215, 236, 0.22);
  margin: 0.5rem 0;
}

.manual-page {
  background: transparent;
  min-height: calc(100vh - 80px);
  padding: 0.5rem;
}

.manual-page__filters {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 0.75rem;
  padding: 0.85rem;
  border-radius: 10px;
  border: 1px solid rgba(143, 215, 236, 0.22);
  background: rgba(9, 31, 54, 0.7);
}

label {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.875rem;
  color: #d4edf6;
}

input,
select {
  flex: 1;
  border: 1px solid rgba(143, 215, 236, 0.4);
  border-radius: 8px;
  background: #0f2b45;
  color: #d4edf6;
  padding: 0.42rem 0.55rem;
}

button {
  border: 0;
  border-radius: 8px;
  background: #2ed0f2;
  color: #083047;
  font-weight: 700;
  padding: 0.5rem 0.9rem;
  cursor: pointer;
}

.page-header {
  margin-bottom: 1rem;

  h1 {
    margin: 0;
    color: #ffffff;
    font-size: 1.4rem;
  }

  p {
    margin: 0.25rem 0 0;
    color: #a9d3e4;
  }
}

.error {
  color: #9d1b1b;
}
</style>
