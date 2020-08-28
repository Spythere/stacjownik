import Vue from "vue";
import Vuex from "vuex";

import StationsModule from "@/store/modules/stationsModule";
import TrainsModule from "@/store/modules/trainsModule";
Vue.use(Vuex);
const store = new Vuex.Store({
  modules: {
    StationsModule,
    TrainsModule,
  },
});
export default store;
