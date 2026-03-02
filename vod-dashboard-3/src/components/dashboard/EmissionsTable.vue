<template>
  <section class="emission-list">
    <header>
      <h2>Émissions </h2>
      <div class="pagination__page-size">
        <label for="page-size">Éléments / page</label>
        <select id="page-size" v-model.number="pageSizeChoice">
          <option :value="0">All emissions</option>
          <option :value="10">10</option>
          <option :value="25">25</option>
          <option :value="50">50</option>
        </select>
      </div>
    </header>

    <div class="table-scroll">
      <table>
        <thead>
        <tr>
          <th
              v-for="column in columns"
              :key="column.key"
              :style="{ width: `${columnWidths[column.key]}px` }"
          >
            <div class="th-content">
              <button
                  type="button"
                  class="sort-button"
                  @click="toggleSort(column.key)"
              >
                {{ column.label }}
                <span class="sort-indicator" :class="sortClass(column.key)"></span>
              </button>
              <span
                  class="resize-handle"
                  role="separator"
                  aria-orientation="vertical"
                  @mousedown="startResize(column.key, $event)"
              ></span>
            </div>
          </th>
        </tr>
        </thead>
        <tbody>
        <tr
            v-for="item in paginated"
            :key="String(item.idRecord)"
            :class="{ selected: isSelected(item) }"
            @click="onRowClick(item, $event)"
            @contextmenu.prevent="onRowContextMenu(item, $event)"
        >
          <td>{{ String(item.channel ?? "") }}</td>
          <td >
            {{ item.title }}
          </td>
          <td>{{ String(item.duree ?? "") }}</td>
          <td>{{ String(item.idEpisode ?? "") }}</td>
          <td>{{ formatReadableDateWithMs((item.plateformOffers?.[0]?.startDateTime ?? item.dateHeureDebutVisibilite) as string | undefined) }}</td>
          <td>{{ firstPlatform(item) }}</td>
          <td><span :class="getStatusClass(String(item.recordStatusTraitementItem?.useCase ?? ''))">{{
              String(item.recordStatusTraitementItem?.useCase ?? "")
            }}</span></td>
          <td>{{ statusComment(item) }}</td>
          <td>{{ String(item.recordStatusTraitementItem?.scheduleDelay ?? "") }}</td>
          <td>{{ String(item.recordStatusTraitementItem?.createdBy ?? "") }}</td>
          <td><span :class="getStatusClass(String(item.recordStatusTranscodageItem?.useCase ?? ''))">{{
              String(item.recordStatusTranscodageItem?.useCase ?? "")
            }}</span></td>
          <td>{{ String(item.recordStatusTranscodageItem?.transcodeProgress ?? "") }}</td>
          <td><span :class="getStatusClass(String(item.recordStatusPublicationItem?.useCase ?? ''))">{{
              String(item.recordStatusPublicationItem?.useCase ?? "")
            }}</span></td>
          <td>{{ formatReadableDate(item.recordStatusPublicationItem?.creationTimestamp as string | undefined) }}</td>
          <td>{{ String(item.idStk ?? "") }}</td>
        </tr>
        </tbody>
      </table>
    </div>

    <footer class="pagination">
      <div class="pagination__right" v-if="isPaginationEnabled">
        <button type="button" :disabled="page <= 1" @click="page--">Précédent</button>
        <span>Page {{ page }} / {{ totalPages }}</span>
        <button type="button" :disabled="page >= totalPages" @click="page++">Suivant</button>
      </div>
    </footer>

    <div v-if="contextMenu.open" class="context-menu" :style="contextMenuStyle">
      <button type="button" @click="copyText('serie')">Copier le n° de série</button>
      <button type="button" @click="copyText('episode')">Copier le n° d'épisode</button>
      <button type="button" @click="copyText('idRecord')">Copier id record</button>
      <button type="button" @click="copyText('stock')">Copier le n° de stock</button>
      <button type="button" @click="openActionModal('Demande d\'export des archives', 'export')">Demande d'export des
        archives
      </button>
      <button type="button" @click="openActionModal('Vérification avant traitement', 'check')">Vérification avant
        traitement
      </button>
      <button type="button" @click="openActionModal('Régénération des sous-titres', 'regenerate')">Régénération des
        sous-titres
      </button>
      <button type="button" @click="openActionModal('Changement des statuts du traitement', 'status')">Changement des
        statuts du traitement
      </button>
      <button type="button" @click="openActionModal('Changement du délai de traitement', 'delay')">Changement du délai
        de traitement
      </button>
    </div>

    <div v-if="actionModal.open" class="action-modal-backdrop" @click.self="closeActionModal">
      <div class="action-modal">
        <h3>{{ actionModal.title }}</h3>
        <p>{{ modalDescription }}</p>

        <div v-if="actionModalColumns.length" class="action-modal__table-scroll">
          <table class="action-modal__table">
            <thead>
            <tr>
              <th
                  v-for="column in actionModalColumns"
                  :key="column.key"
                  :style="{ width: `${actionModalColumnWidths[column.key]}px` }"
              >
                <div class="th-content">
                  <button
                      type="button"
                      class="sort-button"
                      @click="toggleActionModalSort(column.key)"
                  >
                    {{ column.label }}
                    <span class="sort-indicator" :class="actionModalSortClass(column.key)"></span>
                  </button>
                  <span
                      class="resize-handle"
                      role="separator"
                      aria-orientation="vertical"
                      @mousedown="startActionModalResize(column.key, $event)"
                  ></span>
                </div>
              </th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="(item, index) in sortedActionModalItems" :key="`${String(item.idRecord ?? index)}-${index}`">
              <td v-for="column in actionModalColumns" :key="column.key">
                {{ actionModalValue(item, column.key) }}
              </td>
            </tr>
            </tbody>
          </table>
        </div>

        <div v-if="actionModal.actionType === 'status'" class="action-modal__form-row">
          <label for="status-value">Nouveau statut</label>
          <select id="status-value" v-model="statusInput">
            <option v-for="option in statusOptions" :key="option" :value="option">{{ option }}</option>
          </select>
        </div>

        <div v-if="actionModal.actionType === 'delay'" class="action-modal__form-row">
          <label for="delay-value">Nouveau délai</label>
          <input id="delay-value" v-model="delayInput" type="number" min="0"/>
        </div>

        <div class="action-modal__buttons">
          <button type="button" class="secondary" @click="closeActionModal">Annuler</button>
          <button type="button" @click="runAction">Lancer</button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import {computed, onBeforeUnmount, onMounted, reactive, ref, watch} from "vue";
