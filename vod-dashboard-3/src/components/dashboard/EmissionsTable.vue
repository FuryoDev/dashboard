<template>
  <section class="emission-list">
    <header>
      <h2>Émissions ({{ emissions.length }})</h2>
      <p v-if="loading">Chargement...</p>
    </header>

    <table>
      <thead>
        <tr>
          <th></th>
          <th>Chaîne</th>
          <th>Titre</th>
          <th>Durée</th>
          <th>Episode</th>
          <th>Début visib.</th>
          <th>Plateforme</th>
          <th>Traitement</th>
          <th>Commentaire</th>
          <th>Délai</th>
          <th>Par</th>
          <th>Statut transcodage</th>
          <th>% transcod.</th>
          <th>Publication</th>
          <th>Date publication</th>
          <th>PAD</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in paginated" :key="String(item.idRecord)">
          <td>
            <input
              type="checkbox"
              :checked="isSelected(item)"
              @change="toggleSelection(item, ($event.target as HTMLInputElement).checked)"
            />
          </td>
          <td>{{ String(item.chaine ?? "") }}</td>
          <td>
            <button class="link" type="button" @click="$emit('focus', item)">{{ item.title }}</button>
          </td>
          <td>{{ String(item.duree ?? "") }}</td>
          <td>{{ String(item.idEpisode ?? "") }}</td>
          <td>{{ formatReadableDate(item.dateHeureDebutVisibilite as string | undefined) }}</td>
          <td>{{ firstPlatform(item) }}</td>
          <td><span :class="getStatusClass(String(item.recordStatusTraitementItem?.useCase ?? ''))">{{ String(item.recordStatusTraitementItem?.useCase ?? "") }}</span></td>
          <td>{{ statusComment(item) }}</td>
          <td>{{ String(item.recordStatusTraitementItem?.scheduleDelay ?? "") }}</td>
          <td>{{ String(item.recordStatusTraitementItem?.createdBy ?? "") }}</td>
          <td><span :class="getStatusClass(String(item.recordStatusTranscodageItem?.useCase ?? ''))">{{ String(item.recordStatusTranscodageItem?.useCase ?? "") }}</span></td>
          <td>{{ String(item.recordStatusTranscodageItem?.transcodeProgress ?? "") }}</td>
          <td><span :class="getStatusClass(String(item.recordStatusPublicationItem?.useCase ?? ''))">{{ String(item.recordStatusPublicationItem?.useCase ?? "") }}</span></td>
          <td>{{ formatReadableDate(item.recordStatusPublicationItem?.creationTimestamp as string | undefined) }}</td>
          <td>{{ String(item.idStk ?? "") }}</td>
        </tr>
      </tbody>
    </table>

    <footer class="pagination">
      <button type="button" :disabled="page <= 1" @click="page--">Précédent</button>
      <span>Page {{ page }} / {{ totalPages }}</span>
      <button type="button" :disabled="page >= totalPages" @click="page++">Suivant</button>
    </footer>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type { Emission } from "@/types/domain";
import { formatReadableDate } from "@/utils/date";
import { getStatusClass } from "@/utils/status";

const props = defineProps<{
  emissions: Emission[];
  loading: boolean;
  selected: Emission[];
}>();

const emit = defineEmits<{
  "update:selected": [items: Emission[]];
  focus: [item: Emission];
}>();

const page = ref(1);
const pageSize = 20;

const totalPages = computed(() => Math.max(1, Math.ceil(props.emissions.length / pageSize)));
const paginated = computed(() => {
  const start = (page.value - 1) * pageSize;
  return props.emissions.slice(start, start + pageSize);
});

watch(
  () => props.emissions.length,
  () => {
    if (page.value > totalPages.value) page.value = totalPages.value;
  },
);

function isSelected(item: Emission) {
  return props.selected.some((selectedItem) => selectedItem.idRecord === item.idRecord);
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

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.8rem;
  background: #fff;
}

th,
td {
  border: 1px solid #e5e8ee;
  padding: 0.3rem;
  text-align: left;
}

th {
  background: #f0f2f6;
}

.link {
  border: 0;
  background: none;
  color: #0a6d98;
  padding: 0;
  cursor: pointer;
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

.pagination {
  margin-top: 0.6rem;
  display: flex;
  justify-content: flex-end;
  gap: 0.7rem;
}
</style>
