<template>
  <form class="search-form" @submit.prevent="submit">
    <label>
      Jour VOD
      <input v-model="date" type="date" />
    </label>

    <label>
      Chaine de diffusion
      <select v-model="selectedChannels" multiple>
        <option v-for="channel in channels" :key="channel.value" :value="channel.text">
          {{ channel.text }}
        </option>
      </select>
    </label>

    <label>
      Plateforme
      <select v-model="selectedPlatforms" multiple>
        <option v-for="platform in platforms" :key="platform.value" :value="platform.text">
          {{ platform.text }}
        </option>
      </select>
    </label>

    <label>
      Type VOD
      <select v-model="vodType">
        <option value="">Tous</option>
        <option v-for="item in vodTypes" :key="item.value" :value="item.value">
          {{ item.value }}
        </option>
      </select>
    </label>

    <fieldset>
      <legend>Statut diffusion</legend>
      <label v-for="status in statusOptions" :key="status" class="checkbox-inline">
        <input v-model="selectedStatuses" type="checkbox" :value="status" /> {{ status }}
      </label>
    </fieldset>

    <div class="search-form__actions">
      <button type="submit">Rechercher</button>
      <button type="button" class="secondary" @click="reset">Réinitialiser</button>
      <button type="button" class="secondary" @click="$emit('bulk-clean')">Nettoyer statuts sélectionnés</button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref } from "vue";
import type { OptionItem } from "@/services/notification.api";

const props = defineProps<{
  channels: OptionItem[];
  platforms: OptionItem[];
  vodTypes: OptionItem[];
}>();

const emit = defineEmits<{
  search: [
    payload: {
      date: Date;
      channels: string[];
      platforms: string[];
      statuses: string[];
      vodType?: string;
    },
  ];
  "bulk-clean": [];
}>();

const date = ref(new Date().toISOString().slice(0, 10));
const selectedChannels = ref<string[]>([]);
const selectedPlatforms = ref<string[]>([]);
const selectedStatuses = ref<string[]>([]);
const vodType = ref("");
const statusOptions = ["PREVU", "EN_ATTENTE", "EN_COURS", "TERMINE", "PUBLIE", "ECHEC"];

function submit() {
  const [year, month, day] = date.value.split("-").map(Number);
  emit("search", {
    date: new Date(year, month - 1, day),
    channels: selectedChannels.value,
    platforms: selectedPlatforms.value,
    statuses: selectedStatuses.value,
    vodType: vodType.value || undefined,
  });
}

function reset() {
  date.value = new Date().toISOString().slice(0, 10);
  selectedChannels.value = [];
  selectedPlatforms.value = [];
  selectedStatuses.value = [];
  vodType.value = "";
  submit();
}
</script>

<style scoped lang="scss">
.search-form {
  display: grid;
  grid-template-columns: repeat(5, minmax(180px, 1fr));
  gap: 0.8rem;
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid #d9d9d9;
  background: #efeded;
}

label,
fieldset {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.875rem;
  border: 0;
  margin: 0;
  padding: 0;
}

.checkbox-inline {
  flex-direction: row;
  align-items: center;
  display: inline-flex;
  margin-right: 0.5rem;
}

input,
select {
  border: 1px solid #c2c2c2;
  padding: 0.3rem 0.4rem;
}

select[multiple] {
  min-height: 64px;
}

.search-form__actions {
  grid-column: span 5;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

button {
  border: 1px solid #2f9f8f;
  background: #2f9f8f;
  color: #fff;
  padding: 0.4rem 0.6rem;
  cursor: pointer;
}

.secondary {
  background: #fff;
  color: #2f9f8f;
}
</style>
