<template>
  <section class="playlist-layout">
    <!-- LEFT: playlist pige -->
    <div class="panel panel--left">
      <header class="panel__header">PlayList De La pige</header>
      <div class="panel__body table-wrap  table-wrap--no-limit">
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
        <div class="panel__body table-wrap table-wrap--no-limit">
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
              <th>Segment</th>
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
              <td>{{ item.segment }}</td>
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
          <button type="button" @click="loadMediaList">Actualiser</button>
        </div>

        <div class="panel__body table-wrapp table-wrap--no-limit">
          <table>
            <thead>
            <tr>
              <th
                  v-for="column in mediaColumns"
                  :key="column.key"
                  :class="{ 'order-column': column.key === 'orderseg' }"
              >
                {{ column.label }}
              </th>
            </tr>
            </thead>
            <tbody>
            <tr
                v-for="(item, idx) in mediaList"
                :key="`${String(item.path ?? idx)}-${idx}`"
                :class="{ selected: selectedMediaIndexes.has(idx) }"
                @click="onMediaRowClick(idx, $event)"
                @contextmenu.prevent="onMediaRowContextMenu(idx, $event)"
            >
              <td
                  v-for="column in mediaColumns"
                  :key="`${column.key}-${idx}`"
                  :class="{ 'order-column': column.key === 'orderseg' }"
              >
                <template v-if="column.key === 'reconcile' || column.key === 'transcod'">
                  <span :class="['manual-status', `manual-status--${mediaIconState(item[column.key])}`]">
                    <template v-if="mediaIconState(item[column.key]) === 'success'">✓</template>
                    <template v-else-if="mediaIconState(item[column.key]) === 'error'">✕</template>
                    <template v-else>•</template>
                  </span>
                </template>
                <template v-else-if="column.key === 'orderseg'">
                  <input v-model="(item as Record<string, unknown>).orderseg" class="order-input" type="number"/>
                </template>
                <template v-else-if="column.key === 'status'">
                  <span
                      v-if="String(item.status ?? '').trim().length > 0"
                      :class="getStatusClass(String(item.status ?? ''))"
                  >
                    {{ String(item.status ?? "") }}
                  </span>
                </template>
                <template v-else>
                  {{ String(item[column.key] ?? "") }}
                </template>
              </td>
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
              <p><strong>Titre :</strong> {{ selectedReconciliationItem?.title ?? "" }}</p>
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
                <p><strong>Duration :</strong> {{ selectedReconciliationItem?.durationLabel ?? "" }}</p>
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
                  :class="{ selected: selectedPlannedProductIndexes.has(idx) }"
                  @click="onPlannedProductRowClick(idx, $event)"
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
          <button type="button" :disabled="selectedPlannedProductIndexes.size === 0" @click="confirmReconciliation">Réconcilier</button>
        </footer>
      </section>
    </div>

    <ul
        v-if="isMediaContextMenuOpen"
        class="context-menu"
        :style="{ top: `${mediaContextMenuPosition.y}px`, left: `${mediaContextMenuPosition.x}px` }"
    >
      <li @click="showReconciliationScreen">Réconciliation des données</li>
      <li @click="askToConfirmChoice">Demande de transcodage</li>
      <li @click="copyPath">Copier le path du fichier</li>
    </ul>

    <div v-if="confirmPublication" class="modal-overlay" @click.self="confirmPublication = false">
      <section class="publish-modal">
        <h3>Transcodage avec/sans publication</h3>
        <p>Vous voulez les publier ?</p>
        <div class="publish-modal__content">
          <div class="publish-modal__radios">
            <label><input v-model="choicepubli" type="radio" value="oui"/> <span>Oui</span></label>
            <label><input v-model="choicepubli" type="radio" value="non"/> <span>Non</span></label>
          </div>
          <div class="publish-modal__actions">
            <button type="button" @click="decoupeTranscodeFromRepertory">Confirmer</button>
            <button type="button" @click="confirmPublication = false">Annuler</button>
          </div>
        </div>
      </section>
    </div>
  </section>
</template>

<script setup lang="ts">
import {computed, onBeforeUnmount, onMounted, ref} from "vue";
import {storeToRefs} from "pinia";
import {usePlaylistOffersStore} from "@/stores/playlist.offer";
import {useHttp} from "@/composables/useHttp";
import {useAppStore} from "@/stores/app.store";
import type {PlaylistItem} from "@/types/domain";
import {getStatusClass} from "@/utils/status";

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
type MediaColumn = { key: string; label: string };

