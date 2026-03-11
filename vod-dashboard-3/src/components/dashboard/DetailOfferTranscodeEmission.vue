<template>
  <section class="details-tabs">
    <p v-if="!emission">Sélectionnez une émission pour voir ses détails.</p>

    <template v-else>
      <div class="selected-episode">Episode sélectionné:
        <span class="episode-title">{{ selectedEpisodeLabel }}</span>
      </div>

      <div class="tabs" role="tablist" aria-label="Détails émission">
        <button
            v-for="tab in tabItems"
            :key="tab.key"
            type="button"
            class="tab"
            :class="{ active: activeTab === tab.key }"
            @click="activeTab = tab.key"
        >
          {{ tab.label }}
        </button>
      </div>

      <div v-if="error" class="error">{{ error }}</div>

      <div class="tab-panel">
        <template v-if="activeRows.length">
          <table>
            <thead>
            <tr>
              <th
                  v-for="column in activeColumns"
                  :key="column.key"
                  :style="{ width: `${columnWidths[column.key]}px` }"
              >
                <div class="th-content">
                  <button type="button" class="sort-button" @click="toggleSort(column.key)">
                    {{ column.label }}
                    <span class="sort-indicator" :class="sortClass(column.key)"></span>
                  </button>
                  <span class="resize-handle" role="separator" aria-orientation="vertical"
                        @mousedown="startResize(column.key, $event)"></span>
                </div>
              </th>
            </tr>
            </thead>
            <tbody>
            <tr
                v-for="(row, idx) in sortedActiveRows"
                :key="`${String(row.guid ?? row.id_record ?? row.name ?? row.media ?? idx)}-${idx}`"
                @contextmenu.prevent="openRowContextMenu(row, $event)"
            >
              <td v-for="column in activeColumns" :key="column.key">
                <span v-if="column.status"
                      :class="getStatusClass(String(row[column.key] ?? ''))">{{ String(row[column.key] ?? '') }}</span>
                <template v-else-if="column.date">{{
                    formatReadableDate(row[column.key] as string | undefined)
                  }}
                </template>
                <template v-else>{{ String(row[column.key] ?? '') }}</template>
              </td>
            </tr>
            </tbody>
          </table>
        </template>
        <p v-else class="empty-state">Aucune donnée disponible pour cet onglet.</p>
      </div>

      <div v-if="contextMenu.open" class="detail-context-menu" :style="contextMenuStyle">
        <button v-for="action in contextActions" :key="action.label" type="button"
                @click="handleContextAction(action.type, action.value)">
          {{ action.label }}
        </button>
      </div>

      <div v-if="answerModal.open" class="action-modal-backdrop" @click.self="answerModal.open = false">
        <div class="action-modal action-modal--small">
          <h3>{{ answerModal.title }}</h3>
          <p>Statut: {{ answerModal.status }}</p>
          <p v-if="answerModal.message">Description: {{ answerModal.message }}</p>
          <div class="action-modal__buttons">
            <button type="button" class="secondary" @click="answerModal.open = false">Fermer</button>
          </div>
        </div>
      </div>

      <div v-if="confirmStop.open" class="action-modal-backdrop" @click.self="confirmStop.open = false">
        <div class="action-modal action-modal--small">
          <h3>Stopper transcodage</h3>
          <p>Vous voulez vraiment stopper le transcodage du job: {{ confirmStop.jobId }}</p>
          <div class="action-modal__buttons">
            <button type="button" @click="stopTranscoding">Confirmer</button>
            <button type="button" class="secondary" @click="confirmStop.open = false">Annuler</button>
          </div>
        </div>
      </div>
    </template>
  </section>
</template>

<script setup lang="ts">
import {computed, onBeforeUnmount, onMounted, reactive, ref, watch} from "vue";
import {useHttp} from "@/composables/useHttp";
import {formatReadableDate} from "@/utils/date";
import {getStatusClass} from "@/utils/status";
import type {Emission} from "@/types/domain";

