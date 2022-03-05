import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'StationsView',
    component: () => import("@/views/StationsView.vue")
  },
  {
    path: "/trains",
    name: "TrainsView",
    component: () => import("@/views/TrainsView.vue"),
    props: route => ({ train: route.query.train })
  },
  {
    path: "/scenery",
    name: "SceneryView",
    component: () => import("@/views/SceneryView.vue"),
    props: true
  },
  {
    path: "/journal",
    name: "JournalView",
    component: () => import("@/views/JournalView.vue"),
  },
  {
    path: '/:catchAll(.*)',
    redirect: "/"
  }
]

const router = createRouter({
  scrollBehavior(to, from) {    
    if (to.name == "SceneryView")
      return { el: `.app_main` };
    
    if (from.name == "SceneryView" && to.name == "StationsView")
      return { el: `.last-selected`, top: 20 }

  },
  history: createWebHistory(),
  routes,
})

export default router
