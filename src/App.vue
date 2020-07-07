<template>
  <div class="app">
    <div class="app-container">
      <header class="app-header">
        <div class="brand-name">
          <span>Stacj</span>
          <img src="@/assets/trainlogo.png" alt="trainlogo" />
          <span>wnik</span>
        </div>
        <span class="online">Scenerie online: {{stationCount}} | Maszyniści online: {{ trainCount }}</span>
      </header>

      <div class="app-bar">
        <div class="bar-left">
          <Options />
        </div>

        <div class="bar-right">
          <!-- <div class="last-update">Ostatnie zmiany</div> -->
        </div>
      </div>

      <main class="app-main">
        <Loading v-if="connectionState == 0" />
        <Error v-else-if="connectionState == 1" :error="errorMessage" />
        <router-view v-else />
        <!-- <router-view /> -->
      </main>

      <footer class="app-footer">&copy; Spythere 2020</footer>
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
    ...mapActions(["fetchStations"]),
    getStationList() {
      this.fetchStations()
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

    setInterval(this.getStationList, 5000);
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
  margin: 0;
  font-family: "Lato", sans-serif;
  background: $bgCol;
  width: 100%;
  min-height: 100vh;
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

.app {
  color: white;
  overflow: hidden;

  &-container {
    display: grid;
    grid-template-rows: auto auto 1fr auto;
    grid-template-columns: minmax(0, 1fr);

    min-width: 0;
    min-height: 100vh;
  }

  &-header {
    display: flex;
    justify-content: center;
    align-items: center;

    flex-direction: column;
    background: #333;
    padding: 0.4rem;

    & > .brand-name {
      font-size: calc(1rem + 3.5vw);

      img {
        width: calc(1rem + 2.3vw);
      }
    }

    .online {
      font-size: calc(0.6rem + 0.4vw);
    }
  }

  &-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;

    font-size: calc(0.8rem + 0.2vw);

    background: #222;
  }
}

footer {
  background: #111;
  padding: 0.3rem;

  color: white;

  display: flex;
  justify-content: center;
  align-items: center;

  max-width: 100%;

  font-size: calc(0.5rem + 0.5vw);
}
</style>
