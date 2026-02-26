<template>
  <section class="playlist-layout">
    <div class="panel">
      <header class="panel__header">PlayList De La pige</header>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Heure</th>
            <th>Titre Asrun</th>
            <th>Nom du fichier</th>
            <th>Durée</th>
            <th>Clé SGT</th>
            <th>segment</th>
            <th>live</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="item in items"
            :key="`${item.traficId}-${item.broadcastDateFull}`"
            :class="{ selected: selectedIds.has(item.traficId) }"
            @click="toggle(item)"
          >
            <td>{{ item.broadcastDate }}</td>
            <td>{{ item.heure }}</td>
            <td>{{ item.title }}</td>
            <td>{{ item.fileName }}</td>
            <td>{{ item.durationLabel }}</td>
            <td>{{ item.traficId }}</td>
            <td><input v-model="item.segment" type="text" /></td>
            <td>{{ item.live ? "1" : "0" }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="actions">
      <button type="button" @click="addSelected">Ajouter</button>
      <button type="button" @click="removeSelected">Retirer</button>
    </div>

    <div class="panel">
      <header class="panel__header">Séquences sélectionnées</header>
      <table>
        <thead>
          <tr>
            <th>Titre Asrun</th>
            <th>Heure</th>
            <th>Durée</th>
            <th>Clé SGT</th>
            <th>segment</th>
            <th>live</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in assigned" :key="`${item.traficId}-${item.broadcastDateFull}-assigned`">
            <td>{{ item.title }}</td>
            <td>{{ item.heure }}</td>
            <td>{{ item.durationLabel }}</td>
            <td>{{ item.traficId }}</td>
            <td>{{ item.segment }}</td>
            <td>{{ item.live ? "1" : "0" }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { storeToRefs } from "pinia";
import { usePlaylistOffersStore } from "@/stores/playlist.offer";

const playlistStore = usePlaylistOffersStore();
const { listPige: items } = storeToRefs(playlistStore);
const selectedIds = ref(new Set<string>());

const assigned = computed(() => playlistStore.elementsToAssign as typeof items.value);

function toggle(item: { traficId: string }) {
  if (selectedIds.value.has(item.traficId)) selectedIds.value.delete(item.traficId);
  else selectedIds.value.add(item.traficId);
}

function addSelected() {
  const current = playlistStore.elementsToAssign as typeof items.value;
  const added = items.value.filter((item) => selectedIds.value.has(item.traficId));
  const merge = [...current];
  for (const item of added) {
    if (!merge.some((existing) => existing.traficId === item.traficId)) merge.push(item);
  }
  playlistStore.setElementsToAssign(merge);
}

function removeSelected() {
  const current = playlistStore.elementsToAssign as typeof items.value;
  playlistStore.setElementsToAssign(current.filter((item) => !selectedIds.value.has(item.traficId)));
  selectedIds.value.clear();
}
</script>

<style scoped lang="scss">
.playlist-layout {
  margin-top: 1rem;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 0.8rem;
}

.panel {
  border: 1px solid #d9d9d9;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
}

.panel__header {
  background: #333b47;
  color: #fff;
  padding: 0.45rem 0.6rem;
  font-weight: 600;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  border: 1px solid #ececec;
  padding: 0.35rem;
  font-size: 0.84rem;
}

.selected {
  background: #d9edf7;
}

input {
  width: 100%;
}

.actions {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.5rem;
}

button {
  border: 1px solid #333b47;
  background: #333b47;
  color: #fff;
  padding: 0.35rem 0.6rem;
}
</style>