type DetailTabKey = "transcodages" | "offres" | "segments" | "segmentsPrevus" | "soustitrages";
type SortDirection = "asc" | "desc";
type DetailColumnKey =
    | "profileName"
    | "offer"
    | "lastStatus"
    | "lastProgressValue"
    | "startDate"
    | "endDate"
    | "requester"
    | "guid"
    | "comment"
    | "name"
    | "offerName"
    | "priceCode"
    | "startDateTime"
    | "endDateTime"
    | "territoire"
    | "id_record"
    | "number"
    | "tcin"
    | "tcout"
    | "status"
    | "media"
    | "som"
    | "creation"
    | "message"
    | "lookupLimit"
    | "creator";

type TableColumn = { key: DetailColumnKey; label: string; date?: boolean; status?: boolean };

type RowItem = Record<string, unknown>;

type JobItem = {
  id?: string;
  profileName?: string;
  offer?: string;
  lastStatus?: string;
  lastProgressValue?: string | number;
  startDate?: string;
  endDate?: string;
  requester?: string;
  guid?: string;
  comment?: string;
};

type OfferItem = {
  name?: string;
  offerName?: string;
  priceCode?: string;
  startDateTime?: string;
  endDateTime?: string;
  territoire?: string;
  id_record?: string | number;
};

type SegmentItem = {
  number?: string | number;
  name?: string;
  tcin?: string;
  tcout?: string;
  status?: string;
};

type SubtitleItem = {
  media?: string;
  som?: string;
  status?: string;
  creation?: string;
  message?: string;
  lookupLimit?: string;
  creator?: string;
};

const props = defineProps<{ emission: Emission | null; }>();

const activeTab = ref<DetailTabKey>("transcodages");
const jobs = ref<JobItem[]>([]);
const segments = ref<SegmentItem[]>([]);
const plannedSegments = ref<SegmentItem[]>([]);
const subtitles = ref<SubtitleItem[]>([]);
const error = ref("");
const contextMenu = reactive({open: false, x: 0, y: 0});
const contextActions = ref<Array<{ label: string; value: string; type: "copy" | "publish" | "check" | "stop" }>>([]);
const answerModal = reactive({open: false, title: "", status: "", message: ""});
const confirmStop = reactive({open: false, jobId: ""});
const sortState = ref<{ key: DetailColumnKey; direction: SortDirection } | null>(null);

const tabItems: Array<{ key: DetailTabKey; label: string }> = [
  {key: "transcodages", label: "Transcodages"},
  {key: "offres", label: "Offres"},
  {key: "segments", label: "Segments transcodés"},
  {key: "segmentsPrevus", label: "Segments prévus"},
  {key: "soustitrages", label: "Sous-titrages"},
];

const tableConfig: Record<DetailTabKey, TableColumn[]> = {
  transcodages: [
    {key: "profileName", label: "Plateform"},
    {key: "offer", label: "Offre"},
    {key: "lastStatus", label: "Statut", status: true},
    {key: "lastProgressValue", label: "% Progression"},
    {key: "startDate", label: "Démarré à", date: true},
    {key: "endDate", label: "Terminé à", date: true},
    {key: "requester", label: "Demandeur"},
    {key: "guid", label: "job-id"},
    {key: "comment", label: "Commentaire"},
  ],
  offres: [
    {key: "name", label: "Plateform"},
    {key: "offerName", label: "Offre"},
    {key: "priceCode", label: "Prix"},
    {key: "startDateTime", label: "Début", date: true},
    {key: "endDateTime", label: "Fin", date: true},
    {key: "territoire", label: "Territoire"},
    {key: "id_record", label: "oid"},
  ],
  segments: [
    {key: "number", label: "Nombre"},
    {key: "name", label: "Nom"},
    {key: "tcin", label: "Début"},
    {key: "tcout", label: "Fin"},
    {key: "status", label: "Statut", status: true},
  ],
  segmentsPrevus: [
    {key: "number", label: "Nombre"},
    {key: "name", label: "Nom"},
    {key: "tcin", label: "Début"},
    {key: "tcout", label: "Fin"},
    {key: "status", label: "Statut", status: true},
  ],
  soustitrages: [
    {key: "media", label: "Ressource"},
    {key: "som", label: "Début de média"},
    {key: "status", label: "Statut", status: true},
    {key: "creation", label: "Date de création", date: true},
    {key: "message", label: "Message"},
    {key: "lookupLimit", label: "Date de clôture", date: true},
    {key: "creator", label: "Demandeur"},
  ],
};

