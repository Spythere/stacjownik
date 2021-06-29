import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'

import StationsView from "@/views/StationsView.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'StationsView',
    component: StationsView
  },
  {
    path: "/trains",
    name: "TrainsView",
    component:  () => import("@/views/TrainsView.vue"),
    props: true,

  },
  {
    path: "/scenery",
    name: "SceneryView",
    component: () => import("@/views/SceneryView.vue"),
    props: true
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router
