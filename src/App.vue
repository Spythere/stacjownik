<template>
  <div class="app_container">
    <transition name="modal-anim">
      <keep-alive>
        <TrainModal v-if="store.chosenModalTrainId" />
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
      <a :href="releaseURL" target="_blank">v{{ VERSION }}{{ isOnProductionHost ? '' : 'dev' }}</a>
      <br />
      <a href="https://discord.gg/x2mpNN3svk">
        <img src="/images/icon-discord.png" alt="" />&nbsp;<b>{{ $t('footer.discord') }}</b>
      </a>

      <div style="display: none">&int; ukryta taktyczna całka do programowania w HTMLu</div>
    </footer>
  </div>
</template>

<script lang="ts">
import { defineComponent, watch } from 'vue';
import axios from 'axios';
import packageInfo from '.././package.json';

import Clock from './components/App/Clock.vue';

import { useMainStore } from './store/mainStore';

import StatusIndicator from './components/App/StatusIndicator.vue';
import AppHeader from './components/App/AppHeader.vue';
import TrainModal from './components/TrainsView/TrainModal.vue';

import StorageManager from './managers/storageManager';
import { useApiStore } from './store/apiStore';
import { Status } from './typings/common';

export default defineComponent({
  components: {
    Clock,
    StatusIndicator,
    AppHeader,
    TrainModal
  },

  data: () => ({
    VERSION: packageInfo.version,
    store: useMainStore(),
    apiStore: useApiStore(),

    currentLang: 'pl',
    releaseURL: '',
    isOnProductionHost: location.hostname == 'stacjownik-td2.web.app'
  }),

  created() {
    this.init();
  },

  async mounted() {
    watch(
      () => this.store.blockScroll,
      (value) => {
        if (value) document.body.classList.add('no-scroll');
        else document.body.classList.remove('no-scroll');
      }
    );
  },

  methods: {
    init() {
      this.loadLang();
      this.setReleaseURL();
      this.setupOfflineHandling();

      this.apiStore.setupAPI();
    },

    setupOfflineHandling() {
      this.store.isOffline = !window.navigator.onLine;

      if (this.store.isOffline) this.handleOfflineMode();

      window.addEventListener('offline', this.handleOfflineMode);
      window.addEventListener('online', this.handleOnlineMode);
    },

    handleOfflineMode() {
      this.store.isOffline = true;

      this.apiStore.stopActiveDataScheduler();
      this.apiStore.activeData = undefined;

      this.apiStore.dataStatuses.connection = Status.Data.Offline;
    },

    handleOnlineMode() {
      this.store.isOffline = false;

      this.apiStore.setupAPI();
    },

    changeLang(lang: string) {
      this.$i18n.locale = lang;
      this.currentLang = lang;

      StorageManager.setStringValue('lang', lang);
    },

    async setReleaseURL() {
      try {
        const releaseData = await (
          await axios.get('https://api.github.com/repos/Spythere/stacjownik/releases/latest')
        ).data;

        if (!releaseData) return;

        this.releaseURL = releaseData.html_url;
      } catch (error) {
        console.error(`Wystąpił błąd podczas pobierania danych z API GitHuba: ${error}`);
        return;
      }
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

<style lang="scss" src="./App.scss"></style>
