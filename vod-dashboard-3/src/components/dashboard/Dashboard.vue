<template>
  <section>
    <SearchEmission
      :channels="emissionsStore.channels"
      :platforms="emissionsStore.platforms"
      :vod-types="emissionsStore.vodTypes"
      @search="onSearch"
      @bulk-clean="onBulkClean"
    />

    <p v-if="emissionsStore.error" class="error">{{ emissionsStore.error }}</p>

    <EmissionsTable
      :emissions="emissionsStore.items"
      :loading="emissionsStore.loading"
      :selected="emissionsStore.selected"
      @update:selected="emissionsStore.setSelected"
      @focus="focusedEmission = $event"
    />

    <DetailOfferTranscodeEmission :emission="focusedEmission" />
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import SearchEmission from "@/components/dashboard/SearchEmission.vue";
import EmissionsTable from "@/components/dashboard/EmissionsTable.vue";
import DetailOfferTranscodeEmission from "@/components/dashboard/DetailOfferTranscodeEmission.vue";
import { useEmissionsStore } from "@/stores/emissions.store";
import type { Emission as EmissionType } from "@/types/domain";

const emissionsStore = useEmissionsStore();
const focusedEmission = ref<EmissionType | null>(null);

async function onSearch(payload: {
  date: Date;
  channels: string[];
  platforms: string[];
  statuses: string[];
  vodType?: string;
}) {
  await emissionsStore.fetchAll(payload);
}

async function onBulkClean() {
  emissionsStore.setToChangeStatus(emissionsStore.selected);
  await emissionsStore.bulkUpdateStatus(true);
  await emissionsStore.fetchAll();
}

onMounted(async () => {
  await emissionsStore.fetchFilterOptions();
  await emissionsStore.fetchAll({ date: new Date(), channels: [], platforms: [], statuses: [] });
});
</script>

<style scoped lang="scss">
.error {
  margin: 0.75rem 0 0;
  color: #9d1b1b;
}
</style>
