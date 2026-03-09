<template>
  <div class="app-shell">
    <header class="app-shell__topbar">
      <HeaderMenu/>
      <p class="app-shell__user"><span class="app-shell__user-icon" aria-hidden="true">👤</span>{{ userLabel }}</p>
    </header>

    <main class="app-shell__content">
      <RouterView/>
    </main>
  </div>
</template>

<script setup lang="ts">
import {computed, onMounted, onUnmounted} from "vue";
import {RouterView} from "vue-router";
import HeaderMenu from "@/components/common/HeaderMenu.vue";
import {useUserStore} from "@/stores/user.store";
import {useHttp} from "@/composables/useHttp";
import type {User} from "@/types/auth";

const userStore = useUserStore();
const http = useHttp();

const userLabel = computed(() => {
  const user = userStore.user;
  if (!user) return "Utilisateur non connecté";
  return `${user.firstname ?? ""} ${user.lastname ?? ""}`.trim();
});

async function fetchUser() {
  const {data} = await http.get<User>("notification/service/user");
  userStore.setUser(data);
}

let userTimer: ReturnType<typeof setInterval> | null = null;

onMounted(async () => {
  try {
    await fetchUser();
  } catch (error) {
    console.error("Impossible de charger l'utilisateur", error);
  }

  userTimer = setInterval(() => {
    void fetchUser().catch((error) => console.error("Rafraîchissement utilisateur en erreur", error));
  }, 50 * 60 * 1000);
});

onUnmounted(() => {
  if (userTimer) clearInterval(userTimer);
});
</script>

<style scoped lang="scss">
.app-shell {
  min-height: 80vh;
  background: linear-gradient(135deg, #08253f 0%, #0c4f68 100%);
  color: #1d1d1d;
}

.app-shell__topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 0.8rem 1.2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  background: linear-gradient(90deg, #0b2038 0%, #0f5b77 100%);
}

.app-shell__user {
  margin: 0;
  font-size: 0.92rem;
  color: #d4edf6;
  font-weight: 600;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.app-shell__user-icon {
  font-size: 0.95rem;
  line-height: 1;
}

.app-shell__content {
  padding: 1rem;
}
</style>
