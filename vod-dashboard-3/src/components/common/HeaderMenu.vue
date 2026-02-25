<template>
  <nav class="header-menu">
    <RouterLink to="/" class="header-menu__link">Dashboard</RouterLink>
    <RouterLink to="/vodmanuel" class="header-menu__link">Traitement manuel</RouterLink>
    <RouterLink to="/accueil" class="header-menu__link">Accueil</RouterLink>
  </nav>
</template>

<script setup lang="ts">
import { RouterLink } from "vue-router";
</script>

<style scoped lang="scss">
.header-menu {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-menu__link {
  text-decoration: none;
  color: #1f2a44;
  font-size: 0.9rem;

  &.router-link-active {
    font-weight: 600;
    text-decoration: underline;
  }
}
</style>