const repertoryOptions: RepertoryOption[] = [
  {value: "SnipRecLo", text: "SnipRecLo"},
  {value: "SnipRecHi", text: "SnipRecHi"},
  {value: "manuel", text: "Manuel"},
  {value: "Diva", text: "VodStock"},
];
const selectedRepertory = ref<string>(repertoryOptions[0].value);
const mediaList = ref<Array<Record<string, unknown>>>([]);
const mediaColumns: MediaColumn[] = [
  {key: "reconcile", label: "Réconcilier"},
  {key: "transcod", label: "Transcod"},
  {key: "orderseg", label: "Ordre"},
  {key: "status", label: "Statut"},
  {key: "filiere", label: "Filière"},
  {key: "chaine", label: "Chaine"},
  {key: "title", label: "Titre"},
  {key: "episodeId", label: "Episode"},
  {key: "mediaId", label: "MediaID"},
  {key: "segment", label: "Seg"},
  {key: "start", label: "Date de début"},
  {key: "finishedDate", label: "Date de fin"},
  {key: "creation", label: "Création date"},
  {key: "destination", label: "Path"},
];
const selectedMediaIndexes = ref(new Set<number>());
const selectedMediaAnchor = ref<number | null>(null);
const isMediaContextMenuOpen = ref(false);
const mediaContextMenuPosition = ref({x: 0, y: 0});
const confirmPublication = ref(false);
const choicepubli = ref<"oui" | "non">("oui");
const openFromRepertory = ref(false);

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
const selectedPlannedProductIndexes = ref(new Set<number>());
const selectedPlannedProductAnchor = ref<number | null>(null);
const reconciliationDate = ref(appStore.sharedDate);
const reconciliationChannel = ref(
    playlistStore.searchCriteria.chaine && playlistStore.searchCriteria.chaine !== "NONLINEAIRE"
        ? playlistStore.searchCriteria.chaine
        : "LAUNE",
);
const selectedReconciliationItem = computed<Record<string, any> | null>(() => {
  if (openFromRepertory.value) return selectedRepertoryRows()[0] ?? null;
  return selectedAssignedItem.value;
});

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
  openFromRepertory.value = false;
  reconciliationDate.value = appStore.sharedDate;
  reconciliationChannel.value =
      playlistStore.searchCriteria.chaine && playlistStore.searchCriteria.chaine !== "NONLINEAIRE"
          ? playlistStore.searchCriteria.chaine
          : "LAUNE";
  plannedProducts.value = [];
  selectedPlannedProductIndexes.value.clear();
  selectedPlannedProductAnchor.value = null;
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
  selectedPlannedProductIndexes.value.clear();
  selectedPlannedProductAnchor.value = null;
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

function onPlannedProductRowClick(index: number, event: MouseEvent) {
  if (event.shiftKey && selectedPlannedProductAnchor.value !== null) {
    const start = Math.min(selectedPlannedProductAnchor.value, index);
    const end = Math.max(selectedPlannedProductAnchor.value, index);
    const range = new Set<number>();
    for (let i = start; i <= end; i += 1) {
      range.add(i);
    }
    selectedPlannedProductIndexes.value = range;
    return;
  }

  if (event.ctrlKey || event.metaKey) {
    const next = new Set(selectedPlannedProductIndexes.value);
    if (next.has(index)) {
      next.delete(index);
    } else {
      next.add(index);
    }
    selectedPlannedProductIndexes.value = next;
    selectedPlannedProductAnchor.value = index;
    return;
  }

  selectedPlannedProductIndexes.value = new Set([index]);
  selectedPlannedProductAnchor.value = index;
}

function confirmReconciliation() {
  if (selectedPlannedProductIndexes.value.size === 0) return;
  const chosen = Array.from(selectedPlannedProductIndexes.value)
      .sort((left, right) => left - right)
      .map((index) => plannedProducts.value[index])
      .filter((entry): entry is Record<string, any> => Boolean(entry));
  if (openFromRepertory.value) {
    for (const index of selectedMediaIndexes.value) {
      const row = mediaList.value[index];
      if (!row) continue;
      (row as Record<string, unknown>).lavadata = chosen;
      (row as Record<string, unknown>).reconcile = "success";
    }
    isReconciliationModalOpen.value = false;
    return;
  }
  if (!selectedAssignedItem.value) return;
  const current = [...assignedEnhanced.value];

  for (const item of current) {
    const selectedTitle = selectedAssignedItem.value.title;
    const isDatedTitle = /-\s*\d*\s*\(*\s*\d+\s*\/\s*\d+\s*\)*\s*$/.test(selectedTitle);
    const matchesTitle = isDatedTitle
        ? selectedTitle.slice(0, selectedTitle.lastIndexOf("-")) === item.title.slice(0, item.title.lastIndexOf("-"))
        : selectedTitle === item.title;

    if (matchesTitle) {
      (item as Record<string, unknown>).lavadata = chosen;
      item.reconcile = "success";
      (item as Record<string, unknown>).reconcileMessage = "";
    }
  }

  playlistStore.setElementsToAssign(current);
  isReconciliationModalOpen.value = false;
}

