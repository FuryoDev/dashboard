<template>
  <form class="search-form" @submit.prevent="submit">
    <label>
      Date
      <input v-model="date" type="date" />
    </label>

    <label>
      Chaîne
      <input v-model="channel" type="text" placeholder="Ex: LAUNE" />
    </label>

    <div class="search-form__actions">
      <button type="submit">Rechercher</button>
      <button type="button" class="secondary" @click="reset">Réinitialiser</button>
      <button type="button" class="secondary" @click="$emit('bulk-clean')">Nettoyer statuts sélectionnés</button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref } from "vue";

const emit = defineEmits<{
  search: [payload: { date?: string; channel?: string }];
  "bulk-clean": [];
}>();

const date = ref("");
const channel = ref("LAUNE");

function submit() {
  emit("search", { date: date.value || undefined, channel: channel.value || undefined });
}

function reset() {
  date.value = "";
  channel.value = "LAUNE";
  submit();
}
</script>

<style scoped lang="scss">
.search-form {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  padding: 0.75rem;
  border: 1px solid #d9d9d9;
  background: #fff;
}

label {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.875rem;
}

input {
  border: 1px solid #c2c2c2;
  padding: 0.3rem 0.4rem;
}

.search-form__actions {
  display: flex;
  align-items: flex-end;
  gap: 0.5rem;
}

button {
  border: 1px solid #1f2a44;
  background: #1f2a44;
  color: #fff;
  padding: 0.4rem 0.6rem;
  cursor: pointer;
}

.secondary {
  background: #fff;
  color: #1f2a44;
}
</style>
