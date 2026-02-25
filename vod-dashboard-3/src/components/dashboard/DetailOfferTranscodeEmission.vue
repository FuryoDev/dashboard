<template>
  <section class="details">
    <h3>Détails émission</h3>
    <p v-if="!emission">Sélectionnez une émission pour voir ses détails.</p>

    <template v-else>
      <dl>
        <dt>ID record</dt>
        <dd>{{ emission.idRecord }}</dd>

        <dt>Titre</dt>
        <dd>{{ emission.title }}</dd>

        <dt>Type VOD</dt>
        <dd>{{ emission.vodType }}</dd>
      </dl>

      <h4>Offres plateforme</h4>
      <ul v-if="platformOffers.length">
        <li v-for="offer in platformOffers" :key="String(offer.recordvodxmlid ?? offer.offerName)">
          {{ offer.offerName }}
        </li>
      </ul>
      <p v-else>Aucune offre associée.</p>
    </template>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { Emission, PlatformOffer } from "@/types/domain";

const props = defineProps<{
  emission: Emission | null;
}>();

const platformOffers = computed<PlatformOffer[]>(() => props.emission?.plateformOffers ?? []);
</script>

<style scoped lang="scss">
.details {
  margin-top: 1rem;
  background: #fff;
  border: 1px solid #d9d9d9;
  padding: 0.75rem;
}

h3,
h4,
p {
  margin: 0 0 0.5rem;
}

dl {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 0.25rem 0.5rem;
  margin: 0 0 0.75rem;
}

dt {
  font-weight: 600;
}

ul {
  margin: 0;
  padding-left: 1rem;
}
</style>