function onMediaRowClick(index: number, event: MouseEvent) {
  if (event.shiftKey && selectedMediaAnchor.value !== null) {
    const start = Math.min(selectedMediaAnchor.value, index);
    const end = Math.max(selectedMediaAnchor.value, index);
    const range = new Set<number>();
    for (let i = start; i <= end; i += 1) range.add(i);
    selectedMediaIndexes.value = range;
    return;
  }
  if (event.ctrlKey || event.metaKey) {
    const next = new Set(selectedMediaIndexes.value);
    if (next.has(index)) next.delete(index);
    else next.add(index);
    selectedMediaIndexes.value = next;
    selectedMediaAnchor.value = index;
    return;
  }
  selectedMediaIndexes.value = new Set([index]);
  selectedMediaAnchor.value = index;
}

function onMediaRowContextMenu(index: number, event: MouseEvent) {
  if (!selectedMediaIndexes.value.has(index)) {
    selectedMediaIndexes.value = new Set([index]);
    selectedMediaAnchor.value = index;
  }
  mediaContextMenuPosition.value = {x: event.clientX, y: event.clientY};
  isMediaContextMenuOpen.value = true;
}

function closeMediaContextMenu() {
  isMediaContextMenuOpen.value = false;
}

function mediaIconState(value: unknown): "success" | "error" | "idle" {
  if (value === "success" || value === false) return "success";
  if (value === "error" || value === true) return "error";
  return "idle";
}

function askToConfirmChoice() {
  closeMediaContextMenu();
  confirmPublication.value = true;
}

function selectedRepertoryRows() {
  return Array.from(selectedMediaIndexes.value)
      .sort((a, b) => a - b)
      .map((index) => mediaList.value[index])
      .filter((row): row is Record<string, any> => Boolean(row));
}

function showReconciliationScreen() {
  closeMediaContextMenu();
  openFromRepertory.value = true;
  reconciliationDate.value = appStore.sharedDate;
  reconciliationChannel.value =
      playlistStore.searchCriteria.chaine && playlistStore.searchCriteria.chaine !== "NONLINEAIRE"
          ? playlistStore.searchCriteria.chaine
          : "LAUNE";
  plannedProducts.value = [];
  selectedPlannedProductIndexes.value.clear();
  selectedPlannedProductAnchor.value = null;
  isReconciliationModalOpen.value = true;
  void searchPlannedProducts();
}

async function copyPath() {
  closeMediaContextMenu();
  const row = selectedRepertoryRows()[0];
  const path = String(row?.destination ?? "");
  if (!path) return;
  await navigator.clipboard.writeText(path);
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
    mediaList.value = Array.isArray(data)
        ? data.map((item) => ({
          ...item,
          orderseg: item.segment ?? "",
          reconcile: "",
          transcod: "",
          lavadata: [],
          finishedDate: typeof item.finishedDate === "string" ? item.finishedDate.replace("T", "  ") : "",
          creation: typeof item.creation === "string" ? item.creation.replace("T", "  ") : "",
        }))
        : [];
  } catch {
    mediaList.value = [];
  }
}

function toSlashDate(value: string) {
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}

function getPlatformsFromLavadata(row: Record<string, any>) {
  const lava = Array.isArray(row.lavadata) ? row.lavadata : [];
  return lava.map((entry: Record<string, any>) => ({
    name: entry?.plateformOffers?.[0]?.name ?? "",
    mediaId: row.fileName ?? "",
    offerName: entry?.plateformOffers?.[0]?.offerName ?? "",
    recordId: entry?.idRecord,
    reference: entry?.plateformOffers?.[0]?.caseReferenceExterne ?? "",
    recordVodXmlId: entry?.plateformOffers?.[0]?.recordvodxmlid ?? "",
    signaletique: {},
  }));
}

