import { createRouter, createWebHistory } from 'vue-router'
import VodSwing from '../views/VodSwing.vue'
import DashBoard from '../components/DashBoard.vue'

const routes = [
  {
    path: '/',
    component: DashBoard,
    meta: { title: 'Vodoo' },
  },
  {
    path: '/vodmanuel',
    name: 'Vodswing',
    component: VodSwing,
    meta: { title: 'Vodoo: traitement manuelle' },
  },
]

const router = createRouter({
  history: createWebHistory('/'),
  routes,
})

router.beforeEach((to, from, next) => {
  document.title = to.meta.title
  next()
})

export default router
