<template>
  <div class="app">
    <div class="app-container">
      <header class="app-header flex flex-column">
        <div class="brand-name">
          <span>Stacj</span>
          <img src="@/assets/trainlogo.png" alt="trainlogo" />
          <span>wnik</span>
        </div>

        <Clock />
      </header>

      <AppBar :stationCount="stationCount" :trainCount="trainCount" />

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
import AppBar from "@/components/ui/AppBar.vue";

enum ConnState {
    Loading = 0,
    Error = 1,
    Connected = 2
}

@Component({
  components: { Error, Loading, Clock, AppBar }
})
export default class App extends Vue {
  @Getter('getStations') stations
  @Getter('getTrainCount') trainCount
  @Getter("getStationCount") stationCount

  @Action("initStations") initStations

  errorMessage: string = "";
  connectionState: ConnState = ConnState.Loading;
  
  mounted() {
    this.initStations();

    this.$store.watch((state, getters) => getters.getConnectionState, (state: ConnState) => this.connectionState = state);
  }

}
</script>

<style lang="scss">
@import "./styles/responsive.scss";
@import "./styles/variables.scss";

:root {
  font-size: 16px;
}

::-webkit-scrollbar {
  width: 0.5rem;
  height: 0.5rem;

  &-track {
    background: #222;
  }

  &-thumb {
    border-radius: 1rem;
    background: #777;
  }
}

html {
  scroll-behavior: smooth;
}

body {
  width: 100%;
  margin: 0;
  font-family: "Muli", sans-serif;
}

button,
input {
  font-family: "Muli", sans-serif;
}

input {
  border: 1px solid white;
  background: none;
  color: white;
  font-size: 1em;

  padding: 0.15em;
  margin: 0.2em;

  max-width: 55px;

  &::placeholder {
    color: #bebebe;
  }
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

.status {
  border-radius: 1.3rem;
  font-weight: 500;

  font-size: .95em;
  padding: 0.25em 0.4em;

  background-color: #00be19;

  &.free {
    background-color: #8a8a8a;
    font-size: 0.95em;
  }

  &.ending {
    background-color: $accentCol;
    color: black;
    font-size: 0.9em;
  }

  &.no-limit {
    background-color: #0077ae;
    font-size: 0.9em;
  }

  &.not-signed {
    background-color: $accent2Col;
    font-size: 0.8em;
  }

  &.unavailable {
    background-color: $accent2Col;
    font-size: 0.9em;
  }

  &.brb {
    background-color: $accentCol;
    color: black;
    font-size: 0.95em;
  }

  &.no-space {
    background-color: #222;
    color: white;
    font-size: 0.85em;
  }
}

.default-station {
  font-weight: bold;
  color: $accentCol;
}

.card {
  display: flex;
  flex-direction: column;

  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 2;

  overflow: auto;
  // background: #474747;
  background: #262a2e;

  box-shadow: 0 0 15px 5px #474747;

  width: 75%;
  max-width: 750px;
  max-height: 95%;

  // font-size: calc(0.6rem + 0.5vw);
  font-size: calc(0.55rem + 0.35vw);

  @include smallScreen {
    width: 95%;
  }

  &-exit {
    position: absolute;
    top: 0;
    right: 0;
    margin: 0.8em;

    img {
      width: 1.5em;
    }

    cursor: pointer;
  }

  // &-content {
  //   display: grid;
  //   grid-template-areas: "dispatcher dispatcher" "rating rating" "hours hours" "users spawns";
  //   grid-template-columns: repeat(2, minmax(0, 1fr));

  //   align-items: center;
  //   text-align: center;
  //   padding: 1em;

  //   & > div {
  //     text-align: center;
  //     padding: 0.2em;
  //   }
  // }

  // &-upper {
  //   background: #959595;
  //   text-align: center;
  //   padding: 0.2em;
  // }
}

.button {
  display: flex;
  align-items: center;

  background: #333;
  border: none;

  color: #e0e0e0;
  font-size: 0.9em;

  outline: none;
  padding: 0.35em;
  cursor: pointer;

  transition: all 0.3s;

  &.open {
    color: $accentCol;
    border: none;
  }

  &:hover {
    background: rgba(#e0e0e0, 0.4);
  }
}

a {
  color: white;
  text-decoration: none;

  transition: color 0.3s;

  &:hover,
  &:focus {
    color: $accentCol;
    border: none;
    outline: none;
  }

  &:focus {
    text-decoration: underline;
  }
}

ul {
  padding: 0;
  list-style: none;
}

.flex {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 100%;

  &-spaced {
    justify-content: space-between;
  }

  &-column {
    flex-direction: column;
  }
}

.app {
  background: $bgCol;
  color: white;

  font-size: calc(1rem + 2.1vw);

  &-container {
    display: grid;
    grid-template-rows: auto auto 1fr auto;
    grid-template-columns: minmax(0, 1fr);

    min-width: 0;
    min-height: 100vh;
  }

  &-header {
    background: #333;
    padding: 0.1em;

    & > .brand-name {
      font-size: 1.1em;

      img {
        width: 0.8em;
      }
    }

    .online {
      font-size: 0.35em;
    }
  }
}

.counter {
  display: flex;
  align-items: center;
  color: $accentCol;

  margin: 0 0.3em;

  img {
    width: 1.4em;
    margin: 0 0.1em;
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