const columnWidths = reactive<Record<DetailColumnKey, number>>({
  profileName: 110,
  offer: 120,
  lastStatus: 110,
  lastProgressValue: 120,
  startDate: 150,
  endDate: 150,
  requester: 120,
  guid: 170,
  comment: 280,
  name: 110,
  offerName: 140,
  priceCode: 110,
  startDateTime: 150,
  endDateTime: 150,
  territoire: 120,
  id_record: 150,
  number: 90,
  tcin: 90,
  tcout: 90,
  status: 110,
  media: 170,
  som: 120,
  creation: 160,
  message: 320,
  lookupLimit: 160,
  creator: 140,
});

const offers = computed<OfferItem[]>(() => {
  return (props.emission?.plateformOffers ?? []).map((offer) => ({
    name: String(offer.name ?? ""),
    offerName: String(offer.offerName ?? ""),
    priceCode: String(offer.priceCode ?? ""),
    startDateTime: offer.startDateTime as string | undefined,
    endDateTime: offer.endDateTime as string | undefined,
    territoire: String(offer.territoire ?? ""),
    id_record: offer.id_record as string | number | undefined,
  }));
});




const selectedEpisodeLabel = computed(() => {
  const idEpisode = props.emission?.idEpisode ? String(props.emission.idEpisode) : "";
  const title = props.emission?.title ? String(props.emission.title) : "";
  return `${idEpisode} ${title}`.trim();
});

const activeColumns = computed(() => tableConfig[activeTab.value] ?? []);

const activeRows = computed<RowItem[]>(() => {
  switch (activeTab.value) {
    case "transcodages":
      return jobs.value as RowItem[];
    case "offres":
      return offers.value as RowItem[];
    case "segments":
      return segments.value as RowItem[];
    case "segmentsPrevus":
      return plannedSegments.value as RowItem[];
    case "soustitrages":
      return subtitles.value as RowItem[];
  }
});

const sortedActiveRows = computed(() => {
  if (!sortState.value) return activeRows.value;
  const {key, direction} = sortState.value;
  const factor = direction === "asc" ? 1 : -1;
  return [...activeRows.value].sort((a, b) => {
    const av = String(a[key] ?? "").toLowerCase();
    const bv = String(b[key] ?? "").toLowerCase();
    if (av < bv) return -1 * factor;
    if (av > bv) return 1 * factor;
    return 0;
  });
});


