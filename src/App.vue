<template>
  <div class="app">
    <div class="app-container">
      <header class="app-header">
        <div class="brand-name">
          <span>Stacj</span>
          <img src="@/assets/trainlogo.png" alt="trainlogo" />
          <span>wnik</span>
        </div>
      </header>

      <div class="app-info">
        <span>Scenerie online: {{stations.length}} | Maszyniści online: {{ trainCount }}</span>
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
// import ListFilter from "@/components/utils/ListFilter.vue";

export default Vue.extend({
  name: "App",
  components: { Error, Loading },
  computed: mapGetters({
    stations: "getStations",
    trainCount: "getTrainCount"
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

    & > .brand-name {
      font-size: calc(1rem + 3.5vw);

      img {
        width: calc(1rem + 2.3vw);
      }
    }
  }

  &-info {
    display: flex;
    justify-content: center;
    align-items: center;

    font-size: calc(0.8rem + 0.2vw);

    background: #222;

    padding: 0.3rem;
  }

  &-main {
    display: flex;
    justify-content: center;
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
