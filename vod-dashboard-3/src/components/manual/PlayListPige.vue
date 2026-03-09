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
              <th>Message réconciliation</th>
              <th>Découpe / Transcod</th>
              <th>Message découpe</th>
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
              <td>
                <span :class="['manual-status', `manual-status--${item.reconcile || 'idle'}`]">
                  <template v-if="item.reconcile === 'success'">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"/></svg>
                  </template>
                  <template v-else-if="item.reconcile === 'error'">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 6.4 17.6 5 12 10.6 6.4 5 5 6.4 10.6 12 5 17.6 6.4 19l5.6-5.6 5.6 5.6 1.4-1.4-5.6-5.6z"/></svg>
                  </template>
                  <template v-else>-</template>
                </span>
                </td>
              <td>{{ item.reconcileMessage || (item.reconcile === "success" ? "Succès" : item.reconcile === "error" ? "Erreur backend" : "") }}</td>
              <td>
                <span :class="['manual-status', `manual-status--${item.decoupe || 'idle'}`]">
                  <template v-if="item.decoupe === 'success'">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"/></svg>
                  </template>
                  <template v-else-if="item.decoupe === 'error'">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 6.4 17.6 5 12 10.6 6.4 5 5 6.4 10.6 12 5 17.6 6.4 19l5.6-5.6 5.6 5.6 1.4-1.4-5.6-5.6z"/></svg>
                  </template>
                  <template v-else>-</template>
                </span>
                </td>
              <td>{{ item.decoupeMessage || (item.decoupe === "success" ? "Succès" : item.decoupe === "error" ? "Erreur backend" : "") }}</td>
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
          <button class=manual-btn type="button" :disabled="!canReconcile" @click="openReconciliationModal">Réconciliation des produits</button>
          <button class=manual-btn type="button" :disabled="!canRunCutActions" @click="markDecoupeAll">Découper tous</button>
          <button class=manual-btn type="button" :disabled="!canRunCutActions" @click="markDecoupeTranscode">Découpe + transcodage auto</button>
          <button class=manual-btn type="button" :disabled="assignedEnhanced.length === 0" @click="clearAssigned">Effacer tout</button>
        </div>
      </div>

      <div class="panel panel--media">
        <header class="panel__header">Liste des médias disponibles</header>

        <div class="media-toolbar">
          <label>
            Répertoire :
            <select v-model="selectedRepertory">
              <option v-for="option in repertoryOptions" :key="option.value" :value="option.value">
                {{ option.text }}
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

    <div v-if="isReconciliationModalOpen" class="modal-overlay" @click.self="closeReconciliationModal">
      <section class="reconcile-modal">
        <header class="reconcile-modal__header">
          <h2>Association d'une clé de réconciliation</h2>
          <button type="button" class="close-btn" @click="closeReconciliationModal">✕</button>
        </header>

        <div class="reconcile-modal__body">
          <div class="panel selected-element">
            <header class="panel__header">Element sélectionné</header>
            <div class="selected-element__content">
              <p><strong>Titre :</strong> {{ selectedAssignedItem?.title ?? "" }}</p>
              <div class="selected-element__filters">
                <label>
                  Chaine:
                  <select v-model="reconciliationChannel">
                    <option v-for="channel in channels" :key="channel.value" :value="channel.value">
                      {{ channel.text }}
                    </option>
                  </select>
                </label>
                <label>
                  Date:
                  <input v-model="reconciliationDate" type="date"/>
                </label>
                <p><strong>Duration :</strong> {{ selectedAssignedItem?.durationLabel ?? "" }}</p>
                <button type="button" @click="searchPlannedProducts">Rechercher</button>
              </div>
            </div>
          </div>

          <div v-if="isSearchingPlannedProducts" class="loading-row">Chargement...</div>
          <div v-else class="table-wrap modal-table-wrap">
            <table>
              <thead>
              <tr>
                <th>Chaine</th>
                <th>Date/heure</th>
                <th>Titre</th>
                <th>Durée</th>
                <th>Episode</th>
                <th>Preview</th>
                <th>Début visib.</th>
                <th>Plateforme</th>
                <th>PAD</th>
              </tr>
              </thead>
              <tbody>
              <tr
                  v-for="(item, idx) in plannedProducts"
                  :key="`${String(item.idEpisode ?? idx)}-${idx}`"
                  :class="{ selected: selectedPlannedProductIndex === idx }"
                  @click="selectedPlannedProductIndex = idx"
              >
                <td>{{ String(item.channel ?? "") }}</td>
                <td>{{ String(item.plannedDateTime ?? "") }}</td>
                <td>{{ String(item.title ?? "") }}</td>
                <td>{{ String(item.duree ?? "") }}</td>
                <td>{{ String(item.idEpisode ?? "") }}</td>
                <td>{{ String(item.preview ?? "") }}</td>
                <td>{{ String(item?.plateformOffers?.[0]?.startDateTime ?? "") }}</td>
                <td>{{ String(item?.plateformOffers?.[0]?.name ?? "") }}</td>
                <td>{{ String(item.idStk ?? "") }}</td>
              </tr>
              </tbody>
            </table>
          </div>
        </div>

        <footer class="reconcile-modal__footer">
          <button type="button" :disabled="selectedPlannedProductIndex === null" @click="confirmReconciliation">Réconcilier</button>
        </footer>
      </section>
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
const {listPige: items, channels} = storeToRefs(playlistStore);