import type {Emission} from "@/types/domain";
import {formatReadableDate, formatReadableDateWithMs} from "@/utils/date";
import {getStatusClass} from "@/utils/status";

const props = defineProps<{
  emissions: Emission[];
  loading: boolean;
  selected: Emission[];
}>();

const emit = defineEmits<{
  "update:selected": [items: Emission[]];
  focus: [item: Emission];
}>();

type SortDirection = "asc" | "desc";
type ColumnKey =
    | "channel"
    | "title"
    | "duree"
    | "idEpisode"
    | "dateHeureDebutVisibilite"
    | "plateforme"
    | "traitement"
    | "commentaire"
    | "delai"
    | "par"
    | "transcodage"
    | "progress"
    | "publication"
    | "datePublication"
    | "pad";

type ActionModalColumnKey = "title" | "idEpisode" | "traitement" | "statut";

const columns: Array<{ key: ColumnKey; label: string }> = [
  {key: "channel", label: "Chaîne"},
  {key: "title", label: "Titre"},
  {key: "duree", label: "Durée"},
  {key: "idEpisode", label: "Episode"},
  {key: "dateHeureDebutVisibilite", label: "Début visib."},
  {key: "plateforme", label: "Plateforme"},
  {key: "traitement", label: "Traitement"},
  {key: "commentaire", label: "Commentaire"},
  {key: "delai", label: "Délai"},
  {key: "par", label: "Par"},
  {key: "transcodage", label: "Statut transcodage"},
  {key: "progress", label: "% transcod."},
  {key: "publication", label: "Publication"},
  {key: "datePublication", label: "Date publication"},
  {key: "pad", label: "PAD"},
];

