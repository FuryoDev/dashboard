<template>
  <form class="search-form" @submit.prevent="submit">
    <div class="">
      <label class="filter-label">
        <span class="filter-label">VOD</span>
        <select v-model="vodType">
          <option value="">Tous</option>
          <option v-for="item in vodTypes" :key="item.value" :value="item.value">
            {{ item.value }}
          </option>
        </select>
      </label>
      <label>
        <span class="filter-label">Jour VOD</span>
        <input v-model="date" type="date"/>
      </label>
    </div>

    <label>
      <span class="filter-label">Chaine de diffusion</span>
      <select v-model="selectedChannels" multiple>
        <option v-for="channel in channels" :key="channel.value" :value="channel.text">
          {{ channel.text }}
        </option>
      </select>
    </label>

    <label>
      <span class="filter-label">Plateforme</span>
      <select v-model="selectedPlatforms" multiple>
        <option v-for="platform in platforms" :key="platform.value" :value="platform.text">
          {{ platform.text }}
        </option>
      </select>
    </label>

    <fieldset>
      <legend class="filter-label">Statut diffusion</legend>
      <label v-for="status in statusOptions" :key="status" class="checkbox-inline">
        <input v-model="selectedStatuses" type="checkbox" :value="status"/> {{ status }}
      </label>
    </fieldset>

    <div class="search-form__actions search-form__actions--compact">
      <button type="submit">Rechercher</button>
      <button type="button" class="secondary" @click="reset">Réinitialiser</button>
      <!--      <button type="button" class="secondary" @click="$emit('bulk-clean')">Nettoyer statuts sélectionnés</button>-->
    </div>
  </form>
</template>

<script setup lang="ts">
import {ref} from "vue";
import type {OptionItem} from "@/services/notification.api";

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
  grid-template-columns: minmax(180px, 1fr) minmax(180px, 1fr) minmax(180px, 1fr) minmax(180px, 0.8fr) minmax(150px, 0.5fr);
  gap: 0.8rem;
  padding: 0.9rem;
  border-radius: 12px;
  border: 1px solid #d5dae1;
  background: #eff0f3;
}

label,
fieldset {
  display: flex;
  flex-direction: column;
  gap: 0.28rem;
  font-size: 0.9rem;
  border: 0;
  margin: 0;
  padding: 0;
  color: #1e2634;
}

.checkbox-inline {
  flex-direction: row;
  align-items: center;
  display: inline-flex;
  margin-right: 0.5rem;
}

input,
select {
  border: 1px solid #c7cfd9;
  background: #fff;
  border-radius: 6px;
  padding: 0.38rem 0.5rem;
}

select[multiple] {
  min-height: 80%;
}

.search-form__actions {
  display: flex;
  flex-direction: column;
  width: 100%;
  align-items: stretch;
  gap: 0.5rem;
}

button {
  border: 1px solid #0e98b6;
  background: #0e98b6;
  border-radius: 6px;
  color: #fff;
  padding: 0.65rem 0.95rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
}

.search-form__actions--compact {
  justify-content: center;
}

.secondary {
  background: #fff;
  color: #0e98b6;
}

.filter-label {
  margin-bottom: 0.5rem;
  font-weight: bold;
}
</style>
