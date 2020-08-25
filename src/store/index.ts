import Vue from "vue";
import Vuex from "vuex";

import Store from "@/store/modules/store";
import TrainsModule from "@/store/modules/trains";
Vue.use(Vuex);
const store = new Vuex.Store({
  modules: {
    Store,
    TrainsModule,
  },
});
export default store;