const columnWidths = reactive<Record<ColumnKey, number>>({
  channel: 120,
  title: 260,
  duree: 90,
  idEpisode: 170,
  dateHeureDebutVisibilite: 160,
  plateforme: 110,
  traitement: 170,
  commentaire: 300,
  delai: 70,
  par: 70,
  transcodage: 170,
  progress: 95,
  publication: 130,
  datePublication: 170,
  pad: 90,
});

const page = ref(1);
const pageSizeChoice = ref(0);
const selectionAnchor = ref<number | null>(null);
const contextMenuTarget = ref<Emission | null>(null);
const contextMenu = reactive({open: false, x: 0, y: 0});
const actionModal = reactive<{
  open: boolean;
  title: string;
  actionType: "export" | "check" | "regenerate" | "status" | "delay" | ""
}>({
  open: false,
  title: "",
  actionType: "",
});
const statusOptions = ["USER_FORCE_LINEAIRE", "TRAITEMENT_MANUEL", "FORCE_LINEAIRE", "EXPORT_PREVU", "ETAT_INITIAL"] as const;
const statusInput = ref<(typeof statusOptions)[number]>(statusOptions[0]);
const delayInput = ref("24");
const sortState = ref<{ key: ColumnKey; direction: SortDirection } | null>(null);
const actionModalSortState = ref<{ key: ActionModalColumnKey; direction: SortDirection } | null>(null);

const actionModalColumns = computed<Array<{ key: ActionModalColumnKey; label: string }>>(() => {
  if (["status", "delay"].includes(actionModal.actionType)) {
    return [
      {key: "title", label: "Titre"},
      {key: "idEpisode", label: "Episode"},
      {key: "traitement", label: "Traitement"},
      {key: "statut", label: ""},
    ];
  }

  if (["export", "check", "regenerate"].includes(actionModal.actionType)) {
    return [
      {key: "title", label: "Titre"},
      {key: "idEpisode", label: "Episode"},
      {key: "traitement", label: "Traitement"},
      {key: "statut", label: ""},
    ];
  }

  return [];
});

const actionModalColumnWidths = reactive<Record<ActionModalColumnKey, number>>({
  title: 250,
  idEpisode: 180,
  traitement: 170,
  statut: 80,
});

const sortedActionModalItems = computed(() => {
  if (!actionModalSortState.value) return props.selected;
  const {key, direction} = actionModalSortState.value;
  const factor = direction === "asc" ? 1 : -1;

  return [...props.selected].sort((a, b) => {
    const aValue = actionModalSortValue(a, key);
    const bValue = actionModalSortValue(b, key);
    if (aValue < bValue) return -1 * factor;
    if (aValue > bValue) return 1 * factor;
    return 0;
  });
});

const isPaginationEnabled = computed(() => pageSizeChoice.value > 0);
const totalPages = computed(() => {
  if (!isPaginationEnabled.value) return 1;
  return Math.max(1, Math.ceil(sortedEmissions.value.length / pageSizeChoice.value));
});

const sortedEmissions = computed(() => {
  if (!sortState.value) return props.emissions;

  const {key, direction} = sortState.value;
  const factor = direction === "asc" ? 1 : -1;

  return [...props.emissions].sort((a, b) => {
    const aValue = sortValue(a, key);
    const bValue = sortValue(b, key);

    if (aValue < bValue) return -1 * factor;
    if (aValue > bValue) return 1 * factor;
    return 0;
  });
});

