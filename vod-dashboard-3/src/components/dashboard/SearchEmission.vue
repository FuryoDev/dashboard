<template>
  <form class="search-form" @submit.prevent="submit">
    <div class="search-form__main">
      <label class="filter-label">
        <span class="filter-label">Type</span>
        <select v-if="canSelectVodType" v-model="vodType">
          <option value="">Tous</option>
          <option v-for="item in vodTypes" :key="item.value" :value="item.value">
            {{ item.value }}
          </option>
        </select>
        <span v-else class="readonly-vod-type">{{ effectiveVodType }}</span>
      </label>
      <label>
        <span class="filter-label">Jour</span>
        <input v-model="date" type="date"/>
      </label>
    </div>
    <fieldset class="status-diff-container">
      <legend class="filter-label-status">Statut diffusion</legend>
      <label v-for="status in statusOptions" :key="status.value" class="checkbox-inline">
        <input v-model="selectedStatuses" type="checkbox" :value="status.value"/> {{ status.label }}
      </label>
    </fieldset>

    <div class="search-form__actions search-form__actions--compact">
      <div class="search-button-container">
        <button type="submit">Rechercher</button>
        <button type="button" class="secondary" @click="reset">Réinitialiser</button>
      </div>

      <!--      <button type="button" class="secondary" @click="$emit('bulk-clean')">Nettoyer statuts sélectionnés</button>-->
    </div>
  </form>
</template>

<script setup lang="ts">
import {computed, ref, watch} from "vue";
import type {OptionItem} from "@/services/notification.api";
import {useUserStore} from "@/stores/user.store";

const props = defineProps<{
  vodTypes: OptionItem[];
  initialDate?: string;
}>();

const emit = defineEmits<{
  search: [
    payload: {
      date: Date;
      statuses: string[];
      vodType?: string;
    },
  ];
  "bulk-clean": [];
  "date-change": [value: string];
}>();

const date = ref(props.initialDate ?? new Date().toISOString().slice(0, 10));
const vodType = ref("");
const selectedStatuses = ref<string[]>([]);
const userStore = useUserStore();

const canSelectVodType = computed(() => userStore.canSelectVodType);

function normalizeVodType(value: string): string {
  return value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[\s_-]/g, "")
      .toUpperCase();
}

function resolveForcedVodType(vodTypes: OptionItem[]): string {
  const values = vodTypes
      .map((item) => String(item.value ?? "").trim())
      .filter(Boolean);

  const findByMatchers = (matchers: RegExp[]) =>
      values.find((value) => {
        const normalized = normalizeVodType(value);
        return matchers.some((matcher) => matcher.test(normalized));
      });

  if (userStore.hasFastTvGroup) {
    const fastType = findByMatchers([/FAST/]);
    if (fastType) return fastType;
  }

  if (userStore.hasVodUsersGroup) {
    const catchupType = findByMatchers([/CATCH/, /CATCHUP/, /FVOD/]);
    if (catchupType) return catchupType;
  }

  return "";
}

const forcedVodType = computed(() => {
  if (canSelectVodType.value) return "";
  return resolveForcedVodType(props.vodTypes);
});
const effectiveVodType = computed(() => forcedVodType.value || vodType.value);
const statusOptions = [
  {value: "PREVU", label: "PREVU"},
  {value: "attente", label: "EN_ATTENTE"},
  {value: "EN_COURS", label: "EN_COURS"},
  {value: "TERMINE", label: "TERMINE"},
  {value: "Publié", label: "PUBLIE"},
  {value: "ECHEC", label: "ECHEC"},
];


watch(
    () => props.initialDate,
    (value) => {
      if (value && value !== date.value) {
        date.value = value;
      }
    },
);

watch(
    date,
    (value) => {
      emit("date-change", value);
    },
);

watch(
    forcedVodType,
    (value) => {
      vodType.value = value;
    },
    {immediate: true},
);

function submit() {
  const [year, month, day] = date.value.split("-").map(Number);
  emit("date-change", date.value);
  emit("search", {
    date: new Date(year, month - 1, day),
    statuses: selectedStatuses.value,
    vodType: effectiveVodType.value || undefined,
  });
}

function reset() {
  vodType.value = forcedVodType.value || "";
  selectedStatuses.value = [];
  submit();
}
</script>

<style scoped lang="scss">
.search-form {
  display: flex;
  align-items: flex-start;
  flex-wrap: nowrap;
  gap: 0.8rem;
  padding: 0.45rem;
  border-radius: 10px;
  border: 1px solid rgba(143, 215, 236, 0.22);
  background: rgba(9, 31, 54, 0.7);
}

.search-form__main {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  min-width: 340px;
}

label,
fieldset {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-size: 0.88rem;
  border: 0;
  margin: 0;
  padding: 0;
  color: #d4edf6;
}

.checkbox-inline {
  flex-direction: row;
  align-items: center;
  display: inline-flex;
  margin-right: 0.5rem;
}

input,
select {
  border: 1px solid rgba(143, 215, 236, 0.4);
  background: #0f2b45;
  color: #d4edf6;
  border-radius: 8px;
  padding: 0.42rem 0.55rem;
}

select[multiple] {
  min-height: 80%;
}

.search-form__actions {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 0.5rem;
  margin: auto;
  margin-right: 0.5rem;
}

button {
  border: 0;
  background: #2ed0f2;
  border-radius: 8px;
  color: #083047;
  padding: 0.6rem 0.9rem;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  margin-left: 0.7rem;
}

.search-form__actions--compact {
  justify-content: flex-end;
}

.secondary {
  background: rgba(46, 208, 242, 0.14);
  color: #8fe6fa;
  border: 1px solid rgba(46, 208, 242, 0.35);
}

.filter-label {
  margin-bottom: 0.3rem;
  font-weight: 700;
}

.filter-label-status {
  margin-bottom: 0.8rem;
}

.readonly-vod-type {
  border: 1px solid rgba(143, 215, 236, 0.4);
  background: rgba(15, 43, 69, 0.35);
  color: #d4edf6;
  border-radius: 8px;
  padding: 0.42rem 0.55rem;
  min-height: 2.2rem;
  display: inline-flex;
  align-items: center;
}


input[type="date"]::-webkit-calendar-picker-indicator {
  filter: brightness(0) saturate(100%) invert(93%) sepia(20%) saturate(343%) hue-rotate(156deg) brightness(100%) contrast(92%);
  cursor: pointer;
}

.status-diff-container {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 0.45rem;
  border: 0;
  margin: 0;
  min-width: 380px;
}

.status-diff-container .filter-label {
  margin: 0 0.25rem 0 0;
}

.search-button-container {
  margin: auto;
}

</style>
