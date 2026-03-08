<template>
  <section class="playlist-layout">
    <!-- LEFT: playlist pige -->
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
            <td><input v-model="item.segment" type="text"/></td>
            <td>{{ item.live ? "1" : "0" }}</td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- MIDDLE: actions -->
    <div class="actions">
      <button type="button" :disabled="selectedIds.size === 0" @click="addSelected">≫ Ajouter</button>
      <button type="button" :disabled="selectedAssignedId === null" @click="removeSelected">≪ Retirer</button>
    </div>

    <!-- RIGHT: selected + media list -->
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
            <tr
                v-for="item in assignedEnhanced"
                :key="`${item.traficId}-${item.broadcastDateFull}-assigned`"
                :class="{ selected: selectedAssignedId === item.traficId }"
                @click="selectedAssignedId = item.traficId"
            >
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
          <button class=manual-btn type="button" :disabled="!canReconcile" @click="markReconcile">Réconciliation des produits</button>
          <button class=manual-btn type="button" :disabled="assignedEnhanced.length === 0" @click="markDecoupeAll">Découper tous</button>
          <button class=manual-btn type="button" :disabled="assignedEnhanced.length === 0" @click="markDecoupeTranscode">Découpe + transcodage auto</button>
          <button class=manual-btn type="button" :disabled="assignedEnhanced.length === 0" @click="clearAssigned">Effacer tout</button>
        </div>
      </div>

      <div class="panel panel--media">
        <header class="panel__header">Liste des médias disponibles</header>

        <div class="media-toolbar">
          <label>
            Répertoire :
            <select v-model="selectedRepertory">
              <option v-for="option in repertoryOptions" :key="option" :value="option">
                {{ option }}
              </option>
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
              <td>{{ String(item.reconcile ?? "") }}</td>
              <td>{{ String(item.transcod ?? "") }}</td>
              <td>{{ String(item.orderseg ?? item.order ?? "") }}</td>
              <td>{{ String(item.status ?? "") }}</td>
              <td>{{ String(item.filiere ?? "") }}</td>
              <td>{{ String(item.chaine ?? "") }}</td>
              <td>{{ String(item.title ?? "") }}</td>
              <td>{{ String(item.episodeId ?? "") }}</td>
              <td>{{ String(item.mediaId ?? "") }}</td>
              <td>{{ String(item.segment ?? "") }}</td>
              <td>{{ String(item.startDate ?? "") }}</td>
              <td>{{ String(item.endDate ?? "") }}</td>
              <td>{{ String(item.creationDate ?? "") }}</td>
              <td>{{ String(item.path ?? "") }}</td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import {computed, onMounted, ref} from "vue";
import {storeToRefs} from "pinia";
import {usePlaylistOffersStore} from "@/stores/playlist.offer";
import {useHttp} from "@/composables/useHttp";
import {useAppStore} from "@/stores/app.store";
import type {PlaylistItem} from "@/types/domain";

type AssignedItem = PlaylistItem & {
  reconcile?: string;
  decoupe?: string;
};

const playlistStore = usePlaylistOffersStore();
const {listPige: items} = storeToRefs(playlistStore);

const selectedIds = ref(new Set<string>());
const selectedAssignedId = ref<string | null>(null);
const appStore = useAppStore();

const selectedRepertory = ref("NONLINEAIRE");
const repertoryOptions = ["NONLINEAIRE", "LAUNE", "TIPIK", "AUVIO"];
const mediaList = ref<Array<Record<string, unknown>>>([]);

const assigned = computed(() => playlistStore.elementsToAssign as PlaylistItem[]);
const assignedEnhanced = computed(() => assigned.value as AssignedItem[]);
const canReconcile = computed(() => assignedEnhanced.value.length > 0 && selectedAssignedId.value !== null);

function toggle(item: { traficId: string }) {
  if (selectedIds.value.has(item.traficId)) selectedIds.value.delete(item.traficId);
  else selectedIds.value.add(item.traficId);
}

function addSelected() {
  const current = (playlistStore.elementsToAssign as AssignedItem[]) ?? [];
  const added = (items.value ?? []).filter((item) => selectedIds.value.has(item.traficId));

  const merge = [...current] as AssignedItem[];
  for (const item of added as AssignedItem[]) {
    if (!merge.some((existing) => existing.traficId === item.traficId)) {
      merge.push({...item, reconcile: "", decoupe: ""});
    }
  }
  playlistStore.setElementsToAssign(merge);
}