const paginated = computed(() => {
  if (!isPaginationEnabled.value) return sortedEmissions.value;

  const start = (page.value - 1) * pageSizeChoice.value;
  return sortedEmissions.value.slice(start, start + pageSizeChoice.value);
});

const contextMenuStyle = computed(() => ({
  top: `${contextMenu.y}px`,
  left: `${contextMenu.x}px`,
}));

const modalDescription = computed(() => {
  const count = props.selected.length;
  if (count === 0) return "Aucune émission sélectionnée.";
  return `${count} émission(s) sélectionnée(s).`;
});

watch(
    () => props.emissions.length,
    () => {
      if (page.value > totalPages.value) page.value = totalPages.value;
    },
);

watch(pageSizeChoice, () => {
  page.value = 1;
});

function idKey(item: Emission) {
  return String(item.idRecord ?? "");
}

function isSelected(item: Emission) {
  return props.selected.some((selectedItem) => selectedItem.idRecord === item.idRecord);
}

function replaceSelection(items: Emission[]) {
  const deduped = items.filter(
      (item, index, list) => list.findIndex((candidate) => idKey(candidate) === idKey(item)) === index,
  );
  emit("update:selected", deduped);
}

function toggleSelection(item: Emission, checked: boolean) {
  if (checked) {
    emit("update:selected", [...props.selected, item]);
    return;
  }
  emit(
      "update:selected",
      props.selected.filter((selectedItem) => selectedItem.idRecord !== item.idRecord),
  );
}

function onRowClick(item: Emission, event: MouseEvent) {
  closeContextMenu();
  emit("focus", item);

  const index = sortedEmissions.value.findIndex((entry) => idKey(entry) === idKey(item));
  if (index < 0) return;

  if (event.shiftKey && selectionAnchor.value !== null) {
    const start = Math.min(selectionAnchor.value, index);
    const end = Math.max(selectionAnchor.value, index);
    replaceSelection(sortedEmissions.value.slice(start, end + 1));
    return;
  }

  if (event.ctrlKey || event.metaKey) {
    toggleSelection(item, !isSelected(item));
    selectionAnchor.value = index;
    return;
  }

  replaceSelection([item]);
  selectionAnchor.value = index;
}

function onRowContextMenu(item: Emission, event: MouseEvent) {
  contextMenuTarget.value = item;
  if (!isSelected(item)) {
    replaceSelection([item]);
  }

  contextMenu.open = true;
  contextMenu.x = event.clientX;
  contextMenu.y = event.clientY;
}

async function copyText(type: "serie" | "episode" | "idRecord" | "stock") {
  if (!contextMenuTarget.value) return;

  const item = contextMenuTarget.value;
  const valueByType: Record<typeof type, string> = {
    serie: String(item.idSerie || item.idEpisode || ""),
    episode: String(item.idEpisode ?? ""),
    idRecord: String(item.idRecord ?? ""),
    stock: String(item.idStk ?? ""),
  };
  const value = valueByType[type];

  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
  } else {
    const helper = document.createElement("textarea");
    helper.value = value;
    document.body.appendChild(helper);
    helper.select();
    document.execCommand("copy");
    document.body.removeChild(helper);
  }
  closeContextMenu();
}

function openActionModal(title: string, actionType: "export" | "check" | "regenerate" | "status" | "delay") {
  closeContextMenu();
  actionModal.open = true;
  actionModal.title = title;
  actionModal.actionType = actionType;
  if (actionType === "status") {
    statusInput.value = statusOptions[0];
  }
}

function closeActionModal() {
  actionModal.open = false;
  actionModal.title = "";
  actionModal.actionType = "";
  actionModalSortState.value = null;
}

function runAction() {
  if (actionModal.actionType === "status") {
    // placeholder for back-end integration
    console.info("Status change requested", {status: statusInput.value, selected: props.selected});
  }
  if (actionModal.actionType === "delay") {
    console.info("Delay change requested", {delay: delayInput.value, selected: props.selected});
  }
  closeActionModal();
}

