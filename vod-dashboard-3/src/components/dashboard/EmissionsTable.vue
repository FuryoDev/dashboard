<template>
  <section class="emission-list">
    <header>
      <h2>Émissions </h2>
      <p v-if="loading">Chargement...</p>
    </header>

    <table>
      <thead>
        <tr>
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
        <tr
          v-for="item in paginated"
          :key="String(item.idRecord)"
          :class="{ selected: isSelected(item) }"
          @click="onRowClick(item, $event)"
          @contextmenu.prevent="onRowContextMenu(item, $event)"
        >
          <td>{{ String(item.channel ?? "") }}</td>
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

    <div v-if="contextMenu.open" class="context-menu" :style="contextMenuStyle">
      <button type="button" @click="copyText('serie')">Copier le n° de série</button>
      <button type="button" @click="copyText('episode')">Copier le n° d'épisode</button>
      <button type="button" @click="copyText('idRecord')">Copier id record</button>
      <button type="button" @click="copyText('stock')">Copier le n° de stock</button>
      <button type="button" @click="closeContextMenu">Demande d'export des archives</button>
      <button type="button" @click="closeContextMenu">Vérification avant traitement</button>
      <button type="button" @click="closeContextMenu">Régénération des sous-titres</button>
      <button type="button" @click="closeContextMenu">Changement des statuts du traitement</button>
      <button type="button" @click="closeContextMenu">Changement du délai de traitement</button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";
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
const selectionAnchor = ref<number | null>(null);
const contextMenuTarget = ref<Emission | null>(null);
const contextMenu = reactive({ open: false, x: 0, y: 0 });

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

const contextMenuStyle = computed(() => ({
  top: `${contextMenu.y}px`,
  left: `${contextMenu.x}px`,
}));

function idKey(item: Emission) {
  return String(item.idRecord ?? "");
}

function replaceSelection(items: Emission[]) {
  const deduped = items.filter(
    (item, index, list) => list.findIndex((candidate) => idKey(candidate) === idKey(item)) === index,
  );
  emit("update:selected", deduped);
}

function onRowClick(item: Emission, event: MouseEvent) {
  closeContextMenu();
  emit("focus", item);

  const index = props.emissions.findIndex((entry) => idKey(entry) === idKey(item));
  if (index < 0) return;

  if (event.shiftKey && selectionAnchor.value !== null) {
    const start = Math.min(selectionAnchor.value, index);
    const end = Math.max(selectionAnchor.value, index);
    replaceSelection(props.emissions.slice(start, end + 1));
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

function closeContextMenu() {
  contextMenu.open = false;
}

function handleGlobalPointer() {
  closeContextMenu();
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
  background: #1b2433;
  color: #fff;
}

tbody tr.selected {
  background: #a8d7e6;
}

.link {
  border: 0;
  background: none;
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
</style>
