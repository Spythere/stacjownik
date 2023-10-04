import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import JournalDispatchersVue from '../views/JournalDispatchers.vue';
import JournalTimetablesVue from '../views/JournalTimetables.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'StationsView',
    component: () => import('../views/StationsView.vue')
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
    component: () => import('../views/SceneryView.vue')
  },
  {
    path: '/journal',
    redirect: '/journal/timetables'
  },
  {
    path: '/journal/timetables',
    name: 'JournalTimetables',
    component: JournalTimetablesVue,
    props: (route) => ({
      trainNo: route.query.trainNo,
      driverName: route.query.driverName,
      timetableId: route.query.timetableId
    })
  },
  {
    path: '/journal/dispatchers',
    name: 'JournalDispatchers',
    component: JournalDispatchersVue,
    props: (route) => ({
      sceneryName: route.query.sceneryName,
      dispatcherName: route.query.dispatcherName
    })
  },
  {
    path: '/:catchAll(.*)',
    redirect: '/'
  }
];

const router = createRouter({
  scrollBehavior(to, from) {
    if (to.name == 'SceneryView' && from.name) return { el: `.app_main` };

    // if (from.name == 'SceneryView' && to.name == 'StationsView') return { el: `.last-selected`, top: 20 };
  },
  history: createWebHistory(),
  routes
});

export default router;