function closeContextMenu() {
  contextMenu.open = false;
}

function handleGlobalPointer() {
  closeContextMenu();
}

function toggleSort(key: ColumnKey) {
  if (!sortState.value || sortState.value.key !== key) {
    sortState.value = {key, direction: "asc"};
    return;
  }

  if (sortState.value.direction === "asc") {
    sortState.value = {key, direction: "desc"};
    return;
  }

  sortState.value = null;
}

function sortClass(key: ColumnKey) {
  if (!sortState.value || sortState.value.key !== key) return "none";
  return sortState.value.direction;
}

function sortValue(item: Emission, key: ColumnKey): string | number {
  switch (key) {
    case "channel":
      return String(item.channel ?? "");
    case "title":
      return String(item.title ?? "");
    case "duree":
      return String(item.duree ?? "");
    case "idEpisode":
      return String(item.idEpisode ?? "");
    case "dateHeureDebutVisibilite":
      return String(item.plateformOffers?.[0]?.startDateTime ?? item.dateHeureDebutVisibilite ?? "");
    case "plateforme":
      return firstPlatform(item);
    case "traitement":
      return String(item.recordStatusTraitementItem?.useCase ?? "");
    case "commentaire":
      return statusComment(item);
    case "delai":
      return Number(item.recordStatusTraitementItem?.scheduleDelay ?? -1);
    case "par":
      return String(item.recordStatusTraitementItem?.createdBy ?? "");
    case "transcodage":
      return String(item.recordStatusTranscodageItem?.useCase ?? "");
    case "progress":
      return Number(item.recordStatusTranscodageItem?.transcodeProgress ?? -1);
    case "publication":
      return String(item.recordStatusPublicationItem?.useCase ?? "");
    case "datePublication":
      return String(item.recordStatusPublicationItem?.creationTimestamp ?? "");
    case "pad":
      return String(item.idStk ?? "");
    default:
      return "";
  }
}

function actionModalValue(item: Emission, key: ActionModalColumnKey) {
  if (key === "statut") {
    return String(item.recordStatusTraitementItem?.useCase ?? "");
  }
  return String(actionModalSortValue(item, key) ?? "");
}

function actionModalSortValue(item: Emission, key: ActionModalColumnKey): string {
  switch (key) {
    case "title":
      return String(item.title ?? "");
    case "idEpisode":
      return String(item.idEpisode ?? "");
    case "traitement":
      return String(item.recordStatusTraitementItem?.useCase ?? "");
    case "statut":
      return String(item.recordStatusTraitementItem?.useCase ?? "");
    default:
      return "";
  }
}

function toggleActionModalSort(key: ActionModalColumnKey) {
  if (!actionModalSortState.value || actionModalSortState.value.key !== key) {
    actionModalSortState.value = {key, direction: "asc"};
    return;
  }

  if (actionModalSortState.value.direction === "asc") {
    actionModalSortState.value = {key, direction: "desc"};
    return;
  }

  actionModalSortState.value = null;
}

function actionModalSortClass(key: ActionModalColumnKey) {
  if (!actionModalSortState.value || actionModalSortState.value.key !== key) return "none";
  return actionModalSortState.value.direction;
}

function startActionModalResize(key: ActionModalColumnKey, event: MouseEvent) {
  const startX = event.clientX;
  const startWidth = actionModalColumnWidths[key];

  const onMouseMove = (moveEvent: MouseEvent) => {
    const delta = moveEvent.clientX - startX;
    actionModalColumnWidths[key] = Math.max(70, startWidth + delta);
  };

  const onMouseUp = () => {
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", onMouseUp);
  };

  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("mouseup", onMouseUp);
}

