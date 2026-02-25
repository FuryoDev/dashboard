import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "dashboard",
    component: () => import("@/components/dashboard/Dashboard.vue"),
    meta: { title: "Vodoo" },
  },
  {
    path: "/vodmanuel",
    name: "vod-manuel",
    component: () => import("@/components/dashboard/Emission.vue"),
    meta: { title: "Vodoo: traitement manuelle" },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, _from, next) => {
  if (typeof to.meta.title === "string") {
    document.title = to.meta.title;
  }
  next();
});

export default router;
