<template>
  <section class="playlist">
    <header>
      <h2>Playlist de la pige</h2>
      <p>{{ items.length }} élément(s)</p>
    </header>

    <table>
      <thead>
        <tr>
          <th>Heure</th>
          <th>Titre</th>
          <th>Durée</th>
          <th>Trafic ID</th>
          <th>Segment</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in items" :key="`${item.traficId}-${item.broadcastDateFull}`">
          <td>{{ item.heure }}</td>
          <td>{{ item.title }}</td>
          <td>{{ item.durationLabel }}</td>
          <td>{{ item.traficId }}</td>
          <td>
            <input v-model="item.segment" type="text" />
          </td>
        </tr>
      </tbody>
    </table>
  </section>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { usePlaylistOffersStore } from "@/stores/playlist.offer";

const playlistStore = usePlaylistOffersStore();
const { listPige: items } = storeToRefs(playlistStore);
</script>

<style scoped lang="scss">
.playlist {
  margin-top: 1rem;
  border: 1px solid #d9d9d9;
  background: #fff;
  padding: 0.75rem;
}

header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

h2,
p {
  margin: 0;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  border: 1px solid #ececec;
  padding: 0.35rem;
  font-size: 0.875rem;
}

input {
  width: 100%;
  border: 1px solid #c2c2c2;
  padding: 0.2rem;
}
</style>
