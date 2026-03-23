<template>
  <form class="search-form" @submit.prevent="submit">
    <div class="">
      <label class="filter-label">
        <span class="filter-label">Type</span>
        <select v-model="vodType">
          <option value="">Tous</option>
          <option v-for="item in vodTypes" :key="item.value" :value="item.value">
            {{ item.value }}
          </option>
        </select>
      </label>
      <label>
        <span class="filter-label">Jour</span>
        <input v-model="date" type="date"/>
      </label>
    </div>

    <div class="search-form__actions search-form__actions--compact">
      <button type="submit">Rechercher</button>
      <button type="button" class="secondary" @click="reset">Réinitialiser</button>
      <!--      <button type="button" class="secondary" @click="$emit('bulk-clean')">Nettoyer statuts sélectionnés</button>-->
    </div>
  </form>
</template>

<script setup lang="ts">
import {ref, watch} from "vue";
import type {OptionItem} from "@/services/notification.api";

const props = defineProps<{
  vodTypes: OptionItem[];
  initialDate?: string;
}>();

const emit = defineEmits<{
  search: [
    payload: {
      date: Date;
      vodType?: string;
    },
  ];
  "bulk-clean": [];
  "date-change": [value: string];
}>();

const date = ref(props.initialDate ?? new Date().toISOString().slice(0, 10));
const vodType = ref("");


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
function submit() {
  const [year, month, day] = date.value.split("-").map(Number);
  emit("date-change", date.value);
  emit("search", {
    date: new Date(year, month - 1, day),
    vodType: vodType.value || undefined,
  });
}

function reset() {
  date.value = new Date().toISOString().slice(0, 10);
  vodType.value = "";
  submit();
}
</script>

<style scoped lang="scss">
.search-form {
  display: grid;
  grid-template-columns: minmax(220px, 1fr) minmax(150px, 0.45fr);
  gap: 0.8rem;
  padding: 0.45rem;
  border-radius: 10px;
  border: 1px solid rgba(143, 215, 236, 0.22);
  background: rgba(9, 31, 54, 0.7);
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
  flex-direction: column;
  width: 100%;
  align-items: stretch;
  gap: 0.5rem;
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
}

.search-form__actions--compact {
  justify-content: center;
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


input[type="date"]::-webkit-calendar-picker-indicator {
  filter: brightness(0) saturate(100%) invert(93%) sepia(20%) saturate(343%) hue-rotate(156deg) brightness(100%) contrast(92%);
  cursor: pointer;
}

</style>
