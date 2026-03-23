<template>
  <section class="emission-list">
    <!--<header>
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
    </header>-->

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
                <div class="th-main-controls">
                  <button
                    type="button"
                    class="sort-button"
                    @click="toggleSort(column.key)"
                  >
                    {{ column.label }}
                    <span
                      class="sort-indicator"
                      :class="sortClass(column.key)"
                    ></span>
                  </button>
                  <button
                    v-if="isFilterableColumn(column.key)"
                    type="button"
                    class="filter-button"
                    :class="{ active: hasActiveFilter(column.key) }"
                    @click.stop="toggleFilterMenu(column.key)"
                    aria-label="Filtrer la colonne"
                    title="Filtrer"
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        d="M3 5h18l-7 8v5l-4 2v-7L3 5z"
                        fill="currentColor"
                      />
                    </svg>
                  </button>
                  <div
                    v-if="isFilterableColumn(column.key) && isFilterMenuOpen(column.key)"
                    class="header-filter-menu"
                    @click.stop
                  >
                    <label
                      v-for="option in filterOptions(column.key)"
                      :key="`${column.key}-${option}`"
                      class="header-filter-option"
                    >
                      <input
                        type="checkbox"
                        :checked="isFilterOptionSelected(column.key, option)"
                        @change="toggleFilterOption(column.key, option)"
                      />
                      {{ option }}
                    </label>
                    <button
                      type="button"
                      class="header-filter-reset"
                      @click="clearFilter(column.key)"
                    >
                      Réinitialiser
                    </button>
                  </div>
                </div>
                
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
          <tr v-if="props.loading" class="table-loading-row">
            <td :colspan="columns.length">En chargement...</td>
          </tr>
          <tr
            v-else
            v-for="item in paginated"
            :key="String(item.idRecord)"
            :class="{ selected: isSelected(item) }"
            @click="onRowClick(item, $event)"
            @contextmenu.prevent="onRowContextMenu(item, $event)"
          >
            <td>
              <img
                v-if="channelLogo(item.channel)"
                :src="channelLogo(item.channel)"
                :alt="`Logo ${String(item.channel ?? '')}`"
                class="channel-logo"
              />
              <span v-else>{{ String(item.channel ?? "") }}</span>
            </td>
            <td>
              <img
                v-if="vodTypeLogo(item.vodType)"
                :src="vodTypeLogo(item.vodType)"
                :alt="`Type VOD ${String(item.vodType ?? '')}`"
                class="vod-type-logo"
              />
              <span v-else>{{ String(item.vodType ?? "") }}</span>
            </td>
            <td>
              {{ item.title }}
            </td>
            <td>{{ String(item.duree ?? "") }}</td>
            <td>{{ String(item.idEpisode ?? "") }}</td>
            <td>
              {{
              formatReadableDateWithMs((item.plateformOffers?.[0]?.startDateTime ?? item.dateHeureDebutVisibilite) as string | undefined)
              }}
            </td>
            <td>{{ firstPlatform(item) }}</td>
            <td>
              <span
                :class="
                  getStatusClass(
                    String(item.recordStatusTraitementItem?.useCase ?? '')
                  )
                "
                >{{
                  String(item.recordStatusTraitementItem?.useCase ?? "")
                }}</span
              >
            </td>
            <td>{{ statusComment(item) }}</td>
            <td>
              {{ String(item.recordStatusTraitementItem?.scheduleDelay ?? "") }}
            </td>
            <td>
              {{ String(item.recordStatusTraitementItem?.createdBy ?? "") }}
            </td>
            <td>
              <span
                :class="
                  getStatusClass(
                    String(item.recordStatusTranscodageItem?.useCase ?? '')
                  )
                "
                >{{
                  String(item.recordStatusTranscodageItem?.useCase ?? "")
                }}</span
              >
            </td>
            <td>
              {{
                String(
                  item.recordStatusTranscodageItem?.transcodeProgress ?? ""
                )
              }}
            </td>
            <td>
              <span
                :class="
                  getStatusClass(
                    String(item.recordStatusPublicationItem?.useCase ?? '')
                  )
                "
                >{{
                  String(item.recordStatusPublicationItem?.useCase ?? "")
                }}</span
              >
            </td>
            <td>
              {{ formatReadableDate(item.recordStatusPublicationItem?.creationTimestamp as string | undefined) }}
            </td>
            <td>{{ String(item.idStk ?? "") }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <footer class="pagination">
      <div class="pagination__right" v-if="isPaginationEnabled">
        <button type="button" :disabled="page <= 1" @click="page--">
          Précédent
        </button>
        <span>Page {{ page }} / {{ totalPages }}</span>
        <button type="button" :disabled="page >= totalPages" @click="page++">
          Suivant
        </button>
      </div>
    </footer>

    <div v-if="contextMenu.open" class="context-menu" :style="contextMenuStyle">
      <button type="button" @click="copyText('serie')">
        Copier le n° de série
      </button>
      <button type="button" @click="copyText('episode')">
        Copier le n° d'épisode
      </button>
      <button type="button" @click="copyText('idRecord')">
        Copier id record
      </button>
      <button type="button" @click="copyText('stock')">
        Copier le n° de stock
      </button>
      <button
        type="button"
        @click="openActionModal('Demande d\'export des archives', 'export')"
      >
        Demande d'export des archives
      </button>
      <button
        type="button"
        @click="openActionModal('Vérification avant traitement', 'check')"
      >
        Vérification avant traitement
      </button>
      <button
        type="button"
        @click="openActionModal('Régénération des sous-titres', 'regenerate')"
      >
        Régénération des sous-titres
      </button>
      <button
        type="button"
        @click="
          openActionModal('Changement des statuts du traitement', 'status')
        "
      >
        Changement des statuts du traitement
      </button>
      <button
        type="button"
        @click="openActionModal('Changement du délai de traitement', 'delay')"
      >
        Changement du délai de traitement
      </button>
    </div>

    <div
      v-if="actionModal.open"
      class="action-modal-backdrop"
      @click.self="closeActionModal"
    >
      <div class="action-modal">
        <h3>{{ actionModal.title }}</h3>
        <p>{{ modalDescription }}</p>

        <div
          v-if="actionModalColumns.length"
          class="action-modal__table-scroll"
        >
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
                      <span
                        class="sort-indicator"
                        :class="actionModalSortClass(column.key)"
                      ></span>
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
              <tr
                v-for="(item, index) in sortedActionModalItems"
                :key="`${String(item.idRecord ?? index)}-${index}`"
              >
                <td v-for="column in actionModalColumns" :key="column.key">
                  <template v-if="column.key === 'resultIcon'">
                    <span
                      v-if="modalStatusObject(item)?.ok === true"
                      class="action-result action-result--success"
                      title="Succès"
                    >
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z" />
                      </svg>
                    </span>
                    <span
                      v-else-if="modalStatusObject(item)?.ok === false"
                      class="action-result action-result--error"
                      title="Erreur"
                    >
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path
                          d="M19 6.4 17.6 5 12 10.6 6.4 5 5 6.4 10.6 12 5 17.6 6.4 19l5.6-5.6 5.6 5.6 1.4-1.4-5.6-5.6z"
                        />
                      </svg>
                    </span>
                  </template>
                  <template v-else>
                    {{ actionModalValue(item, column.key) }}
                  </template>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div
          v-if="actionModal.actionType === 'check' && focusedOffers.length"
          class="action-modal__table-scroll action-modal__table-scroll--secondary"
        >
          <table class="action-modal__table">
            <thead>
              <tr>
                <th>Plateform</th>
                <th>Offre</th>
                <th>Prix</th>
                <th>Début</th>
                <th>Fin</th>
                <th>Territoire</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(offer, index) in focusedOffers"
                :key="`${String(offer.recordvodxmlid ?? index)}-${index}`"
              >
                <td>{{ String(offer.name ?? "") }}</td>
                <td>{{ String(offer.offerName ?? "") }}</td>
                <td>{{ String(offer.priceCode ?? "") }}</td>
                <td>
                  {{ formatReadableDate(offer.startDateTime as string | undefined) }}
                </td>
                <td>
                  {{ formatReadableDate(offer.endDateTime as string | undefined) }}
                </td>
                <td>{{ String(offer.territoire ?? "") }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div
          v-if="actionModal.actionType === 'export'"
          class="action-modal__form-row"
        >
          <label for="export-destination">Destination</label>
          <select id="export-destination" v-model="exportDestination">
            <option value="vodstock">vodstock</option>
            <option value="vodauto">vodauto</option>
          </select>
          <label class="inline-checkbox">
            <input v-model="forceRetreatment" type="checkbox" /> Forcer le
            re-traitement
          </label>
        </div>

        <div
          v-if="actionModal.actionType === 'status'"
          class="action-modal__form-row"
        >
          <label for="status-value">Nouveau statut</label>
          <select id="status-value" v-model="statusInput">
            <option
              v-for="option in statusOptions"
              :key="option"
              :value="option"
            >
              {{ option }}
            </option>
          </select>
        </div>

        <div
          v-if="actionModal.actionType === 'delay'"
          class="action-modal__form-row"
        >
          <label for="delay-value">Nouveau délai</label>
          <input id="delay-value" v-model="delayInput" type="number" min="0" />
        </div>

        <div class="action-modal__buttons">
          <button type="button" class="secondary" @click="closeActionModal">
            Annuler
          </button>
          <button
            type="button"
            :disabled="props.selected.length === 0"
            @click="runAction"
          >
            Confirmer
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import {
  computed,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  watch,
} from "vue";
import type { Emission } from "@/types/domain";
import { useEmissionsStore } from "@/stores/emissions.store";
import { createEmissionsApi } from "@/services/emissions.api";
import { useHttp } from "@/composables/useHttp";
import { formatReadableDate, formatReadableDateWithMs } from "@/utils/date";
import { getStatusClass } from "@/utils/status";
import logoLaUne from "@/assets/images/logo/LOGO_LAUNE_RVB_26.svg";
import logoTipik from "@/assets/images/logo/LOGO_TIPIK_26.svg";
import logoAuvio from "@/assets/images/logo/LOGO_AUVIO_SVG_26.svg";
import logoAuvioKids from "@/assets/images/logo/LOGO_AUVIOKIDS_SVG_26.svg";
import logoLaTrois from "@/assets/images/logo/LOGO_LATROIS_RVB_26.svg";
import vodTypeFast from "@/assets/images/vodtype/FAST.png";
import vodTypeCatch from "@/assets/images/vodtype/CATCH.png";

const props = defineProps<{
  emissions: Emission[];
  loading: boolean;
  selected: Emission[];
}>();

const emit = defineEmits<{
  "update:selected": [items: Emission[]];
  focus: [item: Emission];
}>();

const emissionsStore = useEmissionsStore();
const emissionsApi = createEmissionsApi(useHttp("emissions-table.actions"));

type SortDirection = "asc" | "desc";
type ColumnKey =
  | "channel"
  | "vodType"
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

type ActionModalColumnKey =
  | "title"
  | "idEpisode"
  | "traitement"
  | "resultIcon"
  | "resultMessage";

const columns: Array<{ key: ColumnKey; label: string }> = [
  { key: "channel", label: "Chaîne" },
  { key: "vodType", label: "Type" },
  { key: "title", label: "Titre" },
  { key: "duree", label: "Durée" },
  { key: "idEpisode", label: "Episode" },
  { key: "dateHeureDebutVisibilite", label: "Début visib." },
  { key: "plateforme", label: "Plateforme" },
  { key: "traitement", label: "Traitement" },
  { key: "commentaire", label: "Commentaire" },
  { key: "delai", label: "Délai" },
  { key: "par", label: "Par" },
  { key: "transcodage", label: "Statut transcodage" },
  { key: "progress", label: "% transcod." },
  { key: "publication", label: "Publication" },
  { key: "datePublication", label: "Date publication" },
  { key: "pad", label: "PAD" },
];

const columnWidths = reactive<Record<ColumnKey, number>>({
  channel: 110,
  vodType: 50,
  title: 260,
  duree: 90,
  idEpisode: 170,
  dateHeureDebutVisibilite: 170,
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
const contextMenu = reactive({ open: false, x: 0, y: 0 });
const actionModal = reactive<{
  open: boolean;
  title: string;
  actionType: "export" | "check" | "regenerate" | "status" | "delay" | "";
}>({
  open: false,
  title: "",
  actionType: "",
});
const statusOptions = [
  "USER_FORCE_LINEAIRE",
  "TRAITEMENT_MANUEL",
  "FORCE_LINEAIRE",
  "EXPORT_PREVU",
  "ETAT_INITIAL",
] as const;
const statusInput = ref<(typeof statusOptions)[number]>(statusOptions[0]);
const delayInput = ref("24");
const exportDestination = ref("vodstock");
const forceRetreatment = ref(false);
const actionStatuses = ref<Record<string, { ok: boolean; message?: string }>>(
  {}
);
const sortState = ref<{ key: ColumnKey; direction: SortDirection } | null>(
  null
);
const actionModalSortState = ref<{
  key: ActionModalColumnKey;
  direction: SortDirection;
} | null>(null);
const openedFilterMenu = ref<"channel" | "plateforme" | "traitement" | null>(
  null
);
const selectedChannelFilters = ref<string[]>([]);
const selectedPlatformFilters = ref<string[]>([]);
const selectedStatusFilters = ref<string[]>([]);

const actionModalColumns = computed<
  Array<{ key: ActionModalColumnKey; label: string }>
>(() => {
  if (["status", "delay"].includes(actionModal.actionType)) {
    return [
      { key: "title", label: "Titre" },
      { key: "idEpisode", label: "Episode" },
      { key: "traitement", label: "Traitement" },
      { key: "resultIcon", label: "" },
      { key: "resultMessage", label: "Résultat" },
    ];
  }

  if (["export", "check", "regenerate"].includes(actionModal.actionType)) {
    return [
      { key: "title", label: "Titre" },
      { key: "idEpisode", label: "Episode" },
      { key: "traitement", label: "Traitement" },
      { key: "resultIcon", label: "" },
      { key: "resultMessage", label: "Résultat" },
    ];
  }

  return [];
});

const channelLogos: Record<string, string> = {
  "LA UNE": logoLaUne,
  LAUNE: logoLaUne,
  TIPIK: logoTipik,
  AUVIO: logoAuvio,
  "AUVIO KIDS": logoAuvioKids,
  AUVIOKIDS: logoAuvioKids,
  "LA TROIS": logoLaTrois,
  LATROIS: logoLaTrois,
};

const vodTypeLogos: Record<string, string> = {
  FAST: vodTypeFast,
  CATCH: vodTypeCatch,
};

const actionModalColumnWidths = reactive<Record<ActionModalColumnKey, number>>({
  title: 250,
  idEpisode: 180,
  traitement: 170,
  resultIcon: 60,
  resultMessage: 260,
});

const sortedActionModalItems = computed(() => {
  if (!actionModalSortState.value) return props.selected;
  const { key, direction } = actionModalSortState.value;
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
  return Math.max(
    1,
    Math.ceil(sortedEmissions.value.length / pageSizeChoice.value)
  );
});

const sortedEmissions = computed(() => {
  if (!sortState.value) return filteredEmissions.value;

  const { key, direction } = sortState.value;
  const factor = direction === "asc" ? 1 : -1;

  return [...filteredEmissions.value].sort((a, b) => {
    const aValue = sortValue(a, key);
    const bValue = sortValue(b, key);

    if (aValue < bValue) return -1 * factor;
    if (aValue > bValue) return 1 * factor;
    return 0;
  });
});

const availableChannels = computed(() =>
  uniqueValues(
    props.emissions.map((item) => String(item.channel ?? "").trim()).filter(Boolean)
  )
);

const availablePlatforms = computed(() =>
  uniqueValues(
    props.emissions.map((item) => firstPlatform(item).trim()).filter(Boolean)
  )
);

const availableStatuses = computed(() =>
  uniqueValues(
    props.emissions.flatMap((item) =>
      [
        item.recordStatusTraitementItem?.useCase,
        item.recordStatusTranscodageItem?.useCase,
        item.recordStatusPublicationItem?.useCase,
      ]
        .map((status) => String(status ?? "").trim())
        .filter(Boolean)
    )
  )
);

const filteredEmissions = computed(() => {
  return props.emissions.filter((item) => {
    const channel = String(item.channel ?? "").trim();
    const platform = firstPlatform(item).trim();
    const statuses = [
      item.recordStatusTraitementItem?.useCase,
      item.recordStatusTranscodageItem?.useCase,
      item.recordStatusPublicationItem?.useCase,
    ]
      .map((status) => String(status ?? "").trim())
      .filter(Boolean);

    const matchChannel =
      selectedChannelFilters.value.length === 0 ||
      selectedChannelFilters.value.includes(channel);
    const matchPlatform =
      selectedPlatformFilters.value.length === 0 ||
      selectedPlatformFilters.value.includes(platform);
    const matchStatus =
      selectedStatusFilters.value.length === 0 ||
      statuses.some((status) =>
        selectedStatusFilters.value.some((selected) =>
          status.toLowerCase().includes(selected.toLowerCase())
        )
      );

    return matchChannel && matchPlatform && matchStatus;
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
  if (actionModal.actionType === "check")
    return "Vérification des métadonnées et fichiers à publier.";
  return `${count} émission(s) sélectionnée(s).`;
});

const focusedOffers = computed(
  () => contextMenuTarget.value?.plateformOffers ?? []
);

watch(
  () => props.emissions.length,
  () => {
    if (page.value > totalPages.value) page.value = totalPages.value;
  }
);

watch(pageSizeChoice, () => {
  page.value = 1;
});

function idKey(item: Emission) {
  return String(item.idRecord ?? "");
}

function isSelected(item: Emission) {
  return props.selected.some(
    (selectedItem) => selectedItem.idRecord === item.idRecord
  );
}

function replaceSelection(items: Emission[]) {
  const deduped = items.filter(
    (item, index, list) =>
      list.findIndex((candidate) => idKey(candidate) === idKey(item)) === index
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
    props.selected.filter(
      (selectedItem) => selectedItem.idRecord !== item.idRecord
    )
  );
}

function onRowClick(item: Emission, event: MouseEvent) {
  closeContextMenu();
  emit("focus", item);

  const index = sortedEmissions.value.findIndex(
    (entry) => idKey(entry) === idKey(item)
  );
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

function openActionModal(
  title: string,
  actionType: "export" | "check" | "regenerate" | "status" | "delay"
) {
  closeContextMenu();
  actionModal.open = true;
  actionModal.title = title;
  actionModal.actionType = actionType;
  actionStatuses.value = {};
  if (actionType === "status") {
    statusInput.value = statusOptions[0];
  }
  if (actionType === "export") {
    exportDestination.value = "vodstock";
    forceRetreatment.value = false;
  }
}

function closeActionModal() {
  actionModal.open = false;
  actionModal.title = "";
  actionModal.actionType = "";
  actionModalSortState.value = null;
}

async function runAction() {
  const selected = props.selected;
  if (!selected.length) return;

  const setStatus = (id: string, ok: boolean, message?: string) => {
    actionStatuses.value[id] = { ok, message };
  };

  const setGenericErrorForSelection = (message: string) => {
    selected.forEach((item) => {
      setStatus(String(item.idRecord ?? item.idEpisode ?? ""), false, message);
    });
  };

  if (actionModal.actionType === "export") {
    try {
      const response = await emissionsApi.requestArchiveExport(
        exportDestination.value,
        forceRetreatment.value,
        selected
      );

      // Cas 1 : réponse globale booléenne
      if (typeof response === "boolean") {
        selected.forEach((item) => {
          setStatus(
            String(item.idRecord ?? item.idEpisode ?? ""),
            response,
            response ? "Export effectué" : "Export refusé"
          );
        });
        return;
      }

      const responseEntries = Object.entries(response ?? {});
      const hasOnlyGlobalResponse =
        responseEntries.length === 1 &&
        ["statusCode", "message", "success"].includes(responseEntries[0][0]);

      const globalStatusCode = Number(
        (response as { statusCode?: number | string })?.statusCode ?? 200
      );
      const globalSuccess = (response as { success?: boolean })?.success;
      const defaultOk =
        globalSuccess ??
        (Number.isNaN(globalStatusCode) ? true : globalStatusCode === 200);
      const defaultMessage = String(
        (response as { message?: string })?.message ?? ""
      );

      selected.forEach((item) => {
        const idRecord = String(item.idRecord ?? "");
        const idEpisode = String(item.idEpisode ?? "");
        const title = String(item.title ?? "");

        const match = responseEntries.find(([key]) => {
          const normalizedKey = String(key);
          return (
            normalizedKey === idRecord ||
            normalizedKey === idEpisode ||
            (idRecord && normalizedKey.includes(idRecord)) ||
            (idEpisode && normalizedKey.includes(idEpisode)) ||
            (title && normalizedKey.includes(title))
          );
        });

        if (match) {
          const [, result] = match;

          // Cas 2 : réponse par item = booléen
          if (typeof result === "boolean") {
            setStatus(
              idRecord || idEpisode,
              result,
              result ? "Export effectué" : "Export refusé"
            );
            return;
          }

          const rawStatus = Number(
            (result as { statusCode?: number | string })?.statusCode
          );
          const itemSuccess = (result as { success?: boolean })?.success;
          const isOk =
            itemSuccess ??
            (Number.isNaN(rawStatus) ? defaultOk : rawStatus === 200);

          setStatus(
            idRecord || idEpisode,
            isOk,
            String((result as { message?: string })?.message ?? defaultMessage)
          );
          return;
        }

        if (hasOnlyGlobalResponse) {
          setStatus(idRecord || idEpisode, defaultOk, defaultMessage);
          return;
        }

        setStatus(idRecord || idEpisode, false, "Réponse export non corrélée");
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erreur backend";
      setGenericErrorForSelection(message);
    }
    return;
  }

  if (actionModal.actionType === "check") {
    const payload = selected.map((item) => ({
      name: String(item.plateformOffers?.[0]?.name ?? ""),
      offerName: String(item.plateformOffers?.[0]?.offerName ?? ""),
      recordId: item.idRecord,
      vodDay: new Date(
        String(item.plannedDateTime ?? item.dateHeureDiffusion ?? Date.now())
      ).getTime(),
      signaletique: { CSA: "", pp: "" },
      record: {
        mediaId: item.idStk,
        episodeId: item.idEpisode,
        title: item.title,
      },
    }));
    try {
      const response = await emissionsApi.checkPublication(payload);
      Object.entries(response ?? {}).forEach(([id, result]) =>
        setStatus(
          String(id),
          Boolean(result?.success),
          String(result?.message ?? "")
        )
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erreur backend";
      setGenericErrorForSelection(message);
    }
    return;
  }

  if (actionModal.actionType === "regenerate") {
    const ids = selected
      .map((item) => String(item.idRecord ?? ""))
      .filter(Boolean);
    try {
      const response = await emissionsApi.regenerateSubtitles(ids);
      Object.entries(response ?? {}).forEach(([id, result]) =>
        setStatus(
          String(id),
          Number(result?.statusCode ?? 500) === 200,
          String(result?.message ?? "")
        )
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erreur backend";
      setGenericErrorForSelection(message);
    }
    return;
  }

  if (
    actionModal.actionType === "status" ||
    actionModal.actionType === "delay"
  ) {
    await Promise.all(
      selected.map(async (item) => {
        const idRecord = String(item.idRecord ?? "");
        const vodType = String(item.vodType ?? "");
        const recordStatus = {
          ...(item.recordStatusTraitementItem ?? {}),
          createdBy:
            emissionsStore.selected?.[0]?.recordStatusTraitementItem
              ?.createdBy ?? "dashboard",
        } as Record<string, unknown>;

        if (actionModal.actionType === "status") {
          recordStatus.useCase =
            statusInput.value === "ETAT_INITIAL" ? null : statusInput.value;
        } else {
          recordStatus.scheduleDelay = Number(delayInput.value || "0");
        }

        try {
          console.log("[EmissionsTable] updateRecordStatus:request", {
            idRecord,
            vodType,
            actionType: actionModal.actionType,
            payload: recordStatus,
          });
          const response = await emissionsApi.updateRecordStatus(
            vodType,
            idRecord,
            recordStatus,
            actionModal.actionType === "status"
          );
          const httpStatus = Number(
            (response as { status?: number | string })?.status
          );
          const isSuccess = httpStatus === 200;
          console.log("[EmissionsTable] updateRecordStatus:response", {
            idRecord,
            vodType,
            httpStatus,
            rawResponse: response,
            responseData: response?.data,
            isSuccess,
          });
          pushRecordStatusResponseToEmission(item, response.data);
          setStatus(
            idRecord,
            isSuccess,
            isSuccess
              ? "Mise à jour effectuée"
              : "Erreur backend"
          );
        } catch (error) {
          console.log("[EmissionsTable] updateRecordStatus:error", {
            idRecord,
            vodType,
            actionType: actionModal.actionType,
            error,
          });
          setStatus(idRecord, false, "Erreur backend");
        }
      })
    );
  }
}

function extractRecordStatusResponse(rawResponse: unknown) {
  if (!rawResponse || typeof rawResponse !== "object") return null;

  const asRecord = rawResponse as Record<string, unknown>;
  const nestedRecordStatus = asRecord.recordStatusTraitementItem;
  if (nestedRecordStatus && typeof nestedRecordStatus === "object") {
    return nestedRecordStatus as Record<string, unknown>;
  }

  return asRecord;
}

function pushRecordStatusResponseToEmission(
  sourceEmission: Emission,
  rawResponse: unknown
) {
  const responseRecordStatus = extractRecordStatusResponse(rawResponse);
  if (!responseRecordStatus) return;

  const sourceId = String(sourceEmission.idRecord ?? "");
  const candidateItems = [sourceEmission];

  if (sourceId) {
    candidateItems.push(
      ...emissionsStore.items.filter(
        (storeItem) => String(storeItem.idRecord ?? "") === sourceId
      ),
      ...emissionsStore.selected.filter(
        (selectedItem) => String(selectedItem.idRecord ?? "") === sourceId
      )
    );
  }

  candidateItems.forEach((candidate) => {
    candidate.recordStatusTraitementItem = {
      ...(candidate.recordStatusTraitementItem ?? {}),
      ...responseRecordStatus,
    };
  });

  console.log("[EmissionsTable] recordStatus merged", {
    sourceId,
    mergedRecordStatus: responseRecordStatus,
    updatedCandidates: candidateItems.length,
  });
}

function closeContextMenu() {
  contextMenu.open = false;
}

function handleGlobalPointer() {
  closeContextMenu();
  openedFilterMenu.value = null;
}

function uniqueValues(values: string[]) {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b, "fr"));
}

function isFilterableColumn(key: ColumnKey) {
  return key === "channel" || key === "plateforme" || key === "traitement";
}

function isFilterMenuOpen(key: ColumnKey) {
  return openedFilterMenu.value === key;
}

function toggleFilterMenu(key: ColumnKey) {
  if (!isFilterableColumn(key)) return;
  openedFilterMenu.value = openedFilterMenu.value === key ? null : key;
}

function filterOptions(key: ColumnKey) {
  if (key === "channel") return availableChannels.value;
  if (key === "plateforme") return availablePlatforms.value;
  if (key === "traitement") return availableStatuses.value;
  return [];
}

function filterSelectionRef(key: ColumnKey) {
  if (key === "channel") return selectedChannelFilters;
  if (key === "plateforme") return selectedPlatformFilters;
  return selectedStatusFilters;
}

function isFilterOptionSelected(key: ColumnKey, option: string) {
  return filterSelectionRef(key).value.includes(option);
}

function toggleFilterOption(key: ColumnKey, option: string) {
  const target = filterSelectionRef(key);
  if (target.value.includes(option)) {
    target.value = target.value.filter((item) => item !== option);
  } else {
    target.value = [...target.value, option];
  }
}

function clearFilter(key: ColumnKey) {
  filterSelectionRef(key).value = [];
}

function hasActiveFilter(key: ColumnKey) {
  return filterSelectionRef(key).value.length > 0;
}

function toggleSort(key: ColumnKey) {
  if (!sortState.value || sortState.value.key !== key) {
    sortState.value = { key, direction: "asc" };
    return;
  }

  if (sortState.value.direction === "asc") {
    sortState.value = { key, direction: "desc" };
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
    case "vodType":
      return String(item.vodType ?? "");
    case "title":
      return String(item.title ?? "");
    case "duree":
      return String(item.duree ?? "");
    case "idEpisode":
      return String(item.idEpisode ?? "");
    case "dateHeureDebutVisibilite":
      return String(
        item.plateformOffers?.[0]?.startDateTime ??
          item.dateHeureDebutVisibilite ??
          ""
      );
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
  if (key === "resultIcon") {
    return "";
  }
  if (key === "resultMessage") {
    const status = modalStatusObject(item);
    if (!status) return String(item.recordStatusTraitementItem?.useCase ?? "");
    if (status.ok) return status.message || "Succès";
    return status.message || "Erreur";
  }
  return String(actionModalSortValue(item, key) ?? "");
}

function modalStatusObject(item: Emission) {
  const key = String(item.idRecord ?? item.idEpisode ?? "");
  return actionStatuses.value[key];
}

function actionModalSortValue(
  item: Emission,
  key: ActionModalColumnKey
): string {
  switch (key) {
    case "title":
      return String(item.title ?? "");
    case "idEpisode":
      return String(item.idEpisode ?? "");
    case "traitement":
      return String(item.recordStatusTraitementItem?.useCase ?? "");
    case "resultIcon": {
      const status = modalStatusObject(item);
      if (!status) return "";
      return status.ok ? "success" : "error";
    }
    case "resultMessage": {
      const status = modalStatusObject(item);
      if (!status)
        return String(item.recordStatusTraitementItem?.useCase ?? "");
      return String(status.message ?? (status.ok ? "Succès" : "Erreur"));
    }
    default:
      return "";
  }
}

function toggleActionModalSort(key: ActionModalColumnKey) {
  if (!actionModalSortState.value || actionModalSortState.value.key !== key) {
    actionModalSortState.value = { key, direction: "asc" };
    return;
  }

  if (actionModalSortState.value.direction === "asc") {
    actionModalSortState.value = { key, direction: "desc" };
    return;
  }

  actionModalSortState.value = null;
}

function actionModalSortClass(key: ActionModalColumnKey) {
  if (!actionModalSortState.value || actionModalSortState.value.key !== key)
    return "none";
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
    columnWidths[key] = Math.max(50, startWidth + delta);
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

function channelLogo(channel: unknown): string {
  const raw = String(channel ?? "").trim();
  if (!raw) return "";
  const normalized = raw
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();
  return channelLogos[normalized] ?? "";
}

function vodTypeLogo(vodType: unknown): string {
  const raw = String(vodType ?? "").trim();
  if (!raw) return "";
  const normalized = raw.toUpperCase();
  if (normalized.includes("FAST")) return vodTypeLogos.FAST;
  if (normalized.includes("CATCH")) return vodTypeLogos.CATCH;
  return vodTypeLogos[normalized] ?? "";
}

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
  background: rgba(8, 32, 56, 0.85);
  border: 1px solid rgba(143, 215, 236, 0.2);
  padding: 0.8rem;
  border-radius: 12px;
}

header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.6rem;

  h2 {
    margin: 0;
    color: #ffffff;
  }
}

.table-scroll {
  max-width: 100%;
  height: 50vh;
  overflow: auto;
  border: 1px solid rgba(143, 215, 236, 0.2);
  border-radius: 10px;
  background: rgba(8, 32, 56, 0.55);
}

table {
  width: max-content;
  min-width: 100%;
  border-collapse: collapse;
  font-size: 0.8rem;
  table-layout: fixed;

  th,
  td {
    padding: 0.2rem;
    border-bottom: 1px solid rgba(143, 215, 236, 0.15);
    text-align: left;
    overflow: hidden;
    text-overflow: ellipsis;
    color: #d4edf6;
  }

  th {
    background: #0b2038;
    color: #ffffff;
    position: sticky;
    top: 0;
    z-index: 3;
  }
}

.th-content {
  display: flex;
  align-items: center;
  position: relative;
  min-height: 1.6rem;
}

.th-main-controls {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  width: calc(100% - 10px);
  min-width: 0;
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

.filter-button {
  border: 0;
  background: rgba(46, 208, 242, 0.08);
  border: 1px solid rgba(46, 208, 242, 0.25);
  border-radius: 6px;
  color: #8fe6fa;
  cursor: pointer;
  width: 1.35rem;
  height: 1.25rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.filter-button svg {
  width: 0.72rem;
  height: 0.72rem;
}

.filter-button.active {
  color: #2ed0f2;
  background: rgba(46, 208, 242, 0.2);
  border-color: rgba(46, 208, 242, 0.55);
}

.header-filter-menu {
  position: absolute;
  top: 100%;
  left: 0;
  min-width: 190px;
  max-height: 260px;
  overflow: auto;
  padding: 0.5rem;
  border: 1px solid rgba(143, 215, 236, 0.35);
  border-radius: 8px;
  background: #0f2b45;
  z-index: 8;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.35);
}

.header-filter-option {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.78rem;
  margin-bottom: 0.3rem;
  color: #d4edf6;
}

.header-filter-reset {
  border: 1px solid rgba(46, 208, 242, 0.35);
  border-radius: 6px;
  background: rgba(46, 208, 242, 0.14);
  color: #8fe6fa;
  width: 100%;
  padding: 0.35rem 0.45rem;
  cursor: pointer;
  font-size: 0.75rem;
}

.sort-indicator {
  width: 0;
  height: 0;
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-top: 6px solid #8fb8d5;
  opacity: 0.9;
}

.sort-indicator.asc {
  border-top: 0;
  border-bottom: 6px solid #ffffff;
}

.sort-indicator.desc {
  border-top: 6px solid #ffffff;
}

.resize-handle {
  width: 8px;
  cursor: col-resize;
  align-self: stretch;
  position: absolute;
  right: -4px;
  top: 0;
  bottom: 0;
  z-index: 9;
}

tbody tr:hover {
  background: rgba(47, 140, 205, 0.18);
}

tbody tr.selected {
  background: rgba(46, 208, 242, 0.3);
}

.channel-logo {
  display: block;
  max-width: 100%;
  height: 2.2rem;
  object-fit: contain;
  object-position: left center;
}

.vod-type-logo {
  display: block;
  max-width: 100%;
  height: 1.5rem;
  object-fit: contain;
  object-position: left center;
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

:deep(.status-pill--success) {
  background: #1c8f5a;
}
:deep(.status-pill--warning) {
  background: #d08a22;
}
:deep(.status-pill--in-progress) {
  background: #e0b420;
}
:deep(.status-pill--danger) {
  background: #c24242;
}

.action-modal__table-scroll {
  max-height: 260px;
  overflow: auto;
  border: 1px solid rgba(143, 215, 236, 0.22);
  border-radius: 10px;
  margin-bottom: 0.75rem;
}

.action-modal__table {
  width: max-content;
  min-width: 100%;
  table-layout: fixed;
}

.pagination {
  margin-top: 0.7rem;
  display: flex;
  justify-content: flex-end;
  gap: 0.7rem;
  align-items: center;
  flex-wrap: wrap;
  color: #d4edf6;
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
  color: #d4edf6;
}

.pagination__page-size select,
.pagination__right button,
.action-modal__buttons button {
  border: 1px solid rgba(46, 208, 242, 0.35);
  border-radius: 8px;
  padding: 0.45rem 0.8rem;
}

.pagination__page-size select {
  background: #0f2b45;
  color: #d4edf6;
}

.pagination__right button,
.action-modal__buttons button {
  background: #2ed0f2;
  color: #083047;
  font-weight: 700;
  cursor: pointer;
}

.pagination__right button:disabled {
  opacity: 0.55;
  cursor: default;
}

.action-result {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-weight: 700;
}

.action-result svg {
  width: 1rem;
  height: 1rem;
  fill: currentColor;
}

.action-result--success {
  color: #36d399;
}

.action-result--error {
  color: #f87171;
  white-space: normal;
}

.action-modal__table td:nth-child(4),
.action-modal__table th:nth-child(4) {
  text-align: center;
}

.table-loading-row td {
  text-align: center;
  color: #d4edf6;
  font-weight: 700;
}

.context-menu {
  position: fixed;
  z-index: 20;
  display: flex;
  flex-direction: column;
  min-width: 300px;
  border: 1px solid rgba(143, 215, 236, 0.22);
  border-radius: 10px;
  background: #0f2b45;
  box-shadow: 0 8px 22px rgba(0, 0, 0, 0.25);
}

.context-menu button {
  border: 0;
  border-bottom: 1px solid rgba(143, 215, 236, 0.18);
  background: transparent;
  text-align: left;
  padding: 0.6rem 0.8rem;
  cursor: pointer;
  color: #d4edf6;
}

.context-menu button:last-child {
  border-bottom: 0;
}

.context-menu button:hover {
  background: rgba(47, 140, 205, 0.2);
}

.action-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 40;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-modal {
  background: #0f2b45;
  color: #d4edf6;
  width: min(60%, 92vw);
  border-radius: 12px;
  border: 1px solid rgba(143, 215, 236, 0.22);
  padding: 1rem;
}

.action-modal h3 {
  margin: 0 0 0.75rem;
  color: #fff;
}

.action-modal__form-row {
  display: flex;
  flex-direction: column;
  margin-bottom: 0.7rem;
  gap: 0.3rem;
}

.inline-checkbox {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  margin-top: 0.4rem;
}

.action-modal__table-scroll--secondary {
  margin-top: 0.8rem;
}
.action-modal__form-row input,
.action-modal__form-row select {
  border: 1px solid rgba(143, 215, 236, 0.4);
  border-radius: 8px;
  background: #0b2038;
  color: #d4edf6;
  padding: 0.5rem;
}

#delay-value {
  appearance: auto;
  min-height: 2.2rem;
}

#delay-value::-webkit-inner-spin-button,
#delay-value::-webkit-outer-spin-button {
  padding: 1px;
  height: 25px;
}

.action-modal__buttons {
  display: flex;
  justify-content: flex-end;
  gap: 0.6rem;
}

.action-modal__buttons .secondary {
  background: transparent;
  color: #8fe6fa;
}
</style>