async function fetchDetails(emission: Emission) {
  jobs.value = [];
  segments.value = [];
  plannedSegments.value = [];
  subtitles.value = [];
  error.value = "";

  const http = useHttp("detail-offer-transcode-emission.fetchDetails");

  try {
    const idRecord = String(emission.idRecord ?? "");
    const idEpisode = String(emission.idEpisode ?? "");

    const noCacheConfig = (seed: number) => ({
      params: {_t: `${Date.now()}-${seed}`},
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
        "If-Modified-Since": "0",
        "If-None-Match": "",
      },
    });

    const [jobsResponse, segmentsResponse, subtitlesResponse] = await Promise.all([
      idRecord ? http.get(`transcode/service/status/${idRecord}`, noCacheConfig(1)) : Promise.resolve({data: []}),
      idRecord ? http.get(`restore/service/segment/${idRecord}`) : Promise.resolve({data: []}),
      idEpisode ? http.get(`subtitle/service/medias/episode/${idEpisode}`, noCacheConfig(3)) : Promise.resolve({data: []}),
    ]);

    const asArray = <T>(value: unknown): T[] => {
      if (Array.isArray(value)) return value as T[];
      if (value && typeof value === "object") {
        const record = value as Record<string, unknown>;
        if (Array.isArray(record.data)) return record.data as T[];
        if (Array.isArray(record.items)) return record.items as T[];
        if (Array.isArray(record.content)) return record.content as T[];
      }
      return [];
    };

    const jobsData = asArray<Record<string, unknown>>(jobsResponse.data);
    const segmentsData = asArray<SegmentItem>(segmentsResponse.data);
    const plannedSegmentsData = emissionSegmentsFallback(emission);
    let subtitlesData = asArray<SubtitleItem>(subtitlesResponse.data);

    if (subtitlesData.length === 0 && idRecord) {
      const subtitlesByRecordResponse = await http.get(`subtitle/service/medias/episode/${idRecord}`, noCacheConfig(4));
      subtitlesData = asArray<SubtitleItem>(subtitlesByRecordResponse.data);
    }

    const firstOffer = offers.value[0] ?? {};
    jobs.value = jobsData.map((item: Record<string, unknown>) => ({
      id: String(item.id ?? ""),
      profileName: String(firstOffer.name ?? ""),
      offer: String(firstOffer.offerName ?? ""),
      lastStatus: String(item.status ?? ""),
      lastProgressValue: (item.progress ?? "") as string | number,
      startDate: item.start as string | undefined,
      endDate: item.end as string | undefined,
      requester: String(item.user ?? ""),
      guid: String(item.jobGuid ?? ""),
      comment: truncate(item.message),
    }));

    segments.value = segmentsData;
    plannedSegments.value = plannedSegmentsData;
    subtitles.value = subtitlesData.map((entry) => ({...entry, message: truncate(entry.message)}));
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    error.value = "Erreur DetailOfferTranscodeEmission: chargement transcodages/offres/segments/sous-titrages impossible. " + `Détail: ${message}`;
  }
}

const contextMenuStyle = computed(() => ({top: `${contextMenu.y}px`, left: `${contextMenu.x}px`}));

function openRowContextMenu(row: RowItem, event: MouseEvent) {
  if (activeTab.value === "transcodages") {
    contextActions.value = [
      {label: "Copier le n° de job", value: String(row.guid ?? ""), type: "copy"},
      {label: "Publier", value: String(row.id ?? ""), type: "publish"},
      {label: "Controle avant Publication", value: String(row.id ?? ""), type: "check"},
      {label: "Stopper le transcodage", value: String(row.id ?? ""), type: "stop"},
    ];
  } else if (activeTab.value === "offres") {
    contextActions.value = [{label: "Copier oid", value: String(row.id_record ?? ""), type: "copy"}];
  } else if (activeTab.value === "segments" || activeTab.value === "segmentsPrevus") {
    contextActions.value = [{label: "Copier le n° de stock", value: String(row.name ?? ""), type: "copy"}];
  } else {
    contextActions.value = [];
  }

  if (!contextActions.value.length) return;
  const estimatedHeight = contextActions.value.length * 42 + 16;
  const estimatedWidth = 250;
  contextMenu.open = true;
  contextMenu.x = Math.min(event.clientX, window.innerWidth - estimatedWidth - 8);
  contextMenu.y = Math.max(8, event.clientY - estimatedHeight);
}

async function copyContextValue(value: string) {
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
  contextMenu.open = false;
}

