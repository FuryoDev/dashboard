<template>
  <section class="playlist-layout">
    <div class="panel panel--left">
      <header class="panel__header">PlayList De La pige</header>
      <div class="panel__body table-wrap">
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
    </div>

    <div class="actions">
      <button type="button" @click="addSelected">≫ Ajouter</button>
      <button type="button" @click="removeSelected">≪ Retirer</button>
    </div>

    <div class="right-column">
      <div class="panel">
        <header class="panel__header">Séquences sélectionnées</header>
        <div class="panel__body table-wrap">
          <table>
            <thead>
              <tr>
                <th>Réconcilier</th>
                <th>Découpe / Transcod</th>
                <th>Date</th>
                <th>Titre Asrun</th>
                <th>Nom du fichier</th>
                <th>Heure</th>
                <th>Durée</th>
                <th>Clé SGT</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in assignedEnhanced" :key="`${item.traficId}-${item.broadcastDateFull}-assigned`">
                <td>{{ item.reconcile }}</td>
                <td>{{ item.decoupe }}</td>
                <td>{{ item.broadcastDate }}</td>
                <td>{{ item.title }}</td>
                <td>{{ item.fileName }}</td>
                <td>{{ item.heure }}</td>
                <td>{{ item.durationLabel }}</td>
                <td>{{ item.traficId }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="panel__actions">
          <button type="button" @click="markReconcile">Réconciliation des produits</button>
          <button type="button" @click="markDecoupeAll">Découper tous</button>
          <button type="button" @click="markDecoupeTranscode">Découpe + transcodage auto</button>
          <button type="button" @click="clearAssigned">Effacer tout</button>
        </div>
      </div>

      <div class="panel panel--media">
        <header class="panel__header">Liste des médias disponibles</header>

        <div class="media-toolbar">
          <label>
            Répertoire :
            <select v-model="selectedRepertory">
              <option v-for="option in repertoryOptions" :key="option" :value="option">{{ option }}</option>
            </select>
          </label>
          <button type="button" @click="loadMediaList">⟳</button>
        </div>

        <div class="panel__body table-wrap">
          <table>
            <thead>
              <tr>
                <th>Réconcilier</th>
                <th>Transcod</th>
                <th>Ordre</th>
                <th>Statut</th>
                <th>Filière</th>
                <th>Chaîne</th>
                <th>Titre</th>
                <th>Episode</th>
                <th>MediaID</th>
                <th>Seg</th>
                <th>Date de début</th>
                <th>Date de fin</th>
                <th>Création date</th>
                <th>Path</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, idx) in mediaList" :key="`${String(item.path ?? idx)}-${idx}`">
                <td>{{ String(item.reconcile ?? '') }}</td>
                <td>{{ String(item.transcod ?? '') }}</td>
                <td>{{ String(item.orderseg ?? item.order ?? '') }}</td>
                <td>{{ String(item.status ?? '') }}</td>
                <td>{{ String(item.filiere ?? '') }}</td>
                <td>{{ String(item.chaine ?? '') }}</td>
                <td>{{ String(item.title ?? '') }}</td>
                <td>{{ String(item.episodeId ?? '') }}</td>
                <td>{{ String(item.mediaId ?? '') }}</td>
                <td>{{ String(item.segment ?? '') }}</td>
                <td>{{ String(item.startDate ?? '') }}</td>
                <td>{{ String(item.endDate ?? '') }}</td>
                <td>{{ String(item.creationDate ?? '') }}</td>
                <td>{{ String(item.path ?? '') }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { storeToRefs } from "pinia";
import { usePlaylistOffersStore } from "@/stores/playlist.offer";
import { useHttp } from "@/composables/useHttp";
import type { PlaylistItem } from "@/types/domain";

type AssignedItem = PlaylistItem & {
  reconcile?: string;
  decoupe?: string;
};

const playlistStore = usePlaylistOffersStore();
const { listPige: items } = storeToRefs(playlistStore);
const selectedIds = ref(new Set<string>());
const selectedRepertory = ref("NONLINEAIRE");
const mediaList = ref<Array<Record<string, unknown>>>([]);
const repertoryOptions = ["NONLINEAIRE", "LAUNE", "TIPIK", "AUVIO"];

const assigned = computed(() => playlistStore.elementsToAssign as (typeof items.value));
const assignedEnhanced = computed(() => assigned.value as AssignedItem[]);

function toggle(item: { traficId: string }) {
  if (selectedIds.value.has(item.traficId)) selectedIds.value.delete(item.traficId);
  else selectedIds.value.add(item.traficId);
}

function addSelected() {
  const current = playlistStore.elementsToAssign as typeof items.value;
  const added = items.value.filter((item) => selectedIds.value.has(item.traficId));
  const merge = [...current] as AssignedItem[];
  for (const item of added as AssignedItem[]) {
    if (!merge.some((existing) => existing.traficId === item.traficId)) {
      merge.push({ ...item, reconcile: "", decoupe: "" });
    }
  }
  playlistStore.setElementsToAssign(merge);
}

function removeSelected() {
  const current = playlistStore.elementsToAssign as typeof items.value;
  playlistStore.setElementsToAssign(current.filter((item) => !selectedIds.value.has(item.traficId)));
  selectedIds.value.clear();
}

function markReconcile() {
  const current = [...assignedEnhanced.value];
  current.forEach((item) => {
    item.reconcile = "OK";
  });
  playlistStore.setElementsToAssign(current);
}

function markDecoupeAll() {
  const current = [...assignedEnhanced.value];
  current.forEach((item) => {
    item.decoupe = "DECOUPE";
  });
  playlistStore.setElementsToAssign(current);
}

function markDecoupeTranscode() {
  const current = [...assignedEnhanced.value];
  current.forEach((item) => {
    item.decoupe = "DECOUPE+TRANSCOD";
  });
  playlistStore.setElementsToAssign(current);
}

function clearAssigned() {
  playlistStore.setElementsToAssign([]);
}

async function loadMediaList() {
  try {
    const http = useHttp("vod-manual.loadMediaList");
    const { data } = await http.get(`restore/service/mediarestore/${selectedRepertory.value}`);
    mediaList.value = Array.isArray(data) ? data : [];
  } catch {
    mediaList.value = [];
  }
}

onMounted(async () => {
  await loadMediaList();
});
</script>

<style scoped lang="scss">
.playlist-layout {
  margin-top: 1rem;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  gap: 0.8rem;
}

.right-column {
  display: grid;
  grid-template-rows: auto auto;
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

.panel__body {
  padding: 0;
}

.table-wrap {
  max-height: 42vh;
  overflow: auto;
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
  white-space: nowrap;
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
  justify-content: flex-start;
  padding-top: 0.8rem;
  gap: 0.5rem;
}

button {
  border: 1px solid #333b47;
  background: #333b47;
  color: #fff;
  padding: 0.35rem 0.6rem;
}

.panel__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  padding: 0.6rem;
}

.media-toolbar {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem;
}

.media-toolbar label {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.media-toolbar select {
  min-width: 220px;
}
</style>
