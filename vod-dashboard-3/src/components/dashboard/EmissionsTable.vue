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
          <th>ID</th>
          <th>Titre</th>
          <th>Chaîne</th>
          <th>Diffusion</th>
          <th>Statut</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in emissions" :key="String(item.idRecord)">
          <td>
            <input
              type="checkbox"
              :checked="isSelected(item)"
              @change="toggleSelection(item, ($event.target as HTMLInputElement).checked)"
            />
          </td>
          <td>
            <button class="link" type="button" @click="$emit('focus', item)">{{ item.idRecord }}</button>
          </td>
          <td>{{ item.title }}</td>
          <td>{{ item.vodType }}</td>
          <td>{{ formatReadableDate(item.dateHeureDiffusion as string | undefined) }}</td>
          <td>{{ getStatusLabel(item.globalPubStatusName) }}</td>
        </tr>
      </tbody>
    </table>
  </section>
</template>

<script setup lang="ts">
import type { Emission } from "@/types/domain";
import { formatReadableDate } from "@/utils/date";
import { getStatusLabel } from "@/utils/status";

const props = defineProps<{
  emissions: Emission[];
  loading: boolean;
  selected: Emission[];
}>();

const emit = defineEmits<{
  "update:selected": [items: Emission[]];
  focus: [item: Emission];
}>();

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
</script>

<style scoped lang="scss">
.emission-list {
  margin-top: 1rem;
  background: #fff;
  border: 1px solid #d9d9d9;
  padding: 0.75rem;
}

header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

h2,
p {
  margin: 0;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  border: 1px solid #ececec;
  padding: 0.35rem;
  text-align: left;
  font-size: 0.875rem;
}

.link {
  border: 0;
  background: none;
  color: #0047b3;
  padding: 0;
  cursor: pointer;
}
</style>
