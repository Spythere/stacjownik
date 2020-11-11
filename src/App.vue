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
              <span>{{ data.stationCount }}</span>

              <span>{{ data.trainCount }}</span>
              <img src="@/assets/icon-train.svg" alt="icon train" />
            </div>
          </span>

          <span class="header-links">
            <router-link class="route" active-class="route-active" to="/" exact
              >SCENERIE</router-link
            >/
            <router-link class="route" active-class="route-active" to="/trains"
              >POCIĄGI</router-link
            >
          </span>
        </div>
      </header>

      <main class="app-main">
        <transition name="view-anim" mode="out-in">
          <keep-alive>
            <router-view />
          </keep-alive>
        </transition>
      </main>

      <footer class="app-footer flex">&copy; Spythere 2020</footer>

      <transition name="message-anim" mode="out-in">
        <span :key="data.dataConnectionStatus">
          <div class="message loading" v-if="data.dataConnectionStatus == 0">
            Pobieranie danych...
          </div>

          <div class="message error" v-if="data.dataConnectionStatus == 1">
            <img :src="ErrorIcon" alt="Error" />
            Brak odpowiedzi ze strony serwera!
          </div>
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

// import stationData from "@/data/stations.json";


@Component({
  components: { Clock },
})
export default class App extends Vue {
  ErrorIcon = require("@/assets/icon-error.svg");

  @Action("synchronizeData") synchronizeData;
  @Getter("getAllData") data;

  mounted() {
    this.synchronizeData();

    // stationData
    //   .filter(data => data.stationName.length > 12 || (data.stops && data.stops.some(stop => stop.length > 12)))
    //   .forEach(data => {
    //     console.log(data.stationName, data.stationName.length);

    //     data.stops?.forEach(stop => {
    //       console.log(stop, stop.length);
    //     })

    //     console.log("-----");
    //   });

  }
}
</script>

<style lang="scss">
@import "./styles/responsive.scss";
@import "./styles/variables.scss";
@import "./styles/global.scss";
@import "./styles/scenery_status.scss";

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

.message {
  &-anim {
    &-enter-active,
    &-leave-active {
      transition: all $animDuration $animType;
    }

    &-enter {
      transform: translateY(100%);
    }

    &-leave-to {
      transform: translateY(0);
    }
  }

  display: flex;
  justify-content: center;
  align-items: center;

  position: fixed;
  bottom: 0;

  width: 100%;

  font-size: calc(0.5rem + 0.5vw);
  padding: 0.5rem;

  img {
    width: 1.5em;
    margin: 0 0.5em;
  }

  &.loading {
    background: #cc8b21;
  }

  &.error {
    background: firebrick;
  }
}

.route {
  margin: 0 0.2em;

  &-active {
    color: $accentCol;
    font-weight: bold;
  }
}

.app {
  background: $bgCol;
  color: white;

  font-size: calc(1.1rem + 2.1vw);

  @include smallScreen() {
    font-size: 2.5rem;
  }
}

.container {
  display: grid;
  grid-template-rows: auto 1fr auto;
  grid-template-columns: minmax(0, 1fr);

  min-width: 0;
  min-height: 100vh;
}

.header {
  background: $primaryCol;
  padding: 0.15em;

  border-radius: 0 0 0.7em 0.7em;

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
    padding: 0.2em;
    font-size: 0.35em;
  }

  &-links {
    display: flex;
    justify-content: center;

    border-radius: 0.7em;

    padding: 0.2em;
    font-size: 0.35em;
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