function startResize(key: ColumnKey, event: MouseEvent) {
  const startX = event.clientX;
  const startWidth = columnWidths[key];

  const onMouseMove = (moveEvent: MouseEvent) => {
    const delta = moveEvent.clientX - startX;
    columnWidths[key] = Math.max(70, startWidth + delta);
  };

  const onMouseUp = () => {
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", onMouseUp);
  };

  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("mouseup", onMouseUp);
}

onMounted(() => {
  window.addEventListener("click", handleGlobalPointer);
  window.addEventListener("scroll", handleGlobalPointer);
});

onBeforeUnmount(() => {
  window.removeEventListener("click", handleGlobalPointer);
  window.removeEventListener("scroll", handleGlobalPointer);
});

function firstPlatform(item: Emission) {
  return String(item.plateformOffers?.[0]?.name ?? "");
}

function statusComment(item: Emission) {
  return [
    item.recordStatusTraitementItem?.caseComment,
    item.recordStatusTranscodageItem?.caseComment,
    item.recordStatusPublicationItem?.caseComment,
  ]
      .filter(Boolean)
      .join(" | ");
}
</script>

<style scoped lang="scss">
.emission-list {
  margin-top: 1rem;
  background: #f2f3f6;
  border: 1px solid #cfd6df;
  padding: 0.75rem;
  border-radius: 12px;
}

header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}


.table-scroll {
  max-width: 100%;
  max-height: 420px;
  overflow: auto;
  border: 1px solid #d6dde6;
  background: #fff;
}

table {
  width: max-content;
  min-width: 100%;
  border-collapse: collapse;
  font-size: 0.8rem;
  background: #fff;
  table-layout: fixed;
}

th,
td {
  border: 1px solid #e5e8ee;
  padding: 0.3rem;
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

th {
  padding: 0.7rem;
  background: #1b2433;
  color: #fff;
  position: relative;
}

.th-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.35rem;
}

.sort-button {
  border: 0;
  background: transparent;
  color: inherit;
  padding: 0;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 0.35rem;
  text-align: left;
}

.sort-indicator {
  width: 0;
  height: 0;
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-top: 6px solid #b8c4d8;
  opacity: 0.85;
}

.sort-indicator.asc {
  border-top: 0;
  border-bottom: 6px solid #fff;
}

.sort-indicator.desc {
  border-top: 6px solid #fff;
}

.resize-handle {
  width: 24px;
  cursor: col-resize;
  align-self: stretch;
  position: absolute;
  right: -3px;
  top: 0;
  bottom: 0;
}

tbody tr.selected {
  background: #a8d7e6;
}

.link {
  border: 0;
  background: none;
  padding: 0;
  cursor: pointer;
  color: #1e2634;
  text-align: left;
}

:deep(.status-pill) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 1.35rem;
  padding: 0.15rem 0.35rem;
  border-radius: 2px;
  font-weight: 600;
  color: #fff;
  text-align: center;
}

:deep(.status-pill--success) {
  background: #00ff00;
}

:deep(.status-pill--warning) {
  background: #f0a80d;
}

:deep(.status-pill--danger) {
  background: #ff0000;
}

:deep(.status-pill--neutral) {
  background: #6b7280;
}

.action-modal__table-scroll {
  max-height: 260px;
  overflow: auto;
  border: 1px solid #d6dde6;
  margin-bottom: 0.75rem;
}

.action-modal__table {
  width: max-content;
  min-width: 100%;
  table-layout: fixed;
}

.pagination {
  margin-top: 0.6rem;
  display: flex;
  justify-content: flex-end;
  gap: 0.7rem;
  align-items: center;
  flex-wrap: wrap;
}

.pagination__right {
  display: flex;
  align-items: center;
  gap: 0.7rem;
}

.pagination__page-size {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-left: auto;
}

.pagination__page-size select {
  border: 1px solid #0e98b6;
  border-radius: 6px;
  padding: 0.35rem 0.5rem;
}

