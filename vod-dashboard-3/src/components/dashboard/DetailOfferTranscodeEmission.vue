<template>
  <section class="details-tabs">
    <p v-if="!emission">Sélectionnez une émission pour voir ses détails.</p>

    <template v-else>
      <div class="selected-episode">Episode sélectionné: {{ selectedEpisodeLabel }}</div>

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

      <div v-if="activeTab === 'transcodages'" class="tab-panel">
        <table>
          <thead>
          <tr>
            <th>Plateform</th>
            <th>Offre</th>
            <th>Statut</th>
            <th>% Progression</th>
            <th>Démarré à</th>
            <th>Terminé à</th>
            <th>Demandeur</th>
            <th>job-id</th>
            <th>Commentaire</th>
          </tr>
          </thead>
          <tbody>
          <tr
            v-for="(job, idx) in jobs"
            :key="`${String(job.guid ?? idx)}-${idx}`"
            @contextmenu.prevent="openContextMenu('job', job, $event)"
          >
            <td>{{ String(job.profileName ?? '') }}</td>
            <td>{{ String(job.offer ?? '') }}</td>
            <td><span :class="getStatusClass(String(job.lastStatus ?? ''))">{{ String(job.lastStatus ?? '') }}</span>
            </td>
            <td>{{ String(job.lastProgressValue ?? '') }}</td>
            <td>{{ formatReadableDate(job.startDate as string | undefined) }}</td>
            <td>{{ formatReadableDate(job.endDate as string | undefined) }}</td>
            <td>{{ String(job.requester ?? '') }}</td>
            <td>{{ String(job.guid ?? '') }}</td>
            <td>{{ String(job.comment ?? '') }}</td>
          </tr>
          </tbody>
        </table>
      </div>

      <div v-else-if="activeTab === 'offres'" class="tab-panel">
        <table>
          <thead>
          <tr>
            <th>Plateform</th>
            <th>Offre</th>
            <th>Prix</th>
            <th>Début</th>
            <th>Fin</th>
            <th>Territoire</th>
            <th>oid</th>
          </tr>
          </thead>
          <tbody>
          <tr
            v-for="(offer, idx) in offers"
            :key="`${String(offer.id_record ?? idx)}-${idx}`"
            @contextmenu.prevent="openContextMenu('offer', offer, $event)"
          >
            <td>{{ String(offer.name ?? '') }}</td>
            <td>{{ String(offer.offerName ?? '') }}</td>
            <td>{{ String(offer.priceCode ?? '') }}</td>
            <td>{{ formatReadableDate(offer.startDateTime as string | undefined) }}</td>
            <td>{{ formatReadableDate(offer.endDateTime as string | undefined) }}</td>
            <td>{{ String(offer.territoire ?? '') }}</td>
            <td>{{ String(offer.id_record ?? '') }}</td>
          </tr>
          </tbody>
        </table>
      </div>

      <div v-else-if="activeTab === 'segments'" class="tab-panel">
        <table>
          <thead>
          <tr>
            <th>Nombre</th>
            <th>Nom</th>
            <th>Début</th>
            <th>Fin</th>
            <th>Statut</th>
          </tr>
          </thead>
          <tbody>
          <tr
            v-for="(segment, idx) in segments"
            :key="`${String(segment.name ?? idx)}-${idx}`"
            @contextmenu.prevent="openContextMenu('segment', segment, $event)"
          >
            <td>{{ String(segment.number ?? '') }}</td>
            <td>{{ String(segment.name ?? '') }}</td>
            <td>{{ String(segment.tcin ?? '') }}</td>
            <td>{{ String(segment.tcout ?? '') }}</td>
            <td><span :class="getStatusClass(String(segment.status ?? ''))">{{ String(segment.status ?? '') }}</span>
            </td>
          </tr>
          </tbody>
        </table>
      </div>

      <div v-else-if="activeTab === 'segmentsPrevus'" class="tab-panel">
        <table>
          <thead>
          <tr>
            <th>Nombre</th>
            <th>Nom</th>
            <th>Début</th>
            <th>Fin</th>
            <th>Statut</th>
          </tr>
          </thead>
          <tbody>
          <tr
            v-for="(segment, idx) in plannedSegments"
            :key="`${String(segment.name ?? idx)}-planned-${idx}`"
            @contextmenu.prevent="openContextMenu('segment', segment, $event)"
          >
            <td>{{ String(segment.number ?? '') }}</td>
            <td>{{ String(segment.name ?? '') }}</td>
            <td>{{ String(segment.tcin ?? '') }}</td>
            <td>{{ String(segment.tcout ?? '') }}</td>
            <td><span :class="getStatusClass(String(segment.status ?? ''))">{{ String(segment.status ?? '') }}</span>
            </td>
          </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="tab-panel">
        <table>
          <thead>
          <tr>
            <th>Ressource</th>
            <th>Début de média</th>
            <th>Statut</th>
            <th>Date de création</th>
            <th>Message</th>
            <th>Date de clôture</th>
            <th>Demandeur</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="(subtitle, idx) in subtitles" :key="`${String(subtitle.media ?? idx)}-${idx}`">
            <td>{{ String(subtitle.media ?? '') }}</td>
            <td>{{ String(subtitle.som ?? '') }}</td>
            <td><span :class="getStatusClass(String(subtitle.status ?? ''))">{{ String(subtitle.status ?? '') }}</span>
            </td>
            <td>{{ formatReadableDate(subtitle.creation as string | undefined) }}</td>
            <td>{{ truncate(subtitle.message) }}</td>
            <td>{{ formatReadableDate(subtitle.lookupLimit as string | undefined) }}</td>
            <td>{{ String(subtitle.creator ?? '') }}</td>
          </tr>
          </tbody>
        </table>
      </div>


      <div v-if="contextMenu.open" class="detail-context-menu" :style="contextMenuStyle">
        <button v-for="action in contextActions" :key="action.label" type="button" @click="copyContextValue(action.value)">
          {{ action.label }}
        </button>
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

