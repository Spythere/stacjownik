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

      <div class="app-info"></div>

      <main class="app-main">
        <Loading v-if="connectionState == 0" />
        <Error v-else-if="connectionState == 1" :error="errorMessage" />
        <router-view v-else />
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

export default Vue.extend({
  name: "App",
  components: { Error, Loading },
  computed: mapGetters({ stations: "getStations" }),

  methods: {
    ...mapActions(["fetchStations"])
  },
  data: () => ({
    errorMessage: "",
    connectionState: 0
  }),

  mounted() {
    this.fetchStations()
      .then(result => console.log(result))
      .catch(err => {
        this.connectionState = 1;
        this.errorMessage = err.message;
      });
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

ul {
  list-style: none;
  padding: 0;
}

.hour {
  padding: 0.4em;
  border-radius: 1rem;

  &.ending {
    background-color: $accentCol;
    color: black;
    font-size: 0.9em;
  }

  &.no-limit {
    // background-color: #57ae00;
    font-size: 0.85em;
  }

  &.not-signed {
    background-color: $accent2Col;
    font-size: 0.8em;
  }

  &.unavailable {
    background-color: $accent2Col;
    font-size: 0.9em;
  }
}

.text {
  &--title {
    color: #fdc62f;
    font-size: 1em;
  }

  &--content {
    font-size: 0.8em;
  }
}

.app {
  &-container {
    display: grid;
    grid-template-rows: auto auto 1fr auto;
    grid-template-columns: minmax(0, 1fr);

    min-height: 100vh;
  }

  &-header {
    display: flex;
    justify-content: center;
    align-items: center;

    flex-direction: column;
    background: #333;

    color: white;

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

    padding: 0.4rem;
  }

  &-main {
    display: flex;
    justify-content: center;
    align-items: center;
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
