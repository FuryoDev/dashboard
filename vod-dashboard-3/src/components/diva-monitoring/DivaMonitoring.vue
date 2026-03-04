<template>
  <section class="diva-monitoring">
    <header class="diva-monitoring__header">
      <h1>Diva Monitoring</h1>
      <p>Suivi des jobs d'exportation Diva.</p>
    </header>

    <div class="diva-monitoring__filters">
      <label class="field">
        <span>Date</span>
        <input v-model="selectedDate" type="date">
      </label>

      <label class="toggle">
        <input v-model="manualOnly" type="checkbox">
        <span>Uniquement manuelle</span>
      </label>

      <button type="button" @click="refreshNow">Rechercher</button>
    </div>

    <div class="table-card">
      <p v-if="error" class="error">{{ error }}</p>

      <table>
        <thead>
        <tr>
          <th>Titre</th>
          <th>Média</th>
          <th>Status</th>
          <th>Date début</th>
          <th>Progress</th>
          <th>Manuelle</th>
        </tr>
        </thead>
        <tbody>
        <tr v-if="loading">
          <td colspan="6">Chargement...</td>
        </tr>
        <tr v-else-if="filteredJobs.length === 0">
          <td colspan="6">Aucun job trouvé.</td>
        </tr>
        <tr v-for="job in filteredJobs" :key="`${job.mediaId}-${job.creation}-${job.title}`">
          <td>{{ job.title }}</td>
          <td>{{ job.mediaId }}</td>
          <td>
              <span class="status-pill" :class="statusClass(job.status)">
                {{ job.status }}
              </span>
          </td>
          <td>{{ job.creation }}</td>
          <td>
            <div class="progress">
              <div class="progress__value" :style="{ width: `${sanitizeProgress(job.progress)}%` }"></div>
            </div>
            <small>{{ sanitizeProgress(job.progress) }}%</small>
          </td>
          <td>{{ job.manuel ? "Oui" : "Non" }}</td>
        </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup lang="ts">
import {computed, onMounted, onUnmounted, ref, watch} from "vue";
import {useRoute, useRouter} from "vue-router";
import {useHttp} from "@/composables/useHttp";
import {fetchDivaJobsByDay} from "@/services/diva-monitoring.api";
import type {DivaJob} from "@/types/diva-monitoring";

const route = useRoute();
const router = useRouter();
const http = useHttp("DivaMonitoring");

const selectedDate = ref<string>("");
const manualOnly = ref(false);
const jobs = ref<DivaJob[]>([]);
const loading = ref(false);
const error = ref<string>("");

let polling: ReturnType<typeof setTimeout> | null = null;

const filteredJobs = computed(() => {
  if (!manualOnly.value) return jobs.value;
  return jobs.value.filter((job) => job.manuel);
});

function normalizeRouteDate(value: unknown): string {
  if (typeof value !== "string") return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  return "";
}

function statusClass(status: string): string {
  switch (status) {
    case "DIVA_ACCOMPLI":
    case "DIVA_COMPLETED":
      return "status-pill--success";
    case "DIVA_RUNNING":
      return "status-pill--info";
    case "DIVA_ABORTED":
      return "status-pill--danger";
    default:
      return "";
  }
}

function sanitizeProgress(progress: number): number {
  return Math.min(100, Math.max(0, Math.round(progress ?? 0)));
}

async function fetchJobs() {
  if (!selectedDate.value) return;

  loading.value = true;
  error.value = "";

  if (polling) {
    clearTimeout(polling);
  }

  try {
    jobs.value = await fetchDivaJobsByDay(http, selectedDate.value);
  } catch (fetchError) {
    console.error("[DivaMonitoring] Impossible de charger les jobs", fetchError);
    jobs.value = [];
    error.value = "Impossible de charger les jobs Diva pour la date sélectionnée.";
  } finally {
    loading.value = false;
    polling = setTimeout(() => {
      void fetchJobs();
    }, 60 * 1000);
  }
}

async function refreshNow() {
  await fetchJobs();
}

watch(selectedDate, async (value) => {
  if (!value) return;
  await router.replace({name: "diva-monitoring", params: {date: value}});
  await fetchJobs();
});

watch(
    () => route.params.date,
    (value) => {
      const date = normalizeRouteDate(value);
      if (date && selectedDate.value !== date) {
        selectedDate.value = date;
      }
    },
);

onMounted(() => {
  const routeDate = normalizeRouteDate(route.params.date);
  selectedDate.value = routeDate || new Date().toISOString().slice(0, 10);
});

onUnmounted(() => {
  if (polling) clearTimeout(polling);
});
</script>

<style scoped lang="scss">
.diva-monitoring {
  color: #d4edf6;
}

.diva-monitoring__header {
  margin-bottom: 1rem;

  h1 {
    margin: 0;
    color: #ffffff;
    font-size: 1.4rem;
  }

  p {
    margin: 0.25rem 0 0;
    color: #a9d3e4;
  }
}

.diva-monitoring__filters {
  display: flex;
  gap: 0.9rem;
  align-items: center;
  flex-wrap: wrap;
  padding: 0.8rem;
  background: rgba(9, 31, 54, 0.7);
  border: 1px solid rgba(143, 215, 236, 0.2);
  border-radius: 10px;
  margin-bottom: 1rem;

  button {
    border: 0;
    border-radius: 8px;
    background: #2ed0f2;
    color: #083047;
    font-weight: 700;
    padding: 0.45rem 0.85rem;
    cursor: pointer;
  }
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;

  input {
    border-radius: 8px;
    border: 1px solid rgba(143, 215, 236, 0.4);
    background: #0f2b45;
    color: #d4edf6;
    padding: 0.4rem 0.55rem;
  }
}

.toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  margin-top: 1.15rem;
}

.table-card {
  background: rgba(8, 32, 56, 0.85);
  border: 1px solid rgba(143, 215, 236, 0.2);
  border-radius: 12px;
  overflow: auto;
}

.error {
  margin: 0;
  padding: 0.8rem;
  color: #ff8f8f;
}

table {
  width: 100%;
  border-collapse: collapse;

  th,
  td {
    padding: 0.7rem;
    border-bottom: 1px solid rgba(143, 215, 236, 0.15);
    text-align: left;
  }

  th {
    color: #ffffff;
    font-size: 0.86rem;
  }

  td {
    color: #d4edf6;
    font-size: 0.9rem;
  }
}

.status-pill {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 0.2rem 0.55rem;
  font-size: 0.75rem;
  font-weight: 700;
  background: #475569;
  color: #ffffff;
}

.status-pill--success {
  background: #1c8f5a;
}

.status-pill--info {
  background: #2f8ccd;
}

.status-pill--danger {
  background: #c24242;
}

.progress {
  width: 120px;
  height: 8px;
  border-radius: 999px;
  background: rgba(212, 237, 246, 0.22);
  overflow: hidden;
}

.progress__value {
  height: 100%;
  background: linear-gradient(90deg, #4cc9f0 0%, #80ffdb 100%);
}
</style>
