import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

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
    name: "TimetableHistoryView",
    component: () => import("@/views/TimetableHistoryView.vue"),
  },
  {
    path: '/:catchAll(.*)',
    redirect: "/"
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