function removeSelected() {
  if (!selectedAssignedId.value) return;
  const current = (playlistStore.elementsToAssign as PlaylistItem[]) ?? [];
  playlistStore.setElementsToAssign(current.filter((item) => item.traficId !== selectedAssignedId.value));
  selectedAssignedId.value = null;
}

async function markReconcile() {
  if (!canReconcile.value) return;
  const current = [...assignedEnhanced.value];
  const selected = current.find((item) => item.traficId === selectedAssignedId.value);
  if (!selected) return;

  try {
    const http = useHttp("vod-manuel.reconcile");
    const date = appStore.sharedDate.split("-").reverse().join("/");
    const {data} = await http.get(`lava/plannedproductsbydate/${date}?channels=LAUNE,TIPIK,AUVIO,PROXIMUS`);
    const planned = Array.isArray(data) ? data : [];
    current.forEach((item) => {
      const match = planned.some((product: Record<string, unknown>) => String(product.title ?? "") === String(item.title ?? ""));
      item.reconcile = match ? "success" : "error";
      if (match) {
        (item as Record<string, unknown>).lavadata = planned.filter((product: Record<string, unknown>) => String(product.title ?? "") === String(item.title ?? ""));
      }
    });
  } catch {
    current.forEach((item) => (item.reconcile = "error"));
  }

  playlistStore.setElementsToAssign(current);
}

async function sendRestoreRequest(transcode: boolean) {
  const current = [...assignedEnhanced.value];
  const payload = current.map((item) => ({
    chaine: "",
    vodDay: appStore.sharedDate.split("-").reverse().join("/"),
    mediaId: item.fileName,
    episodeId: String((item as Record<string, unknown>).lavadata?.[0]?.idEpisode ?? ""),
    startDate: item.broadcastDateFull,
    duration: item.durationLabel,
    titre: item.title,
    segments: [{number: item.segment, traficId: item.traficId}],
    publish: false,
    live: item.live,
    byAutomation: false,
    transcode,
    manual: true,
    platforms: [],
  }));

  try {
    const http = useHttp("vod-manuel.restore");
    await http.post("restore/service/record/start", payload);
    current.forEach((item) => (item.decoupe = "success"));
  } catch {
    current.forEach((item) => (item.decoupe = "error"));
  }

  playlistStore.setElementsToAssign(current);
}

async function markDecoupeAll() {
  await sendRestoreRequest(false);
}

async function markDecoupeTranscode() {
  await sendRestoreRequest(true);
}

function clearAssigned() {
  playlistStore.setElementsToAssign([]);
  selectedAssignedId.value = null;
}

async function loadMediaList() {
  try {
    const http = useHttp("vod-manual.loadMediaList");
    const {data} = await http.get(`restore/service/mediarestore/${selectedRepertory.value}`);
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
  border: 1px solid rgba(143, 215, 236, 0.2);
  background: rgba(8, 32, 56, 0.85);
  border-radius: 12px;
  overflow: hidden;
}

.panel__header {
  background: #0b2038;
  color: #fff;
  padding: 0.55rem 0.7rem;
  font-weight: 700;
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

  th,
  td {
    border-bottom: 1px solid rgba(143, 215, 236, 0.15);
    padding: 0.5rem;
    font-size: 0.84rem;
    white-space: nowrap;
    color: #d4edf6;
    text-align: left;
  }

  th {
    position: sticky;
    top: 0;
    background: #0f2b45;
    color: #ffffff;
    z-index: 1;
  }
}

.selected {
  background: rgba(46, 208, 242, 0.28);
}

input,
select {
  width: 100%;
  border: 1px solid rgba(143, 215, 236, 0.4);
  border-radius: 8px;
  background: #0f2b45;
  color: #d4edf6;
  padding: 0.4rem 0.5rem;
}

.actions {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-top: 0.8rem;
  gap: 0.5rem;
}

button {
  border: 1px solid rgba(46, 208, 242, 0.35);
  border-radius: 8px;
  background: #2ed0f2;
  color: #083047;
  padding: 0.45rem 0.7rem;
  width: 100%;
  font-weight: 700;
  cursor: pointer;
}

.panel__actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.5rem;
  padding: 0.6rem;
}

.media-toolbar {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem;
}

.media-toolbar label {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: #d4edf6;
}

.media-toolbar select {
  min-width: 220px;
}

.manual-btn {
  width: 100%;
}
</style>