type JobItem = {
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

const props = defineProps<{
  emission: Emission | null;
}>();

const activeTab = ref<DetailTabKey>("transcodages");
const jobs = ref<JobItem[]>([]);
const segments = ref<SegmentItem[]>([]);
const subtitles = ref<SubtitleItem[]>([]);
const error = ref("");
const contextMenu = reactive({open: false, x: 0, y: 0});
const contextActions = ref<Array<{ label: string; value: string }>>([]);

const tabItems: Array<{ key: DetailTabKey; label: string }> = [
  {key: "transcodages", label: "Transcodages"},
  {key: "offres", label: "Offres"},
  {key: "segments", label: "Segments"},
  {key: "segmentsPrevus", label: "Segments prévus"},
  {key: "soustitrages", label: "Sous-titrages"},
];

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

const plannedSegments = computed<SegmentItem[]>(() => {
  const candidate =
      (props.emission?.segmentsPrevus as SegmentItem[] | undefined) ??
      (props.emission?.plannedSegments as SegmentItem[] | undefined) ??
      (props.emission?.segmentsPlanned as SegmentItem[] | undefined) ??
      [];
  return Array.isArray(candidate) ? candidate : [];
});

const selectedEpisodeLabel = computed(() => {
  const idEpisode = props.emission?.idEpisode ? String(props.emission.idEpisode) : "";
  const title = props.emission?.title ? String(props.emission.title) : "";
  return `${idEpisode} ${title}`.trim();
});

async function fetchDetails(emission: Emission) {
  jobs.value = [];
  segments.value = [];
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
      idRecord ? http.get(`restore/service/segment/${idRecord}`, noCacheConfig(2)) : Promise.resolve({data: []}),
      idEpisode
          ? http.get(`subtitle/service/medias/episode/${idEpisode}`, noCacheConfig(3))
          : Promise.resolve({data: []}),
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
    let subtitlesData = asArray<SubtitleItem>(subtitlesResponse.data);

    if (subtitlesData.length === 0 && idRecord) {
      const subtitlesByRecordResponse = await http.get(
          `subtitle/service/medias/episode/${idRecord}`,
          noCacheConfig(4),
      );
      subtitlesData = asArray<SubtitleItem>(subtitlesByRecordResponse.data);
    }

    const firstOffer = offers.value[0] ?? {};
    jobs.value = jobsData.map((item: Record<string, unknown>) => ({
      profileName: String(firstOffer.name ?? ""),
      offer: String(firstOffer.offerName ?? ""),
      lastStatus: String(item.status ?? ""),
      lastProgressValue: (item.progress ?? "") as string | number,
      startDate: item.start as string | undefined,
      endDate: item.end as string | undefined,
      requester: String(item.user ?? ""),
      guid: String(item.jobGuid ?? ""),
      comment: String(item.message ?? ""),
    }));

    segments.value = segmentsData;
    subtitles.value = subtitlesData;
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    error.value =
        "Erreur DetailOfferTranscodeEmission: chargement transcodages/offres/segments/segments prévus/sous-titrages impossible. " +
        `Détail: ${message}`;
  }
}



