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
import Vue from "vue";
import { mapGetters, mapActions } from "vuex";

import Error from "@/components/states/Error.vue";
import Loading from "@/components/states/Loading.vue";
import Clock from "@/components/ui/Clock.vue";
import AppBar from "@/components/ui/AppBar.vue";
// import ListFilter from "@/components/utils/ListFilter.vue";

export default Vue.extend({
  name: "App",
  components: { Error, Loading, Clock, AppBar },
  computed: mapGetters({
    stations: "getStations",
    trainCount: "getTrainCount",
    stationCount: "getStationCount"
  }),

  methods: {
    ...mapActions(["initStations"]),
    getStationList() {
      this.initStations()
        .then(result => (this.connectionState = 2))
        .catch(err => {
          this.connectionState = 1;
          this.errorMessage = err.message;
        });
    }
  },
  data: () => ({
    errorMessage: "",
    connectionState: 0
  }),

  mounted() {
    this.getStationList();
  }
});
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
