<template>
  <div class="app_container">
    <UpdateCard
      :is-update-card-open="isUpdateCardOpen"
      @toggle-card="() => (isUpdateCardOpen = false)"
    />

    <AppWelcomeCard :is-card-open="isWelcomeCardOpen" @toggle-card="closeWelcomeCard" />

    <Tooltip />

    <AppHeader :current-lang="store.currentLocale" @change-lang="changeLang" />

    <main class="app_main">
      <router-view v-slot="{ Component }">
        <keep-alive exclude="SceneryView">
          <component :is="Component" :key="$route.name" />
        </keep-alive>
      </router-view>
    </main>

    <AppFooter
      :version="VERSION"
      :is-on-production-host="isOnProductionHost"
      :is-update-card-open="isUpdateCardOpen"
      @open-update-card="() => (isUpdateCardOpen = true)"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import axios from 'axios';

import { version } from '../package.json';
import { Status } from './typings/common';
import { useMainStore } from './store/mainStore';
import { useApiStore } from './store/apiStore';
import { useTooltipStore } from './store/tooltipStore';

import Clock from './components/App/Clock.vue';
import StatusIndicator from './components/App/StatusIndicator.vue';
import AppHeader from './components/App/AppHeader.vue';
import Tooltip from './components/Tooltip/Tooltip.vue';
import UpdateCard from './components/App/UpdateCard.vue';

import StorageManager from './managers/storageManager';
import AppFooter from './components/App/AppFooter.vue';
import AppWelcomeCard from './components/App/AppWelcomeCard.vue';

const STORAGE_VERSION_KEY = 'app_version';
const WELCOME_CARD_SEEN_KEY = 'welcome_card_seen';

export default defineComponent({
  components: {
    Clock,
    StatusIndicator,
    AppHeader,
    AppFooter,
    UpdateCard,
    AppWelcomeCard,
    Tooltip
  },

  data: () => ({
    VERSION: version,
    store: useMainStore(),
    apiStore: useApiStore(),
    tooltipStore: useTooltipStore(),

    isUpdateCardOpen: false,
    isWelcomeCardOpen: false,

    isOnProductionHost: location.hostname == 'stacjownik-td2.web.app'
  }),

  created() {
    this.init();
  },

  async mounted() {
    window.addEventListener('mousemove', (e: MouseEvent) => this.tooltipStore.handle(e));
    window.addEventListener('mousedown', () => this.tooltipStore.hide());
  },

  methods: {
    init() {
      if (!this.isOnProductionHost) document.title = 'Stacjownik Dev';

      this.loadLang();
      this.setupOfflineHandling();
      this.checkAppVersion();
      this.handleQueries();

      this.apiStore.setupAPIData();
    },

    handleQueries() {
      const query = new URLSearchParams(window.location.search);

      if (query.get('welcomeCard') == '1') {
        this.isWelcomeCardOpen = true;
      }
    },

    async checkAppVersion() {
      const isWelcomeCardSeen = StorageManager.getBooleanValue(WELCOME_CARD_SEEN_KEY);
      const storageVersion = StorageManager.getStringValue(STORAGE_VERSION_KEY);

      if (isWelcomeCardSeen == false && storageVersion == '') {
        setTimeout(() => {
          this.isWelcomeCardOpen = true;
        }, 1500);
      }

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
          (storageVersion != '' && storageVersion != version && this.isOnProductionHost) ||
          import.meta.env.VITE_UPDATE_TEST === 'test';
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
      this.apiStore.dataStatuses.connection = Status.Data.Loading;

      this.apiStore.connectToAPI();
    },

    changeLang(lang: string) {
      this.$i18n.locale = lang;
      this.store.currentLocale = lang;

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

      if (!naviLanguage.startsWith('pl')) {
        this.changeLang('en');
        return;
      }
    },

    closeWelcomeCard() {
      this.isWelcomeCardOpen = false;
      StorageManager.setBooleanValue(WELCOME_CARD_SEEN_KEY, true);
    }
  }
});
</script>

<style lang="scss">
@use './styles/animations';

// APP
#app {
  color: white;
  overflow-x: hidden;
  font-size: 1em;
}

// CONTAINER
.app_container {
  display: grid;
  grid-template-rows: auto 1fr auto;
  grid-template-columns: 100%;

  min-height: 100vh;
  overflow: hidden;
  position: relative;
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
