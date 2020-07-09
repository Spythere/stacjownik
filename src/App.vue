<template>
  <div class="app">
    <div class="app-container">
      <header class="app-header flex flex-column">
        <div class="brand-name">
          <span>Stacj</span>
          <img src="@/assets/trainlogo.png" alt="trainlogo" />
          <span>wnik</span>
        </div>
        <span class="online">Scenerie online: {{stationCount}} | Maszyniści online: {{ trainCount }}</span>
      </header>

      <div class="app-bar flex flex-spaced">
        <div class="bar-content">
          <div class="bar-left">
            <Options />
          </div>

          <div class="bar-right"></div>
        </div>
      </div>

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
import Options from "@/components/ui/Options.vue";
// import ListFilter from "@/components/utils/ListFilter.vue";

export default Vue.extend({
  name: "App",
  components: { Error, Loading, Options },
  computed: mapGetters({
    stations: "getStations",
    trainCount: "getTrainCount",
    stationCount: "getStationCount"
  }),

  methods: {
    ...mapActions(["initStations"]),
    getStationList() {
      this.initStations()
        .then(() => (this.connectionState = 2))
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

html {
  scroll-behavior: smooth;
}

body {
  width: 100%;
  margin: 0;
  font-family: "Lato", sans-serif;
}

button,
input {
  font-family: "Lato", sans-serif;
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
    font-weight: bold;
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
  width: 100%;
  overflow: hidden;

  &-container {
    display: grid;
    grid-template-rows: auto auto 1fr auto;
    grid-template-columns: minmax(0, 1fr);

    min-width: 0;
    min-height: 100vh;
  }

  &-header {
    background: #333;
    padding: 0.4rem;

    & > .brand-name {
      font-size: calc(1rem + 3.5vw);

      img {
        width: calc(1rem + 2.3vw);
      }
    }

    .online {
      font-size: calc(0.3rem + 0.8vw);
    }
  }

  &-bar {
    position: sticky;
    font-size: calc(0.8rem + 0.2vw);
    top: 0;
    background: #222;
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
