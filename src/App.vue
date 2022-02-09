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
          <div class="indicator-wrapper">
            <div class="indicator-content">
              <object
                class="indicator-svg"
                type="image/svg+xml"
                :data="icons.statusIndicator"
                ref="status-indicator"
                @mouseenter="() => tooltipActive = true"
                @mouseleave="() => tooltipActive = false"
              ></object>

              <transition name="tooltip-anim">
                <div class="indicator-tooltip" v-if="tooltipActive">
                  <b>{{ indicator.status <= 0 ? 'S3' : indicator.status == 1 ? 'S1a' : indicator.status == 2 ? 'S2' : 'S5' }}</b>
                  <br>
                  {{ indicator.message }}
                </div>
              </transition>
            </div>
          </div>

          <!-- <object class="signal-status-indicator" :src="icons.statusIndicator" alt="status-icon" ref="status-indicator"></object> -->
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
              <span>{{ data.activeStationCount }}</span>
              <span>{{ data.activeTrainCount }}</span>
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
import { computed, ComputedRef, defineComponent, provide, ref, watch } from 'vue';
import { GETTERS } from './constants/storeConstants';
import { StoreData } from './scripts/interfaces/StoreData';
import { useStore } from './store';

import packageInfo from '.././package.json';
import { DataStatus } from './scripts/enums/DataStatus';

export default defineComponent({
  components: {
    Clock,
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
      statusIndicator: require('@/assets/signal-status-indicator.svg'),
      en: require('@/assets/icon-en.jpg'),
      pl: require('@/assets/icon-pl.svg'),
      error: require('@/assets/icon-error.svg'),
    },

    indicator: {
      status: DataStatus.Loading,
      message: "Ładowanie danych..."
    },

    tooltipActive: false
  }),

  created() {
    this.loadLang();
  },

  watch: {
    dataStatus(storeData: StoreData) {
      // if(val == DataStatus.Loaded)
      //   this.setSignalStatus(DataStatus.Loaded)
      
      const dataConnectionStatus = storeData.dataConnectionStatus;
      const sceneryDataStatus = storeData.sceneryDataStatus;
      const trainsDataStatus = storeData.trainsDataStatus;
      const dispatcherDataStatus = storeData.dispatcherDataStatus;
      const timetableDataStatus = storeData.timetableDataStatus;

      if (dataConnectionStatus == DataStatus.Error) {
        this.indicator.status = DataStatus.Error;
        this.indicator.message = "Błąd podczas łączenia z serwisem SWDR!";
        this.setSignalStatus(DataStatus.Error);
        return;
      }

      if (sceneryDataStatus == DataStatus.Error) {
        this.indicator.status = DataStatus.Error;
        this.indicator.message = "Nie można pobrać danych o sceneriach!";
        this.setSignalStatus(DataStatus.Error);
        return;
      } 

      if (timetableDataStatus == DataStatus.Warning) {
        this.indicator.status = DataStatus.Warning;
        this.indicator.message = "Rozkłady jazdy mogą być niekompletne!";
        this.setSignalStatus(DataStatus.Warning);
        return;
      } 

      if (trainsDataStatus == DataStatus.Warning) {
        this.indicator.status = DataStatus.Warning;
        this.indicator.message = "Nie można pobrać danych o pociągach!";
        this.setSignalStatus(DataStatus.Warning);
        return;
      } 

      if (dispatcherDataStatus == DataStatus.Warning) {
        this.indicator.status = DataStatus.Warning;
        this.indicator.message = "Nie można pobrać danych o statusach dyżurnych ruchu!";
        this.setSignalStatus(DataStatus.Warning);
        return;
      } 

      this.indicator.status = DataStatus.Loaded;
      this.indicator.message = "Dane załadowane poprawnie!";

      this.setSignalStatus(DataStatus.Loaded);
    },

    sceneryDataStatus(val: DataStatus) {
      if (val == DataStatus.Error) this.setSignalStatus(DataStatus.Error);
    },

    dispatcherDataStatus(val: DataStatus) {
      if (val == DataStatus.Warning && this.sceneryDataStatus != DataStatus.Error)
        this.setSignalStatus(DataStatus.Warning);
    },
  },

  async mounted() {
    if (StorageManager.getStringValue('version') != this.VERSION) {
      StorageManager.setStringValue('version', this.VERSION);

      if (this.hasReleaseNotes) StorageManager.setBooleanValue('version_notes_read', false);
    }

    this.updateModalVisible = this.hasReleaseNotes && !StorageManager.getBooleanValue('version_notes_read');

    this.updateToNewestVersion();

    const obj = this.$refs['status-indicator'] as HTMLObjectElement;

    // obj.addEventListener('load', () => {
    //   this.setSignalStatus(DataStatus.Loading);
    // });
  },

  methods: {
    toggleUpdateModal() {
      this.updateModalVisible = !this.updateModalVisible;
      StorageManager.setBooleanValue('version_notes_read', true);
    },

    setSignalStatus(status: DataStatus) {
      const obj = this.$refs['status-indicator'] as HTMLObjectElement;

      const green = obj.contentDocument?.querySelector('#green') as SVGElement;
      const greenBlink = obj.contentDocument?.querySelector('#green-blink') as SVGElement;
      const redTop = obj.contentDocument?.querySelector('#red-top') as SVGElement;
      const orange = obj.contentDocument?.querySelector('#orange') as SVGElement;
      const redBottom = obj.contentDocument?.querySelector('#red-bottom') as SVGElement;

      if(!green || !greenBlink || !redTop || !orange || !redBottom) return;

      if (status == DataStatus.Loaded) {
        green.style.visibility = 'visible';
        greenBlink.style.visibility = 'hidden';
        redTop.style.visibility = 'hidden';
        orange.style.visibility = 'hidden';
        redBottom.style.visibility = 'hidden';
      }

      if (status == DataStatus.Warning) {
        green.style.visibility = 'hidden';
        greenBlink.style.visibility = 'hidden';
        redTop.style.visibility = 'hidden';
        orange.style.visibility = 'visible';
        redBottom.style.visibility = 'hidden';
      }

      if (status == DataStatus.Error) {
        green.style.visibility = 'hidden';
        greenBlink.style.visibility = 'hidden';
        redTop.style.visibility = 'visible';
        orange.style.visibility = 'hidden';
        redBottom.style.visibility = 'visible';
      }

      if (status == DataStatus.Loading) {
        green.style.visibility = 'hidden';
        greenBlink.style.visibility = 'visible';
        redTop.style.visibility = 'hidden';
        orange.style.visibility = 'hidden';
        redBottom.style.visibility = 'hidden';
      }
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
