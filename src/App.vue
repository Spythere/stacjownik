<template>
  <div class="app">
    <div class="app_container">
      <header class="app_header">
        <div class="header_body">
          <span class="header_brand">
            <span>Stacj</span>
            <img src="@/assets/trainlogo.png" alt="trainlogo" />
            <span>wnik</span>
          </span>

          <span class="header_info">
            <Clock />
            <div class="info_counter">
              <img src="@/assets/icon-dispatcher.svg" alt="icon dispatcher" />
              <span>{{ data.stationCount }}</span>

              <span>{{ data.trainCount }}</span>
              <img src="@/assets/icon-train.svg" alt="icon train" />
            </div>
          </span>

          <span class="header_links">
            <router-link class="route" active-class="route-active" to="/" exact>SCENERIE</router-link>/
            <router-link class="route" active-class="route-active" to="/trains">POCIĄGI</router-link>
          </span>
        </div>
      </header>

      <main class="app_main">
        <transition name="view-anim" mode="out-in">
          <keep-alive>
            <router-view />
          </keep-alive>
        </transition>
      </main>

      <footer class="app_footer flex">&copy; Spythere 2020</footer>

      <transition name="warning-anim" mode="out-in" tag="div">
        <span :key="data.dataConnectionStatus || -1" class="warning" :class="dataStatusClass">
          <span v-if="data.dataConnectionStatus == 0">Pobieranie danych...</span>

          <span v-if="data.dataConnectionStatus == 1">Brak odpowiedzi ze strony serwera!</span>
        </span>
      </transition>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";
import { Action, Getter } from "vuex-class";

import { mapGetters, mapActions } from "vuex";

import Clock from "@/components/App/Clock.vue";

@Component({
  components: { Clock },
})
export default class App extends Vue {
  @Action("synchronizeData") synchronizeData;
  @Getter("getAllData") data;

  get dataStatusClass() {
    if (this.data.dataConnectionStatus == 0) return "loading";
    if (this.data.dataConnectionStatus == 1) return "error";

    return "";
  }

  mounted() {
    this.synchronizeData();
  }
}
</script>

<style lang="scss">
@import "./styles/responsive.scss";
@import "./styles/variables.scss";
@import "./styles/global.scss";
@import "./styles/scenery_status.scss";

// VUE ROUTE CHANGE ANIMATION
.view-anim {
  &-enter {
    opacity: 0.02;
  }

  &-leave-to {
    opacity: 0.02;
  }

  &-enter-active,
  &-leave-active {
    transition: all $animDuration $animType;
    min-height: 100%;
  }
}

// WARNING MESSAGE
.warning {
  display: flex;
  justify-content: center;
  align-items: center;

  position: fixed;
  bottom: 0;

  width: 100%;

  font-size: calc(0.7rem + 0.5vw);

  padding: 0.5em;

  &.loading {
    background: #cc8b21;
  }

  &.error {
    background: firebrick;
  }

  // WARNING SHOW & HIDE ANIMATION
  &-anim {
    &-enter-active,
    &-leave-active {
      transition: all $animDuration * 3 $animType;
    }

    &-enter,
    &-leave-to {
      opacity: 0;
    }
  }
}

.route {
  margin: 0 0.2em;

  &-active {
    color: $accentCol;
    font-weight: bold;
  }
}

// APP
.app {
  background: $bgCol;
  color: white;

  font-size: calc(1.1rem + 2.1vw);

  overflow: hidden;

  @include smallScreen() {
    font-size: 2.5rem;
  }
}

// CONTAINER
.app_container {
  display: grid;
  grid-template-rows: auto 1fr auto;
  grid-template-columns: minmax(0, 1fr);

  min-width: 0;
  min-height: 100vh;
}

// HEADER
.app_header {
  background: $primaryCol;
  padding: 0.15em;

  border-radius: 0 0 0.7em 0.7em;

  display: flex;
  justify-content: center;
}

.header_brand {
  width: 100%;
  font-size: 1.1em;

  text-align: center;

  img {
    width: 0.8em;
  }
}

.header_info {
  display: flex;
  justify-content: space-between;

  margin: 0 0.3em;
  padding: 0.2em;
  font-size: 0.35em;
}

.header_links {
  display: flex;
  justify-content: center;

  border-radius: 0.7em;

  padding: 0.2em;
  font-size: 0.35em;
}

// MAIN
.app_main {
}

// COUNTER
.info_counter {
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

// FOOTER
.app_footer {
  background: #111;
  padding: 0.3rem;
  color: white;
  max-width: 100%;
  font-size: calc(0.5rem + 0.5vw);

  flex-direction: column;

  span {
    margin: 0.2rem;

    &:nth-child(2) {
      color: #888;
      font-size: 0.95em;
    }
  }
}
</style>
