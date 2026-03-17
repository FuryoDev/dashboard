<template>
  <nav class="header-menu" aria-label="Navigation principale">
    <div class="header-menu__brand" aria-label="Logo VOD  placeholder">VOD</div>

    <div class="header-menu__links">
      <RouterLink to="/" class="header-menu__link">Dashboard</RouterLink>
      <RouterLink to="/vodmanuel" class="header-menu__link">Traitement manuel</RouterLink>
      <RouterLink to="/diva-monitoring" class="header-menu__link">Diva Monitoring</RouterLink>
    </div>
  </nav>
</template>

<script setup lang="ts">
import {RouterLink} from "vue-router";
</script>

<style scoped lang="scss">
.header-menu {
  flex: 1;
  display: grid;
  grid-template-columns: 160px 1fr;
  align-items: center;
  min-height: 30px;
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
  position: relative;
  text-decoration: none;
  color: #d4edf6;
  font-size: 1rem;
  font-weight: 500;
  transition: color 0.2s ease, transform 0.2s ease;

  &::after {
    content: "";
    position: absolute;
    left: 0;
    bottom: -0.25rem;
    width: 100%;
    height: 2px;
    border-radius: 999px;
    background: currentColor;
    transform: scaleX(0);
    transform-origin: center;
    transition: transform 0.2s ease;
  }

  &:hover {
    color: #8fe6fa;
    transform: translateY(-1px);

    &::after {
      transform: scaleX(1);
    }
  }

  &.router-link-active {
    color: #2ed0f2;

    &::after {
      transform: scaleX(1);
    }
  }
}
</style>
