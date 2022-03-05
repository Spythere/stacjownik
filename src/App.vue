<template>
  <div class="app">
    <div class="app_container">
      <!-- <div class="wip-alert">
        <img class="icon-error" :src="iconError" alt="error" />
        <h2>Stacjownik tymczasowo nieaktywny!</h2>
        <p>Absolutny zakaz wjazdu!</p>
      </div> -->
      <header class="app_header">
        <div class="header_body">
          <status-indicator :dataStatus="dataStatus" />

          <span class="header_brand">
            <span>
              <span>S</span>
              <span>tacj</span>
              <span class="train-logo">
                <img class="logo-image" src="@/assets/stacjownik-logo.svg" alt="stacjownik logo" />
              </span>
              <span>wnik</span>
            </span>

            <span class="brand_lang">
              <span
                class="lang pl"
                @click="changeLang('en')"
                :class="{ current: currentLang == 'pl' }"
                v-if="currentLang == 'pl'"
              >
                <img :src="icons.pl" alt="icon-pl" />
              </span>

              <span
                class="lang en"
                @click="changeLang('pl')"
                :class="{ current: currentLang == 'en' }"
                v-if="currentLang == 'en'"
              >
                <img :src="icons.en" alt="icon-en" />
              </span>
            </span>
          </span>

          <span class="header_info">
            <Clock />

            <div class="info_counter">
              <span class="region" @click="openFilterCard">
                {{ currentRegion.value }}
              </span>

              <img src="@/assets/icon-dispatcher.svg" alt="icon dispatcher" />
              {{ data.activeStationCount }}
              |
              {{ data.activeTrainCount }}
              <img src="@/assets/icon-train.svg" alt="icon train" />
            </div>
          </span>

          <span class="header_links">
            <router-link class="route" active-class="route-active" to="/" exact>{{ $t('app.sceneries') }} </router-link>
            /
            <router-link class="route" active-class="route-active" to="/trains">{{ $t('app.trains') }} </router-link>
            /
            <router-link class="route" active-class="route-active" to="/journal">{{ $t('app.journal') }} </router-link>
          </span>
        </div>
      </header>

      <main class="app_main">
        <router-view v-slot="{ Component }">
          <transition name="view-anim" mode="out-in">
            <keep-alive>
              <component :is="Component" />
            </keep-alive>
          </transition>
        </router-view>
      </main>

      <footer class="app_footer">
        &copy;
        <a href="https://td2.info.pl/profile/?u=20777" target="_blank">
          Spythere
        </a>
        {{ new Date().getUTCFullYear() }} | v{{ VERSION }}
      </footer>
    </div>
  </div>
</template>

<script lang="ts">
import Clock from '@/components/App/Clock.vue';

import StorageManager from '@/scripts/managers/storageManager';
import { computed, ComputedRef, defineComponent, provide, ref } from 'vue';
import { GETTERS } from './constants/storeConstants';
import { StoreData } from './scripts/interfaces/StoreData';
import { useStore } from './store';

import packageInfo from '.././package.json';
import StatusIndicator from './components/App/StatusIndicator.vue';

export default defineComponent({
  components: {
    Clock,
    StatusIndicator,
  },

  setup() {
    const store = useStore();
    store.dispatch('synchronizeData');

    const data: ComputedRef<StoreData> = computed(() => store.getters[GETTERS.allData]);

    const currentRegion: ComputedRef<{ id: string; value: string }> = computed(
      () => store.getters[GETTERS.currentRegion]
    );

    const dataStatus = computed(() => data.value);
    const sceneryDataStatus = computed(() => data.value.sceneryDataStatus);

    const isFilterCardVisible = ref(false);

    provide('isFilterCardVisible', isFilterCardVisible);

    return {
      data,
      currentRegion,
      isFilterCardVisible,

      dataStatus,
      sceneryDataStatus,
      dispatcherDataStatus: computed(() => data.value.dispatcherDataStatus),

      timetableCount: data.value.trainList.filter((train) => train.timetableData).length,
      onlineDispatcherCount: data.value.stationList.filter(
        (station) => station.onlineInfo && station.onlineInfo.statusTimestamp > 0
      ).length,

      openFilterCard() {
        isFilterCardVisible.value = true;
      },
    };
  },

  data: () => ({
    VERSION: packageInfo.version,
    updateModalVisible: false,
    hasReleaseNotes: false,
    currentLang: 'pl',

    icons: {
      en: require('@/assets/icon-en.jpg'),
      pl: require('@/assets/icon-pl.svg'),
      error: require('@/assets/icon-error.svg'),
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
