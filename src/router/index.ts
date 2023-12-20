import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import JournalDispatchersVue from '../views/JournalDispatchers.vue';
import JournalTimetablesVue from '../views/JournalTimetables.vue';

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
      trainId: route.query.trainId
    })
  },
  {
    path: '/scenery',
    name: 'SceneryView',
    component: () => import('../views/SceneryView.vue'),
    props: (route) => ({
      region: route.query.region,
      station: route.query.station
    })
  },
  {
    path: '/journal',
    redirect: '/journal/timetables'
  },
  {
    path: '/journal/timetables',
    name: 'JournalTimetables',
    component: JournalTimetablesVue
  },
  {
    path: '/journal/dispatchers',
    name: 'JournalDispatchers',
    component: JournalDispatchersVue
  },
  {
    path: '/:catchAll(.*)',
    redirect: '/'
  }
];

const router = createRouter({
  scrollBehavior(to, from, savedPosition) {
    if (to.name == 'SceneryView' && from.name !== to.name && from.query['view'] === undefined)
      return { el: `.app_main` };

    if (savedPosition) return savedPosition;
  },
  history: createWebHistory(),
  routes
});

export default router;
