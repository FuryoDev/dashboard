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
            <tr v-for="(job, idx) in jobs" :key="`${String(job.guid ?? idx)}-${idx}`">
              <td>{{ String(job.profileName ?? '') }}</td>
              <td>{{ String(job.offer ?? '') }}</td>
              <td>{{ String(job.lastStatus ?? '') }}</td>
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
            <tr v-for="(offer, idx) in offers" :key="`${String(offer.id_record ?? idx)}-${idx}`">
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
            <tr v-for="(segment, idx) in segments" :key="`${String(segment.name ?? idx)}-${idx}`">
              <td>{{ String(segment.number ?? '') }}</td>
              <td>{{ String(segment.name ?? '') }}</td>
              <td>{{ String(segment.tcin ?? '') }}</td>
              <td>{{ String(segment.tcout ?? '') }}</td>
              <td>{{ String(segment.status ?? '') }}</td>
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
            <tr v-for="(segment, idx) in plannedSegments" :key="`${String(segment.name ?? idx)}-planned-${idx}`">
              <td>{{ String(segment.number ?? '') }}</td>
              <td>{{ String(segment.name ?? '') }}</td>
              <td>{{ String(segment.tcin ?? '') }}</td>
              <td>{{ String(segment.tcout ?? '') }}</td>
              <td>{{ String(segment.status ?? '') }}</td>
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
              <td>{{ String(subtitle.status ?? '') }}</td>
              <td>{{ formatReadableDate(subtitle.creation as string | undefined) }}</td>
              <td>{{ truncate(subtitle.message) }}</td>
              <td>{{ formatReadableDate(subtitle.lookupLimit as string | undefined) }}</td>
              <td>{{ String(subtitle.creator ?? '') }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useHttp } from "@/composables/useHttp";
import { formatReadableDate } from "@/utils/date";
import type { Emission } from "@/types/domain";

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

const tabItems: Array<{ key: DetailTabKey; label: string }> = [
  { key: "transcodages", label: "Transcodages" },
  { key: "offres", label: "Offres" },
  { key: "segments", label: "Segments" },
  { key: "segmentsPrevus", label: "Segments prévus" },
  { key: "soustitrages", label: "Sous-titrages" },
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

    const [jobsResponse, segmentsResponse, subtitlesResponse] = await Promise.all([
      idRecord ? http.get(`transcode/service/status/${idRecord}`) : Promise.resolve({ data: [] }),
      idRecord ? http.get(`restore/service/segment/${idRecord}`) : Promise.resolve({ data: [] }),
      idEpisode ? http.get(`subtitle/service/medias/episode/${idEpisode}`) : Promise.resolve({ data: [] }),
    ]);

    const firstOffer = offers.value[0] ?? {};
    jobs.value = (jobsResponse.data ?? []).map((item: Record<string, unknown>) => ({
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

    segments.value = Array.isArray(segmentsResponse.data) ? (segmentsResponse.data as SegmentItem[]) : [];
    subtitles.value = Array.isArray(subtitlesResponse.data) ? (subtitlesResponse.data as SubtitleItem[]) : [];
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    error.value =
      "Erreur DetailOfferTranscodeEmission: chargement transcodages/offres/segments/segments prévus/sous-titrages impossible. " +
      `Détail: ${message}`;
  }
}

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
  { immediate: true },
);
</script>

<style scoped lang="scss">
.details-tabs {
  margin-top: 1rem;
  background: #fff;
  border: 1px solid #d9d9d9;
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
  cursor: pointer;
}

.tab.active {
  font-weight: 600;
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

.error {
  color: #9d1b1b;
  margin-bottom: 0.5rem;
}
</style>
