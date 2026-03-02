<template>
  <nav class="header-menu" aria-label="Navigation principale">
    <div class="header-menu__brand" aria-label="Logo VOD  placeholder">VOD</div>

    <div class="header-menu__links">
      <RouterLink to="/" class="header-menu__link">Dashboard</RouterLink>
      <RouterLink to="/vodmanuel" class="header-menu__link">Traitement manuel</RouterLink>
      <a :href="env.linkDivaMonitoring" target="_blank" rel="noreferrer" class="header-menu__link">Diva Monitoring</a>
    </div>
  </nav>
</template>

<script setup lang="ts">
import {RouterLink} from "vue-router";
import {env} from "@/config/env";
</script>

<style scoped lang="scss">
.header-menu {
  flex: 1;
  display: grid;
  grid-template-columns: 160px 1fr;
  align-items: center;
  min-height: 52px;
}

.header-menu__brand {
  width: 110px;
  text-align: center;
  color: #ffffff;
  border: 1px dashed rgba(255, 255, 255, 0.55);
  border-radius: 999px;
  font-weight: 700;
  letter-spacing: 0.08em;
  padding: 0.3rem 0.55rem;
  font-size: 0.85rem;
}

.header-menu__links {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1.4rem;
}

.header-menu__link {
  text-decoration: none;
  color: #d4edf6;
  font-size: 1rem;
  font-weight: 500;

  &.router-link-active {
    color: #2ed0f2;
  }
}
</style>
