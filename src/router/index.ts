import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'StationsView',
    component: () => import('../views/StationsView.vue'),
    props: (route) => ({
      region: route.query.region
    })
  },
  {
    path: '/trains',
    name: 'TrainsView',
    component: () => import('../views/TrainsView.vue'),
    props: (route) => ({
      train: route.query.train,
      driver: route.query.driver,
      trainId: route.query.trainId,
      region: route.query.region
    })
  },
  {
    path: '/driver',
    name: 'DriverView',
    component: () => import('../views/DriverView.vue'),
    props: (route) => ({
      trainId: route.query.trainId,
      modalId: route.query.modalId
    })
  },
  {
    path: '/scenery',
    name: 'SceneryView',
    component: () => import('../views/SceneryView.vue'),
    props: (route) => ({
      region: route.query.region,
      station: route.query.station
    }),
    beforeEnter: (to, from) => {
      to.meta['prevPath'] = from.fullPath;
    }
  },
  {
    path: '/journal',
    redirect: '/journal/timetables'
  },
  {
    path: '/journal/timetables',
    name: 'JournalTimetables',
    component: () => import('../views/JournalTimetables.vue'),
    props: (route) => ({
      region: route.query.region
    })
  },
  {
    path: '/journal/dispatchers',
    name: 'JournalDispatchers',
    component: () => import('../views/JournalDispatchers.vue'),
    props: (route) => ({
      region: route.query.region
    })
  },
  {
    path: '/player/:id',
    name: 'PlayerInfoView',
    component: () => import('../views/PlayerInfoView.vue'),

    props: (route) => ({
      id: route.query.id
    })
  },
  {
    path: '/:catchAll(.*)',
    redirect: '/'
  }
];

const router = createRouter({
  scrollBehavior(to, from, savedPosition) {
    if (
      (to.name == 'SceneryView' || to.name == 'DriverView') &&
      from.name !== to.name &&
      from.query['view'] === undefined &&
      !savedPosition
    )
      return { el: `.app_main`, behavior: 'instant', top: -13 };

    if (savedPosition) return savedPosition;
  },
  history: createWebHistory(),
  routes
});

export default router;
