<template>
  <form class="search-form" @submit.prevent="submit">
    <div class="search-form__main">
      <label v-if="canSelectVodType" class="search-form__field">
        <span class="search-form__field-label">Type</span>
        <select v-model="selectedVodType">
          <option value="">Tous</option>
          <option v-for="item in vodTypes" :key="item.value" :value="item.value">
            {{ item.value }}
          </option>
        </select>
      </label>
      <label v-else class="search-form__field">
        <span class="search-form__field-label">Type</span>
        <span class="readonly-vod-type">{{ effectiveVodType || "—" }}</span>
      </label>
      <label class="search-form__field">
        <span class="search-form__field-label">Jour</span>
        <input v-model="date" type="date"/>
      </label>
    </div>
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
import {isCatchVodType, isFastVodType} from "@/utils/vodType";

const props = defineProps<{
  vodTypes: OptionItem[];
  initialDate?: string;
}>();

const emit = defineEmits<{
  search: [
    payload: {
      date: Date;
      vodTypes?: string[];
    },
  ];
  "bulk-clean": [];
  "date-change": [value: string];
}>();

const date = ref(props.initialDate ?? new Date().toISOString().slice(0, 10));
const selectedVodType = ref("");
const userStore = useUserStore();

const canSelectVodType = computed(() => userStore.canSelectVodType);

function resolveForcedVodType(vodTypes: OptionItem[]): string {
  const values = vodTypes
      .map((item) => String(item.value ?? "").trim())
      .filter(Boolean);

  // Règles métier:
  // - GR_vodoo_users => CATCH
  // - GR_vodoo_fasttv => FAST
  if (userStore.hasVodUsersGroup) {
    const catchupType = values.find((value) => isCatchVodType(value));
    if (catchupType) return catchupType;
  }

  if (userStore.hasFastTvGroup) {
    const fastType = values.find((value) => isFastVodType(value));
    if (fastType) return fastType;
  }

  return "";
}

const forcedVodType = computed(() => {
  if (canSelectVodType.value) return "";
  return resolveForcedVodType(props.vodTypes);
});
const effectiveVodType = computed(() => forcedVodType.value || selectedVodType.value);

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
      if (!canSelectVodType.value) {
        selectedVodType.value = value;
      }
    },
    {immediate: true},
);

function submit() {
  const [year, month, day] = date.value.split("-").map(Number);
  const vodTypes = effectiveVodType.value ? [effectiveVodType.value] : [];

  emit("date-change", date.value);
  emit("search", {
    date: new Date(year, month - 1, day),
    vodTypes: vodTypes.length ? vodTypes : undefined,
  });
}

function reset() {
  selectedVodType.value = forcedVodType.value || "";
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
  flex-direction: row;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.88rem;
  border: 0;
  margin: 0;
  padding: 0;
  color: #d4edf6;
}

.search-form__field {
  display: inline-flex;
  align-items: center;
}

.search-form__field-label {
  white-space: nowrap;
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
