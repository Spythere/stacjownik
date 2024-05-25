<template>
  <div class="app_container">
    <UpdateCard
      :is-update-card-open="isUpdateCardOpen"
      @toggle-card="() => (isUpdateCardOpen = false)"
    />

    <Tooltip />

    <transition name="modal-anim">
      <keep-alive>
        <TrainModal />
      </keep-alive>
    </transition>

    <AppHeader :current-lang="currentLang" @change-lang="changeLang" />

    <main class="app_main">
      <router-view v-slot="{ Component }">
        <keep-alive exclude="SceneryView">
          <component :is="Component" :key="$route.name" />
        </keep-alive>
      </router-view>
    </main>

    <footer class="app_footer">
      &copy;
      <a href="https://td2.info.pl/profile/?u=20777" target="_blank">Spythere</a>
      {{ new Date().getUTCFullYear() }} |
      <button class="btn--text" @click="() => (isUpdateCardOpen = true)">
        v{{ VERSION }}{{ isOnProductionHost ? '' : 'dev' }}
      </button>

      <br />
      <a href="https://discord.gg/x2mpNN3svk">
        <img src="/images/icon-discord.png" alt="" />&nbsp;<b>{{ $t('footer.discord') }}</b>
      </a>

      <div style="display: none">&int; ukryta taktyczna całka do programowania w HTMLu</div>
    </footer>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import axios from 'axios';

import { version } from '.././package.json';
import { Status } from './typings/common';
import { useMainStore } from './store/mainStore';
import { useApiStore } from './store/apiStore';
import { useTooltipStore } from './store/tooltipStore';

import Clock from './components/App/Clock.vue';
import StatusIndicator from './components/App/StatusIndicator.vue';
import AppHeader from './components/App/AppHeader.vue';
import TrainModal from './components/TrainsView/TrainModal.vue';
import Tooltip from './components/Tooltip/Tooltip.vue';
import UpdateCard from './components/App/UpdateCard.vue';

import StorageManager from './managers/storageManager';

const STORAGE_VERSION_KEY = 'app_version';

export default defineComponent({
  components: {
    Clock,
    StatusIndicator,
    AppHeader,
    TrainModal,
    UpdateCard,
    Tooltip
  },

  data: () => ({
    VERSION: version,
    store: useMainStore(),
    apiStore: useApiStore(),
    tooltipStore: useTooltipStore(),

    isUpdateCardOpen: false,

    currentLang: 'pl',
    isOnProductionHost: location.hostname == 'stacjownik-td2.web.app',

    nextUpdateTime: 0
  }),

  created() {
    this.init();
  },

  async mounted() {
    window.addEventListener('mousemove', (e: MouseEvent) => this.tooltipStore.handle(e));
  },

  methods: {
    init() {
      this.loadLang();
      this.setupOfflineHandling();
      this.checkAppVersion();

      this.apiStore.setupAPIData();
      window.requestAnimationFrame(this.update);

      if (!this.isOnProductionHost) document.title = 'Stacjownik Dev';
    },

    update(t: number) {
      if (t >= this.nextUpdateTime) {
        this.apiStore.fetchActiveData();
        this.nextUpdateTime = t + 20000;
      }
      window.requestAnimationFrame(this.update);
    },

    async checkAppVersion() {
      const storageVersion = StorageManager.getStringValue(STORAGE_VERSION_KEY);

      try {
        const releaseData = await (
          await axios.get('https://api.github.com/repos/Spythere/stacjownik/releases/latest')
        ).data;

        if (!releaseData) return;

        this.store.appUpdate = {
          version,
          changelog: releaseData.body,
          releaseURL: releaseData.html_url
        };

        this.isUpdateCardOpen =
          storageVersion != version || import.meta.env.VITE_UPDATE_TEST === 'test';
      } catch (error) {
        console.error(`Wystąpił błąd podczas pobierania danych z API GitHuba: ${error}`);
      }

      StorageManager.setStringValue(STORAGE_VERSION_KEY, version);
    },

    setupOfflineHandling() {
      this.store.isOffline = !window.navigator.onLine;

      if (this.store.isOffline) this.handleOfflineMode();

      window.addEventListener('offline', this.handleOfflineMode);
      window.addEventListener('online', this.handleOnlineMode);
    },

    handleOfflineMode() {
      this.store.isOffline = true;

      this.apiStore.activeData = undefined;
      this.apiStore.dataStatuses.connection = Status.Data.Offline;
    },

    handleOnlineMode() {
      this.store.isOffline = false;

      this.apiStore.connectToAPI();
    },

    changeLang(lang: string) {
      this.$i18n.locale = lang;
      this.currentLang = lang;

      StorageManager.setStringValue('lang', lang);
    },

    loadLang() {
      const storageLang = StorageManager.getStringValue('lang');

      if (storageLang) {
        this.changeLang(storageLang);
        return;
      }

      if (!window.navigator.language) return;

      const naviLanguage = window.navigator.language.toString();

      if (naviLanguage.includes('en')) {
        this.changeLang('en');
        return;
      }
    }
  }
});
</script>

<style lang="scss">
@import './styles/global';
@import './styles/animations';

.route {
  margin: 0 0.2em;

  &-active,
  &[data-active='true'] {
    color: $accentCol;
    font-weight: bold;
  }
}

// APP
#app {
  color: white;
  font-size: 1rem;
  overflow-x: hidden;

  @include smallScreen() {
    font-size: calc(0.65rem + 0.85vw);
  }

  @include screenLandscape() {
    font-size: calc(0.45rem + 0.8vw);
  }
}

// CONTAINER
.app_container {
  display: grid;
  grid-template-rows: auto 1fr auto;
  grid-template-columns: 100%;

  min-height: 100vh;
  overflow: hidden;
}

.app_main {
  padding: 0 0.5em;
}

.warning {
  background-color: firebrick;
  text-align: center;
  padding: 0.5em 0.4em;
  max-width: 1100px;
  margin: 0 auto;

  border-radius: 0 0 1em 1em;
}

// FOOTER
.app_footer {
  max-width: 100%;
  padding: 0.5em;

  button {
    display: inline-block;
    padding: 0.1em;
  }

  img {
    width: 1.1em;
    vertical-align: text-bottom;
  }

  z-index: 10;

  background: #111;
  color: white;

  text-align: center;
  vertical-align: middle;
}
</style>