const selectedIds = ref(new Set<string>());
const selectedAssignedId = ref<string | null>(null);
const appStore = useAppStore();

type RepertoryOption = { value: string; text: string };

const repertoryOptions: RepertoryOption[] = [
  {value: "SnipRecLo", text: "SnipRecLo"},
  {value: "SnipRecHi", text: "SnipRecHi"},
  {value: "manuel", text: "Manuel"},
  {value: "Diva", text: "VodStock"},
];
const selectedRepertory = ref<string>(repertoryOptions[0].value);
const mediaList = ref<Array<Record<string, unknown>>>([]);

const assigned = computed(() => playlistStore.elementsToAssign as PlaylistItem[]);
const assignedEnhanced = computed(() => assigned.value as AssignedItem[]);
const selectedAssignedItem = computed(() =>
    assignedEnhanced.value.find((item) => item.traficId === selectedAssignedId.value) ?? null,
);
const canReconcile = computed(() => assignedEnhanced.value.length > 0 && selectedAssignedId.value !== null);
const canRunCutActions = computed(() =>
    assignedEnhanced.value.length > 0 && assignedEnhanced.value.every((item) => item.reconcile === "success"),
);

const isReconciliationModalOpen = ref(false);
const isSearchingPlannedProducts = ref(false);
const plannedProducts = ref<Array<Record<string, any>>>([]);
const selectedPlannedProductIndex = ref<number | null>(null);
const reconciliationDate = ref(appStore.sharedDate);
const reconciliationChannel = ref(playlistStore.searchCriteria.chaine || "LAUNE");

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

function openReconciliationModal() {
  if (!canReconcile.value) return;
  reconciliationDate.value = appStore.sharedDate;
  reconciliationChannel.value = playlistStore.searchCriteria.chaine || "LAUNE";
  plannedProducts.value = [];
  selectedPlannedProductIndex.value = null;
  isReconciliationModalOpen.value = true;
  void searchPlannedProducts();
}

function closeReconciliationModal() {
  isReconciliationModalOpen.value = false;
}

function getReconciliationChannels(channel: string) {
  if (channel === "NONLINEAIRE") return ",";
  const map: Record<string, string> = {
    LAUNE: "La Une",
    TIPIKTV: "Tipik",
    LATROIS: "La Trois",
    AUVIOKIDS: "Auvio Kids",
    "70ANS": "70 ans",
  };
  return map[channel] ?? channel;
}

function toLavaDate(value: string) {
  const [year, month, day] = value.split("-");
  return `${day}-${month}-${year}`;
}

async function searchPlannedProducts() {
  isSearchingPlannedProducts.value = true;
  selectedPlannedProductIndex.value = null;
  try {
    const http = useHttp("vod-manuel.reconcile.search");
    const channel = getReconciliationChannels(reconciliationChannel.value);
    const {data} = await http.get(`lava/plannedproductsbydate/${toLavaDate(reconciliationDate.value)}?channels=${channel}`);
    plannedProducts.value = Array.isArray(data) ? data : [];
  } catch {
    plannedProducts.value = [];
  } finally {
    isSearchingPlannedProducts.value = false;
  }
}

function confirmReconciliation() {
  if (selectedPlannedProductIndex.value === null || !selectedAssignedItem.value) return;
  const chosen = plannedProducts.value[selectedPlannedProductIndex.value];
  const current = [...assignedEnhanced.value];

  for (const item of current) {
    const selectedTitle = selectedAssignedItem.value.title;
    const isDatedTitle = /-\s*\d*\s*\(*\s*\d+\s*\/\s*\d+\s*\)*\s*$/.test(selectedTitle);
    const matchesTitle = isDatedTitle
        ? selectedTitle.slice(0, selectedTitle.lastIndexOf("-")) === item.title.slice(0, item.title.lastIndexOf("-"))
        : selectedTitle === item.title;

    if (matchesTitle) {
      (item as Record<string, unknown>).lavadata = [chosen];
      item.reconcile = "success";
      (item as Record<string, unknown>).reconcileMessage = "";
    }
  }

  playlistStore.setElementsToAssign(current);
  isReconciliationModalOpen.value = false;
}

