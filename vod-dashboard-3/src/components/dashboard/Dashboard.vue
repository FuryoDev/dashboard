<template>
  <section class="dashboard-page">
    <header class="page-header">
    </header>

    <SearchEmission
        :channels="emissionsStore.channels"
        :platforms="emissionsStore.platforms"
        :vod-types="emissionsStore.vodTypes"
        :initial-date="appStore.sharedDate"
        @search="onSearch"
        @date-change="appStore.setSharedDate"
        @bulk-clean="onBulkClean"
    />

    <p v-if="emissionsStore.error" class="error">[Dashboard] {{ emissionsStore.error }}</p>

    <EmissionsTable
        :emissions="emissionsStore.items"
        :loading="emissionsStore.loading"
        :selected="emissionsStore.selected"
        @update:selected="emissionsStore.setSelected"
        @focus="focusedEmission = $event"
    />

    <DetailOfferTranscodeEmission :emission="focusedEmission"/>
  </section>
</template>

<script setup lang="ts">
import {onMounted, ref} from "vue";
import SearchEmission from "@/components/dashboard/SearchEmission.vue";
import EmissionsTable from "@/components/dashboard/EmissionsTable.vue";
import DetailOfferTranscodeEmission from "@/components/dashboard/DetailOfferTranscodeEmission.vue";
import {useEmissionsStore} from "@/stores/emissions.store";
import {useAppStore} from "@/stores/app.store";
import type {Emission as EmissionType} from "@/types/domain";

const emissionsStore = useEmissionsStore();
const appStore = useAppStore();
const focusedEmission = ref<EmissionType | null>(null);

function toLocalIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

async function onSearch(payload: {
  date: Date;
  channels: string[];
  platforms: string[];
  statuses: string[];
  vodType?: string;
}) {
  appStore.setSharedDate(toLocalIsoDate(payload.date));
  await emissionsStore.fetchAll(payload);
}

async function onBulkClean() {
  emissionsStore.setToChangeStatus(emissionsStore.selected);
  await emissionsStore.bulkUpdateStatus(true);
  await emissionsStore.fetchAll();
}

onMounted(async () => {
  await emissionsStore.fetchFilterOptions();
  const [year, month, day] = appStore.sharedDate.split("-").map(Number);
  await emissionsStore.fetchAll({date: new Date(year, month - 1, day), channels: [], platforms: [], statuses: []});
});
</script>

<style scoped lang="scss">
.error {
  margin: 0.75rem 0 0;
  color: #9d1b1b;
}

.dashboard-page {
  background: transparent;
  padding-bottom: 1.5rem;
}

.page-header {
  margin-bottom: 1.0rem;

  h1 {
    margin: 0;
    color: #ffffff;
    font-size: 1.4rem;
  }

  p {
    margin: 0.25rem 0 0;
    color: #a9d3e4;
  }
}

</style>
