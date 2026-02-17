import Vue from 'vue'
import VueRouter from 'vue-router'
import VodSwing from '../views/VodSwing.vue'
import DashBoard from '../components/DashBoard.vue'

Vue.use(VueRouter)

const router = new VueRouter({

  routes: [

    {
      path: '/',
      component: DashBoard,
      meta: { title: 'Vodoo' }
    },
    {
      path: '/vodmanuel',
      name: 'Vodswing',
      component: VodSwing,
      meta: { title: 'Vodoo: traitement manuelle' }
    }

  ],
  mode: 'history',
  base: '/'
});

router.beforeEach((to, from, next) => {
  document.title = to.meta.title;
  next();
});

export default router