async function handleContextAction(type: "copy" | "publish" | "check" | "stop", value: string) {
  closeContextMenu();
  if (type === "copy") {
    await copyContextValue(value);
    return;
  }
  if (!value) return;

  const http = useHttp("detail-offer-transcode-emission.context-actions");
  if (type === "publish") {
    try {
      const {data} = await http.post(`distribution/service/publish/${value}`);
      answerModal.open = true;
      answerModal.title = "Publication";
      answerModal.status = String(data?.status ?? "OK");
      answerModal.message = String(data?.error ?? "");
    } catch (e) {
      answerModal.open = true;
      answerModal.title = "Publication";
      answerModal.status = "Erreur";
      answerModal.message = e instanceof Error ? e.message : String(e);
    }
    return;
  }

  if (type === "check") {
    try {
      const {data} = await http.post(`distribution/service/checkup/${value}`);
      answerModal.open = true;
      answerModal.title = "Controle";
      answerModal.status = data?.success ? "success" : "error";
      answerModal.message = String(data?.message ?? "");
    } catch (e) {
      answerModal.open = true;
      answerModal.title = "Controle";
      answerModal.status = "Erreur";
      answerModal.message = e instanceof Error ? e.message : String(e);
    }
    return;
  }

  confirmStop.open = true;
  confirmStop.jobId = value;
}

async function stopTranscoding() {
  if (!confirmStop.jobId) return;
  const http = useHttp("detail-offer-transcode-emission.stop-transcoding");
  try {
    const {data} = await http.post(`transcode/service/job/stop/${confirmStop.jobId}`);
    answerModal.open = true;
    answerModal.title = "Stopper le transcodage";
    answerModal.status = data?.success ? "OK" : "Erreur";
    answerModal.message = data?.success ? "" : String(data?.error ?? "");
  } catch (e) {
    answerModal.open = true;
    answerModal.title = "Stopper le transcodage";
    answerModal.status = "Erreur";
    answerModal.message = e instanceof Error ? e.message : String(e);
  } finally {
    confirmStop.open = false;
  }
}

function closeContextMenu() {
  contextMenu.open = false;
}

function emissionSegmentsFallback(emission: Emission): SegmentItem[] {
  const directSegments = normalizeSegmentCandidates(emission.segments);
  if (directSegments.length > 0) return directSegments;

  const lavaData = Array.isArray(emission.lavadata)
      ? emission.lavadata
      : Array.isArray(emission.lavaData)
          ? emission.lavaData
          : [];

  for (const item of lavaData) {
    const fromLava = normalizeSegmentCandidates((item as { segments?: unknown }).segments);
    if (fromLava.length > 0) return fromLava;
  }

  return [];
}

function normalizeSegmentCandidates(value: unknown): SegmentItem[] {
  if (!Array.isArray(value)) return [];

  return value
      .map((candidate, index) => {
        if (!candidate || typeof candidate !== "object") return null;
        const record = candidate as Record<string, unknown>;
        return {
          number: (record.number ?? record.segment ?? index + 1) as string | number,
          name: String(record.name ?? record.sgtKey ?? record.traficId ?? ""),
          tcin: String(record.tcin ?? record.start ?? ""),
          tcout: String(record.tcout ?? record.end ?? ""),
          status: String(record.status ?? ""),
        } as SegmentItem;
      })
      .filter((segment): segment is SegmentItem => Boolean(segment));
}


function truncate(value: unknown, max = 180): string {
  const text = String(value ?? "");
  return text.length > max ? `${text.slice(0, max)}...` : text;
}

function toggleSort(key: DetailColumnKey) {
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

function sortClass(key: DetailColumnKey) {
  if (!sortState.value || sortState.value.key !== key) return "none";
  return sortState.value.direction;
}

function startResize(key: DetailColumnKey, event: MouseEvent) {
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
  window.addEventListener("click", closeContextMenu);
  window.addEventListener("scroll", closeContextMenu);
});

onBeforeUnmount(() => {
  window.removeEventListener("click", closeContextMenu);
  window.removeEventListener("scroll", closeContextMenu);
});