function toIsoLocalDate(value: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
    const [day, month, year] = value.split("/");
    return `${year}-${month}-${day}`;
  }
  return value;
}

function getPlatforms(item: AssignedItem) {
  const lavadata = (item as Record<string, any>).lavadata;
  if (!Array.isArray(lavadata)) return [];
  return lavadata.map((entry: Record<string, any>) => ({
    name: entry?.plateformOffers?.[0]?.name ?? "",
    mediaId: item.fileName,
    offerName: entry?.plateformOffers?.[0]?.offerName ?? "",
    recordId: entry?.idRecord,
    reference: entry?.plateformOffers?.[0]?.caseReferenceExterne ?? "",
    recordVodXmlId: entry?.plateformOffers?.[0]?.recordvodxmlid ?? "",
    signaletique: {},
  }));
}

function createRestorePayload(item: AssignedItem, transcode: boolean) {
  const channel = playlistStore.searchCriteria.chaine || "";
  return {
    chaine: channel === "NONLINEAIRE" ? "" : channel,
    vodDay: toIsoLocalDate(item.broadcastDate),
    mediaId: item.fileName,
    episodeId: String((item as Record<string, any>).lavadata?.[0]?.idEpisode ?? ""),
    startDate: item.broadcastDateFull,
    duration: item.durationLabel,
    titre: item.title,
    segments: item.segment != null && item.traficId != null ? [{number: item.segment, traficId: item.traficId}] : [],
    publish: false,
    live: item.live,
    byAutomation: channel === "NONLINEAIRE" ? false : true,
    transcode,
    manual: true,
    platforms: getPlatforms(item),
  };
}

async function sendRestoreRequest(transcode: boolean) {
  if (!canRunCutActions.value) return;
  const current = [...assignedEnhanced.value];
  const payload = current.map((item) => createRestorePayload(item, transcode));

  try {
    const http = useHttp("vod-manuel.restore");
    await http.post("restore/service/record/start", payload);
    current.forEach((item) => {
      item.decoupe = "success";
      (item as Record<string, unknown>).decoupeMessage = "";
    });
  } catch (error) {
    const message = extractErrorMessage(error);
    current.forEach((item) => {
      item.decoupe = "error";
      (item as Record<string, unknown>).decoupeMessage = message;
    });
  }

  playlistStore.setElementsToAssign(current);
}

async function markDecoupeAll() {
  await sendRestoreRequest(false);
}

async function markDecoupeTranscode() {
  await sendRestoreRequest(true);
}

function extractErrorMessage(error: unknown): string {
  if (typeof error === "object" && error && "response" in error) {
    const response = (error as { response?: { data?: any } }).response;
    const message = response?.data?.message ?? response?.data?.error ?? "";
    if (typeof message === "string" && message.trim()) return message;
  }
  if (error instanceof Error && error.message) return error.message;
  return "Erreur backend";
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

button:disabled {
  background: #84b9c6;
  border-color: rgba(132, 185, 198, 0.45);
  color: #e8f5f9;
  cursor: not-allowed;
  opacity: 0.7;
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

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: grid;
  place-items: center;
  z-index: 20;
}

.reconcile-modal {
  width: min(1050px, 92vw);
  max-height: 88vh;
  overflow: auto;
  border-radius: 12px;
  border: 1px solid rgba(143, 215, 236, 0.22);
  background: #07233b;
}

.reconcile-modal__header,
.reconcile-modal__footer {
  padding: 0.65rem 0.8rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.reconcile-modal__body {
  padding: 0.8rem;
}

.reconcile-modal h2 {
  margin: 0;
  color: #fff;
}

.close-btn {
  width: auto;
  padding: 0.3rem 0.55rem;
}

.selected-element__content {
  padding: 0.7rem;
}

.selected-element__filters {
  display: grid;
  grid-template-columns: 1fr 1fr auto auto;
  align-items: center;
  gap: 0.65rem;
}

.selected-element__filters label {
  display: grid;
  grid-template-columns: auto 1fr;
  color: #ffffff;
}


.selected-element__filters input[type="date"]::-webkit-calendar-picker-indicator {
  filter: brightness(0) saturate(100%) invert(100%) sepia(0%) saturate(7464%) hue-rotate(54deg) brightness(106%) contrast(104%);
  cursor: pointer;
}

.selected-element__content p {
  color: #ffffff;
}

.modal-table-wrap {
  max-height: 50vh;
}

.manual-status {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-weight: 700;
}

.manual-status svg {
  width: 1rem;
  height: 1rem;
  fill: currentColor;
}

.manual-status--success {
  color: #36d399;
}

.manual-status--error {
  color: #f87171;
}

.manual-status--idle {
  color: #9fb9c8;
}


.loading-row {
  color: #d4edf6;
  text-align: center;
  padding: 1rem;
}
</style>