function buildRestoreFromRepertory(row: Record<string, any>, publish: boolean) {
  const channel = playlistStore.searchCriteria.chaine || "";
  const firstLava = Array.isArray(row.lavadata) ? row.lavadata[0] : null;
  return {
    chaine: channel === "NONLINEAIRE" ? "" : channel,
    vodDay: toSlashDate(appStore.sharedDate),
    mediaId: firstLava?.idStk ?? "",
    episodeId: firstLava?.idEpisode ?? "",
    titre: row.title ?? "",
    filiere: selectedRepertory.value,
    segments: [{number: row.orderseg, name: row.destination}],
    publish,
    transcode: true,
    byAutomation: channel !== "NONLINEAIRE",
    manual: true,
    platforms: getPlatformsFromLavadata(row),
  };
}

async function decoupeTranscodeFromRepertory() {
  const rows = selectedRepertoryRows();
  if (!rows.length) {
    confirmPublication.value = false;
    return;
  }
  const payload = rows
      .filter((row) => Array.isArray(row.lavadata) && row.lavadata.length > 0)
      .map((row) => buildRestoreFromRepertory(row, choicepubli.value === "oui"));
  if (!payload.length) {
    rows.forEach((row) => {
      row.transcod = "error";
    });
    confirmPublication.value = false;
    return;
  }
  try {
    const http = useHttp("vod-manual.restore.repertory");
    await http.post("restore/service/record/save", payload);
    rows.forEach((row) => {
      row.transcod = "success";
    });
  } catch {
    rows.forEach((row) => {
      row.transcod = "error";
    });
  } finally {
    confirmPublication.value = false;
  }
}

onMounted(async () => {
  document.addEventListener("click", closeMediaContextMenu);
  if (reconciliationChannel.value === "NONLINEAIRE") {
    reconciliationChannel.value = "LAUNE";
  }
  await loadMediaList();
});

onBeforeUnmount(() => {
  document.removeEventListener("click", closeMediaContextMenu);
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

.table-wrap--no-limit {
  max-height: none;
  overflow: visible;
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

.order-column {
  min-width: 3.2m;
}

.order-input {
  min-width: 3.2rem;
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
  align-self: start;
  position: sticky;
  top: 50vh;
  transform: translateY(-50%);
  gap: 0.5rem;
  z-index: 5;
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
  max-width: 220px;
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
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  flex-wrap: wrap;
  gap: 0.65rem;
}

.selected-element__filters label {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  color: #ffffff;
}

.selected-element__filters label select,
.selected-element__filters label input[type="date"] {
  min-width: 170px;
  width: auto;
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

.context-menu {
  position: fixed;
  z-index: 30;
  min-width: 260px;
  list-style: none;
  margin: 0;
  padding: 0.4rem 0;
  border: 1px solid rgba(143, 215, 236, 0.28);
  border-radius: 10px;
  background: #07233b;
}

.context-menu li {
  padding: 0.55rem 0.8rem;
  color: #d4edf6;
  cursor: pointer;
}

.context-menu li:hover {
  background: rgba(46, 208, 242, 0.2);
}

.publish-modal {
  width: min(420px, 90vw);
  border-radius: 12px;
  border: 1px solid rgba(143, 215, 236, 0.22);
  background: #07233b;
  color: #fff;
  padding: 1rem;
  display: grid;
  gap: 0.6rem;
}

.publish-modal__content {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: start;
  gap: 0.8rem;
}

.publish-modal__radios {
  display: grid;
  gap: 0.45rem;
}

.publish-modal__radios label {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

.publish-modal__actions {
  display: grid;
  gap: 0.45rem;
  align-items: stretch;
}

:deep(.status-pill) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 1.35rem;
  padding: 0.15rem 0.35rem;
  border-radius: 999px;
  text-align: center;
  font-size: 0.74rem;
  font-weight: 700;
  color: #fff;
}

:deep(.status-pill--success) { background: #1c8f5a; }
:deep(.status-pill--warning) { background: #d08a22; }
:deep(.status-pill--in-progress) { background: #e0b420; }
:deep(.status-pill--danger) { background: #c24242; }
:deep(.status-pill--neutral) { background: #6b7280; }

.publish-modal__radios input[type="radio"] {
  margin: 0;
}


.loading-row {
  color: #d4edf6;
  text-align: center;
  padding: 1rem;
}
</style>
