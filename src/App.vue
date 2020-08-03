<template>
  <div class="app">
    <div class="container">
      <header class="header">
        <div class="header-body">
          <span class="header-brand">
            <span>Stacj</span>
            <img src="@/assets/trainlogo.png" alt="trainlogo" />
            <span>wnik</span>
          </span>

          <span class="header-info">
            <Clock />
            <div class="counter">
              <img src="@/assets/icon-dispatcher.svg" alt="icon dispatcher" />
              <span>{{stationCount}}</span>

              <span>{{trainCount}}</span>
              <img src="@/assets/icon-train.svg" alt="icon train" />
            </div>
          </span>
        </div>
      </header>

      <main class="app-main">
        <Loading v-if="connectionState == 0" />
        <Error v-else-if="connectionState == 1" :error="errorMessage" />
        <router-view v-else />
      </main>

      <footer class="app-footer flex">&copy; Spythere 2020</footer>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";
import { Action, Getter } from "vuex-class";

import { mapGetters, mapActions } from "vuex";

import Error from "@/components/states/Error.vue";
import Loading from "@/components/states/Loading.vue";
import Clock from "@/components/ui/Clock.vue";
import Options from "@/components/ui/Options.vue";

enum ConnState {
  Loading = 0,
  Error = 1,
  Connected = 2,
}

@Component({
  components: { Error, Loading, Clock, Options },
})
export default class App extends Vue {
  @Getter("getStations") stations;
  @Getter("getTrainCount") trainCount;
  @Getter("getStationCount") stationCount;

  @Action("initStations") initStations;

  errorMessage: string = "";
  connectionState: ConnState = ConnState.Loading;

  mounted() {
    this.initStations();

    this.$store.watch(
      (state, getters) => getters.getConnectionState,
      (state: ConnState) => (this.connectionState = state)
    );
  }
}
</script>

<style lang="scss">
@import "./styles/responsive.scss";
@import "./styles/variables.scss";
@import "./styles/global.scss";

.app {
  background: $bgCol;
  color: white;

  font-size: calc(1rem + 2.1vw);
}

.container {
  display: grid;
  grid-template-rows: auto 1fr auto;
  grid-template-columns: minmax(0, 1fr);

  min-width: 0;
  min-height: 100vh;
}

.header {
  background: #333;
  padding: 0.15em;

  display: flex;
  justify-content: center;

  &-brand {
    width: 100%;
    font-size: 1.1em;

    text-align: center;

    img {
      width: 0.8em;
    }
  }

  &-info {
    display: flex;
    justify-content: space-between;

    margin: 0 0.3em;
    font-size: 0.4em;
  }
}

.counter {
  display: flex;
  align-items: center;
  color: $accentCol;

  font-size: 1em;

  span {
    margin: 0 0.15em;
  }

  img {
    width: 1.35em;
  }
}

footer {
  background: #111;
  padding: 0.3rem;
  color: white;
  max-width: 100%;
  font-size: calc(0.5rem + 0.5vw);
}
</style>
