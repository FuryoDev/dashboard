<template>
  <div class="app-shell">
    <header class="app-shell__topbar">
      <HeaderMenu />
      <p class="app-shell__user">{{ userLabel }}</p>
    </header>

    <main class="app-shell__content">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from "vue";
import { RouterView } from "vue-router";
import HeaderMenu from "@/components/common/HeaderMenu.vue";
import { useUserStore } from "@/stores/user.store";
import { useHttp } from "@/composables/useHttp";
import type { User } from "@/types/auth";

const userStore = useUserStore();
const http = useHttp();

const userLabel = computed(() => {
  const user = userStore.user;
  if (!user) return "Utilisateur non connecté";
  return `${user.firstname ?? ""} ${user.lastname ?? ""}`.trim();
});

async function fetchUser() {
  const { data } = await http.get<User>("notification/service/user");
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
  min-height: 100vh;
  background: #f5f5f5;
  color: #1d1d1d;
}

.app-shell__topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #d9d9d9;
  background: #fff;
}

.app-shell__user {
  margin: 0;
  font-size: 0.875rem;
  color: #4a4a4a;
}

.app-shell__content {
  padding: 1rem;
}
</style>
