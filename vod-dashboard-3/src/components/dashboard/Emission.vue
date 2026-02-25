<template>
  <section class="manual-page">
    <h1>Traitement manuel</h1>

    <form class="manual-page__filters" @submit.prevent="search">
      <label>
        Date
        <input v-model="selectedDate" type="date" />
      </label>

      <label>
        Chaîne
        <select v-model="selectedChannel">
          <option v-for="channel in channels" :key="channel.value" :value="channel.value">
            {{ channel.text }}
          </option>
        </select>
      </label>

      <button type="submit">Rechercher</button>
    </form>

    <p v-if="playlistStore.error" class="error">{{ playlistStore.error }}</p>

    <PlayListPige />
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { storeToRefs } from "pinia";
import PlayListPige from "@/components/manual/PlayListPige.vue";
import { usePlaylistOffersStore } from "@/stores/playlist.offer";

const playlistStore = usePlaylistOffersStore();
const { channels } = storeToRefs(playlistStore);

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
.manual-page {
  background: #f5f5f5;
}

h1 {
  margin: 0 0 0.75rem;
  font-size: 1.25rem;
}

.manual-page__filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  padding: 0.75rem;
  border: 1px solid #d9d9d9;
  background: #fff;
}

label {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.875rem;
}

input,
select {
  border: 1px solid #c2c2c2;
  padding: 0.3rem 0.4rem;
}

button {
  align-self: end;
  border: 1px solid #1f2a44;
  background: #1f2a44;
  color: #fff;
  padding: 0.4rem 0.7rem;
  cursor: pointer;
}

.error {
  color: #9d1b1b;
}
</style>
