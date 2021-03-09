<template>
  <div class="app">
    <UpdateModal
      :currentVersion="VERSION"
      @toggleUpdateModal="toggleUpdateModal"
      v-if="updateModalVisible"
    />

    <div class="app_container">
      <header class="app_header">
        <div class="header_body">
          <span class="header_brand">
            <span>
              <span>Stacj</span>
              <img src="@/assets/trainlogo.png" alt="trainlogo" />
              <span>wnik</span>
            </span>

            <span class="brand_lang">
              <span
                class="lang pl"
                @click="changeLang('en')"
                :class="{ current: currentLang == 'pl' }"
                v-if="currentLang == 'pl'"
              >
                <img :src="iconPL" alt="icon-pl" />
              </span>

              <span
                class="lang en"
                @click="changeLang('pl')"
                :class="{ current: currentLang == 'en' }"
                v-if="currentLang == 'en'"
              >
                <img :src="iconEN" alt="icon-en" />
              </span>
            </span>
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
            <router-link class="route" active-class="route-active" to="/" exact
              >{{ $t("app.sceneries") }}
            </router-link>
            /
            <router-link class="route" active-class="route-active" to="/trains"
              >{{ $t("app.trains") }}
            </router-link>

            <!-- <router-link
              class="route"
              active-class="route-active"
              to="/history"
              >{{ $t("app.journal") }}</router-link
            > -->
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

      <footer class="app_footer">
        &copy;
        <a href="https://td2.info.pl/profile/?u=20777" target="_blank">
          Spythere
        </a>
        2021 | v{{ VERSION }} | [<a
          target="_blank"
          href="https://paypal.me/spythere"
          >{{ $t("app.support") }}!</a
        >]
      </footer>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";
import { Action, Getter } from "vuex-class";

import UpdateModal from "@/components/Global/UpdateModal.vue";
import Clock from "@/components/App/Clock.vue";

import StorageManager from "@/scripts/storageManager";

@Component({
  components: { Clock, UpdateModal },
})
export default class App extends Vue {
  @Action("synchronizeData") synchronizeData;
  @Getter("getAllData") data;

  private VERSION = "1.4.3";

  hasReleaseNotes = false;
  updateModalVisible = false;

  currentLang = "pl";

  iconEN = require("@/assets/icon-en.svg");
  iconPL = require("@/assets/icon-pl.svg");

  mounted() {
    this.synchronizeData();

    if (window.navigator.language) {
      switch (window.navigator.language) {
        case "pl-PL":
          this.$i18n.locale = "pl";
          break;
        case "en-EN":
        default:
          this.$i18n.locale = "en";
          break;
      }

      this.currentLang = this.$i18n.locale;
    }

    if (StorageManager.getStringValue("version") != this.VERSION) {
      StorageManager.setStringValue("version", this.VERSION);

      if (this.hasReleaseNotes)
        StorageManager.setBooleanValue("version_notes_read", false);
    }

    this.updateModalVisible =
      this.hasReleaseNotes &&
      !StorageManager.getBooleanValue("version_notes_read");
  }

  changeLang(lang: string) {
    this.$i18n.locale = lang;
    this.currentLang = lang;

    console.log("Switched to: " + lang);
  }

  toggleUpdateModal() {
    this.updateModalVisible = !this.updateModalVisible;
    StorageManager.setBooleanValue("version_notes_read", true);
  }
}
</script>

<style lang="scss">
@import "./styles/responsive.scss";
@import "./styles/variables.scss";
@import "./styles/global.scss";
@import "./styles/scenery_status.scss";

:root {
  --clr-primary: #ffc014;
  --clr-secondary: #2f2f2f;

  --clr-bg: #333;

  --clr-accent: #1085b3;
  --clr-accent2: #ff3d5d;

  --clr-skr: #ff5100;
  --clr-twr: #ffbb00;
}

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

  overflow: hidden;

  font-size: calc(0.7rem + 0.2vw);

  @include bigScreen {
    font-size: 1rem;
  }

  @include smallScreen {
    font-size: 0.6rem;
  }
}

// CONTAINER
.app_container {
  // display: grid;
  // grid-template-rows: auto 1fr auto;
  // grid-template-columns: minmax(0, 1fr);

  display: flex;
  flex-flow: column;

  min-width: 0;
  min-height: 100vh;

  header {
    flex: 0 0 auto;
  }

  main {
    flex: 1 1 auto;
  }

  footer {
    flex: 0 1 0.2em;
  }
}

// HEADER
.app_header {
  background: $primaryCol;
  padding: 0.15em;

  border-radius: 0 0 1em 1em;

  display: flex;
  justify-content: center;
}

.header {
  &_brand {
    position: relative;
    width: 100%;
    font-size: 4.5em;

    text-align: center;

    img {
      width: 0.8em;
    }

    .brand_lang {
      position: absolute;
      right: 0;

      transform: translate(110%, -40%);

      img {
        width: 0.5em;
      }

      cursor: pointer;
    }
  }

  &_info {
    display: flex;
    justify-content: space-between;

    font-size: 1.35em;

    margin: 0 0.3em;
    padding: 0.2em;
  }

  &_links {
    display: flex;
    justify-content: center;

    border-radius: 0.7em;

    font-size: 1.35em;
    padding: 0.5em;
  }
}

// COUNTER
.info_counter {
  display: flex;
  align-items: center;
  color: $accentCol;

  span {
    margin: 0 0.15em;
  }

  img {
    width: 1.35em;
  }
}

// FOOTER
footer.app_footer {
  max-width: 100%;
  padding: 0.3rem;

  z-index: 10;

  background: #111;
  color: white;

  text-align: center;
}
</style>