.pagination__right button {
  border: 1px solid #0e98b6;
  background: #0e98b6;
  color: #fff;
  border-radius: 6px;
  padding: 0.45rem 0.8rem;
  cursor: pointer;
}

.pagination__right button:disabled {
  opacity: 0.55;
  cursor: default;
}

.context-menu {
  position: fixed;
  z-index: 20;
  display: flex;
  flex-direction: column;
  min-width: 300px;
  border: 1px solid #ced5df;
  border-radius: 6px;
  background: #fff;
  box-shadow: 0 6px 22px rgba(0, 0, 0, 0.18);
}

.context-menu button {
  border: 0;
  border-bottom: 1px solid #e5e8ef;
  background: #fff;
  text-align: left;
  padding: 0.6rem 0.8rem;
  cursor: pointer;
  color: #2d3748;
}

.context-menu button:last-child {
  border-bottom: 0;
}

.context-menu button:hover {
  background: #f4f7fb;
}

.action-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  z-index: 40;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-modal {
  background: #fff;
  width: min(60%, 92vw);
  border-radius: 10px;
  border: 1px solid #cfd6df;
  padding: 1rem;
}

.action-modal h3 {
  margin: 0 0 0.75rem;
}

.action-modal__form-row {
  display: flex;
  flex-direction: column;
  margin-bottom: 0.7rem;
  gap: 0.3rem;
}

.action-modal__form-row input,
.action-modal__form-row select {
  border: 1px solid #c7cfd9;
  border-radius: 6px;
  padding: 0.5rem;
}

.action-modal__buttons {
  display: flex;
  justify-content: flex-end;
  gap: 0.6rem;
}

.action-modal__buttons button {
  border: 1px solid #0e98b6;
  background: #0e98b6;
  color: #fff;
  border-radius: 6px;
  padding: 0.45rem 0.8rem;
  cursor: pointer;
}

.action-modal__buttons .secondary {
  background: #fff;
  color: #0e98b6;
}

.pagination__right button {
  border: 1px solid #0e98b6;
  background: #0e98b6;
  color: #fff;
  border-radius: 6px;
  padding: 0.45rem 0.8rem;
  cursor: pointer;
}

.pagination__right button:disabled {
  opacity: 0.55;
  cursor: default;
}

.context-menu {
  position: fixed;
  z-index: 20;
  display: flex;
  flex-direction: column;
  min-width: 300px;
  border: 1px solid #ced5df;
  border-radius: 6px;
  background: #fff;
  box-shadow: 0 6px 22px rgba(0, 0, 0, 0.18);
}

.context-menu button {
  border: 0;
  border-bottom: 1px solid #e5e8ef;
  background: #fff;
  text-align: left;
  padding: 0.6rem 0.8rem;
  cursor: pointer;
  color: #2d3748;
}

.context-menu button:last-child {
  border-bottom: 0;
}

.context-menu button:hover {
  background: #f4f7fb;
}

.action-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  z-index: 40;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-modal {
  background: #fff;
  width: min(60%, 92vw);
  border-radius: 10px;
  border: 1px solid #cfd6df;
  padding: 1rem;
}

.action-modal h3 {
  margin: 0 0 0.75rem;
}

.action-modal__form-row {
  display: flex;
  flex-direction: column;
  margin-bottom: 0.7rem;
  gap: 0.3rem;
}

.action-modal__form-row input,
.action-modal__form-row select {
  border: 1px solid #c7cfd9;
  border-radius: 6px;
  padding: 0.5rem;
}

.action-modal__buttons {
  display: flex;
  justify-content: flex-end;
  gap: 0.6rem;
}

.action-modal__buttons button {
  border: 1px solid #0e98b6;
  background: #0e98b6;
  color: #fff;
  border-radius: 6px;
  padding: 0.45rem 0.8rem;
  cursor: pointer;
}

.action-modal__buttons .secondary {
  background: #fff;
  color: #0e98b6;
}
</style>
