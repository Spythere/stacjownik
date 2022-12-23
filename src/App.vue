<template>
  <div class="app_container">
    <transition name="modal-anim">
      <keep-alive>
        <TrainModal v-if="store.chosenModalTrainId" />
      </keep-alive>
    </transition>

    <UpdatePrompt />

    <AppHeader :current-lang="currentLang" @change-lang="changeLang" />

    <main class="app_main">
      <router-view v-slot="{ Component }">
        <keep-alive exclude="JournalView">
          <component :is="Component" :key="$route.name" />
        </keep-alive>
      </router-view>
    </main>

    <footer class="app_footer">
      &copy;
      <a href="https://td2.info.pl/profile/?u=20777" target="_blank">Spythere</a>
      {{ new Date().getUTCFullYear() }} | <a :href="releaseURL" target="_blank">v{{ VERSION }}</a>

      <div style="display: none">&int; ukryta taktyczna całka do programowania w HTMLu</div>
    </footer>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, provide, ref, watch } from 'vue';

import Clock from './components/App/Clock.vue';

import packageInfo from '.././package.json';

import StatusIndicator from './components/App/StatusIndicator.vue';
import SelectBox from './components/Global/SelectBox.vue';
import { useStore } from './store/store';
import TrainModal from './components/Global/TrainModal.vue';
import StorageManager from './scripts/managers/storageManager';
import imageMixin from './mixins/imageMixin';
import AppHeader from './components/App/AppHeader.vue';
import axios from 'axios';
import UpdatePrompt from './components/App/UpdatePrompt.vue';

export default defineComponent({
  components: {
    Clock,
    StatusIndicator,
    SelectBox,
    TrainModal,
    AppHeader,
    UpdatePrompt
},

  mixins: [imageMixin],

  setup() {
    const store = useStore();
    store.connectToAPI();

    const isFilterCardVisible = ref(false);

    provide('isFilterCardVisible', isFilterCardVisible);

    return {
      store,
      isFilterCardVisible,
      onlineDispatchers: computed(() =>
        store.stationList.filter((station) => station.onlineInfo && station.onlineInfo.region == store.region.id)
      ),

      dispatcherDataStatus: store.dataStatuses.dispatchers,
    };
  },

  data: () => ({
    VERSION: packageInfo.version,

    currentLang: 'pl',
    releaseURL: '',
  }),

  created() {
    this.loadLang();
  },

  async mounted() {
    this.setReleaseURL();

    watch(
      () => this.store.blockScroll,
      (value) => {
        if (value) {
          document.body.classList.add('no-scroll');
          return;
        }

        document.body.classList.remove('no-scroll');
      }
    );
  },

  methods: {
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
    },
  },
});
</script>

<style lang="scss" src="./App.scss"></style>