const contextMenuStyle = computed(() => ({
  top: `${contextMenu.y}px`,
  left: `${contextMenu.x}px`,
}));

function openContextMenu(type: "job" | "offer" | "segment", row: Record<string, unknown>, event: MouseEvent) {
  if (type === "job") {
    contextActions.value = [{label: "Copier le n° de job", value: String(row.guid ?? "")}];
  } else if (type === "offer") {
    contextActions.value = [{label: "Copier oid", value: String(row.id_record ?? "")}];
  } else {
    contextActions.value = [{label: "Copier le n° de stock", value: String(row.name ?? "")}];
  }

  contextMenu.open = true;
  contextMenu.x = event.clientX;
  contextMenu.y = event.clientY;
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

function closeContextMenu() {
  contextMenu.open = false;
}

onMounted(() => {
  window.addEventListener("click", closeContextMenu);
  window.addEventListener("scroll", closeContextMenu);
});

onBeforeUnmount(() => {
  window.removeEventListener("click", closeContextMenu);
  window.removeEventListener("scroll", closeContextMenu);
});

function truncate(value: unknown, max = 180): string {
  const text = String(value ?? "");
  return text.length > max ? `${text.slice(0, max)}...` : text;
}

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
  background: #f2f3f6;
  border: 1px solid #cfd6df;
  padding: 0.5rem;
  border-radius: 8px;
}

.selected-episode {
  padding: 0.5rem;
  margin-bottom: 0.5rem;
  border: 1px solid #d9d9d9;
}

.tabs {
  display: flex;
  gap: 0.35rem;
  margin-bottom: 0.5rem;
}

.tab {
  border: 1px solid #c2c2c2;
  background: #fff;
  padding: 0.35rem 0.6rem;
  border-radius: 6px;
  cursor: pointer;
}

.tab.active {
  font-weight: 600;
  background: #0e98b6;
  color: #fff;
  border-color: #0e98b6;
}

.tab-panel {
  overflow: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.82rem;
}

th,
td {
  border: 1px solid #ececec;
  text-align: left;
  padding: 0.3rem;
  white-space: nowrap;
}

th {
  padding: 0.7rem;
  background: #1b2433;
  color: #fff;
}

:deep(.status-pill) {
  display: inline-block;
  padding: 0.1rem 0.35rem;
  border-radius: 2px;
  font-weight: 600;
}

:deep(.status-pill--success) {
  background: #00ff00;
}

:deep(.status-pill--warning) {
  background: #f0a80d;
}

:deep(.status-pill--danger) {
  background: #ff0000;
  color: #fff;
}

:deep(.status-pill--neutral) {
  background: #ffffff;
}

.detail-context-menu {
  position: fixed;
  z-index: 25;
  min-width: 220px;
  background: #fff;
  border: 1px solid #ced5df;
  border-radius: 6px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.18);
  display: flex;
  flex-direction: column;
}

.detail-context-menu button {
  border: 0;
  border-bottom: 1px solid #e5e8ef;
  background: #fff;
  padding: 0.55rem 0.75rem;
  text-align: left;
  cursor: pointer;
}

.detail-context-menu button:last-child {
  border-bottom: 0;
}

.detail-context-menu button:hover {
  background: #f4f7fb;
}

.error {
  color: #9d1b1b;
  margin-bottom: 0.5rem;
}
</style>