watch(() => activeTab.value, () => {
  sortState.value = null;
});

watch(
    () => props.emission,
    async (emission) => {
      if (!emission) return;
      await fetchDetails(emission);
    },
    {immediate: true},
);
</script>

<style scoped lang="scss">
.details-tabs {
  margin-top: 1rem;
  background: rgba(8, 32, 56, 0.85);
  border: 1px solid rgba(143, 215, 236, 0.2);
  padding: 0.75rem;
  border-radius: 12px;
  color: #d4edf6;
}

.selected-episode {
  padding: 0.55rem 0.7rem;
  margin-bottom: 0.65rem;
  border: 1px solid rgba(143, 215, 236, 0.22);
  border-radius: 10px;
  background: rgba(15, 43, 69, 0.8);
}

.tabs {
  display: flex;
  gap: 0.45rem;
  margin-bottom: 0.65rem;
  flex-wrap: wrap;
}

.tab {
  border: 1px solid rgba(46, 208, 242, 0.35);
  background: transparent;
  color: #8fe6fa;
  padding: 0.4rem 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
}

.tab.active {
  background: #2ed0f2;
  color: #083047;
  border-color: #2ed0f2;
}

.tab-panel {
  overflow: auto;
  border: 1px solid rgba(143, 215, 236, 0.2);
  border-radius: 10px;
}

table {
  width: max-content;
  min-width: 100%;
  border-collapse: collapse;
  font-size: 0.82rem;
  table-layout: fixed;

  th,
  td {
    text-align: left;
    padding: 0.62rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    border-bottom: 1px solid rgba(143, 215, 236, 0.15);
    color: #d4edf6;
  }

  th {
    background: #0b2038;
    color: #fff;
    position: relative;
  }
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
  border-top: 6px solid #8fb8d5;
  opacity: 0.9;
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
  right: -1px;
  top: 0;
  bottom: 0;
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
  color: #fff;
  font-size: 0.74rem;
  font-weight: 700;
}

:deep(.status-pill--success) { background: #1c8f5a; }
:deep(.status-pill--warning) { background: #d08a22; }
:deep(.status-pill--danger) { background: #c24242; }
:deep(.status-pill--neutral) { background: #6b7280; }

.detail-context-menu {
  position: fixed;
  z-index: 25;
  min-width: 220px;
  background: #0f2b45;
  border: 1px solid rgba(143, 215, 236, 0.22);
  border-radius: 10px;
  box-shadow: 0 8px 22px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
}

.detail-context-menu button {
  border: 0;
  border-bottom: 1px solid rgba(143, 215, 236, 0.18);
  background: transparent;
  color: #d4edf6;
  padding: 0.55rem 0.75rem;
  text-align: left;
  cursor: pointer;
}

.detail-context-menu button:last-child {
  border-bottom: 0;
}

.detail-context-menu button:hover {
  background: rgba(47, 140, 205, 0.2);
}

.error {
  color: #ff8f8f;
  margin-bottom: 0.6rem;
}

.episode-title {
  text-decoration: underline;
  color: #ffffff;
}

.empty-state {
  margin: 0.35rem 0;
  font-size: 0.9rem;
  color: #a9d3e4;
  padding: 0.7rem;
}

.action-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 30;
}

.action-modal {
  width: min(520px, 90vw);
  border-radius: 12px;
  border: 1px solid rgba(143, 215, 236, 0.22);
  background: #0f2b45;
  padding: 1rem;
}

.action-modal__buttons {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.action-modal__buttons button {
  border: 1px solid rgba(46, 208, 242, 0.35);
  border-radius: 8px;
  padding: 0.45rem 0.8rem;
  background: #2ed0f2;
  color: #083047;
  font-weight: 700;
}

.action-modal__buttons button.secondary {
  background: rgba(46, 208, 242, 0.14);
  color: #8fe6fa;
}

</style>
