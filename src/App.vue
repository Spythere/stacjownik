<template>
  <div class="app_container">
    <!-- <div class="wip-alert">
        <img class="icon-error" :src="iconError" alt="error" />
        <h2>Stacjownik tymczasowo nieaktywny!</h2>
        <p>Absolutny zakaz wjazdu!</p>
      </div> -->
    <header class="app_header">
      <div class="header_container">
        <div class="header_icons">
          <span class="icons-top">
            <img :src="icons.pl" alt="icon-pl" @click="changeLang('en')" v-if="currentLang == 'pl'" />
            <img :src="icons.en" alt="icon-en" @click="changeLang('pl')" v-else />
          </span>
          <span class="icons-bottom">
            <a href="https://www.paypal.com/paypalme/spythere" target="_blank">
              <img :src="icons.dollar" alt="icon paypal" />
            </a>

            <a href="https://discord.gg/x2mpNN3svk" target="_blank">
              <img :src="icons.discord" alt="icon discord" />
            </a>
          </span>
        </div>

        <div class="header_body">
          <status-indicator />
          <span class="header_brand">
            <img :src="brand_logo" alt="Stacjownik" />
          </span>

          <span class="header_info">
            <Clock />

            <div class="info_counter">
              <img src="@/assets/icon-dispatcher.svg" alt="icon dispatcher" />
              <span class="text--primary">{{ onlineDispatchers.length }}</span>
              <span class="text--grayed"> / </span>
              <span class="text--primary">{{ trainList.length }}</span>
              <img src="@/assets/icon-train.svg" alt="icon train" />
            </div>

            <span class="info_region">
              <SelectBox :itemList="computedRegions" :defaultItemIndex="0" @selected="changeRegion" />
            </span>
          </span>

          <span class="header_links">
            <router-link class="route" active-class="route-active" to="/" exact>
              {{ $t('app.sceneries') }}
            </router-link>
            /
            <router-link class="route" active-class="route-active" to="/trains">{{ $t('app.trains') }}</router-link>
            /
            <router-link class="route" active-class="route-active" to="/journal">
              {{ $t('app.journal') }}
            </router-link>
          </span>
        </div>
      </div>
    </header>

    <main class="app_main">
      <router-view v-slot="{ Component }">
        <!-- <transition name="view-anim" mode="out-in"> -->
        <keep-alive>
          <component :is="Component" :key="$route.path" />
        </keep-alive>
      </router-view>
    </main>

    <footer class="app_footer">
      &copy;
      <a href="https://td2.info.pl/profile/?u=20777" target="_blank">Spythere</a>
      {{ new Date().getUTCFullYear() }} | v{{ VERSION }}

      <div style="display: none">&int; ukryta taktyczna całka do programowania w HTMLu</div>
    </footer>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, provide, ref } from 'vue';

import Clock from '@/components/App/Clock.vue';
import StorageManager from '@/scripts/managers/storageManager';

import packageInfo from '.././package.json';
import options from '@/data/options.json';

import StatusIndicator from '@/components/App/StatusIndicator.vue';
import SelectBox from '@/components/Global/SelectBox.vue';
import { useStore } from './store/store';

export default defineComponent({
  components: {
    Clock,
    StatusIndicator,
    SelectBox,
  },

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

  computed: {
    trainList() {
      return this.store.trainList.filter((train) => train.online);
    },

    computedRegions() {
      return this.options.regions.map((region) => {
        const regionStationCount =
          this.store.apiData.stations?.filter((station) => station.region == region.id && station.isOnline).length || 0;
        const regionTrainCount =
          this.store.apiData.trains?.filter((train) => train.region == region.id && train.online).length || 0;

        return {
          id: region.id,
          value: `${region.value} <div class='text--grayed'>${regionStationCount} / ${regionTrainCount}</div>`,
          selectedValue: region.value,
        };
      });
    },
  },

  data: () => ({
    VERSION: packageInfo.version,
    updateModalVisible: false,
    hasReleaseNotes: false,
    options,

    currentLang: 'pl',

    brand_logo: require('@/assets/stacjownik-header-logo.svg'),

    icons: {
      en: require('@/assets/icon-en.jpg'),
      pl: require('@/assets/icon-pl.svg'),
      error: require('@/assets/icon-error.svg'),
      dollar: require('@/assets/icon-dollar.svg'),
      dispatcher: require('@/assets/icon-dispatcher.svg'),
      train: require('@/assets/icon-train.svg'),
      discord: require('@/assets/icon-discord.png'),
    },
  }),

  created() {
    this.loadLang();
  },

  async mounted() {
    if (StorageManager.getStringValue('version') != this.VERSION) {
      StorageManager.setStringValue('version', this.VERSION);

      if (this.hasReleaseNotes) StorageManager.setBooleanValue('version_notes_read', false);
    }

    this.updateModalVisible = this.hasReleaseNotes && !StorageManager.getBooleanValue('version_notes_read');

    this.updateToNewestVersion();
  },

  methods: {
    toggleUpdateModal() {
      this.updateModalVisible = !this.updateModalVisible;
      StorageManager.setBooleanValue('version_notes_read', true);
    },

    changeRegion(region: { id: string; value: string }) {
      this.store.changeRegion(region);
    },

    changeLang(lang: string) {
      this.$i18n.locale = lang;
      this.currentLang = lang;

      StorageManager.setStringValue('lang', lang);
    },

    updateToNewestVersion() {
      if (!StorageManager.isRegistered('unavailable-status')) {
        StorageManager.setBooleanValue('unavailable-status', true);
        StorageManager.setBooleanValue('ending-status', true);
        StorageManager.setBooleanValue('no-space-status', true);
        StorageManager.setBooleanValue('afk-status', true);
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
