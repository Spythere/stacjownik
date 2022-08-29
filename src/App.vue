<template>
  <div class="app_container">
    <UpdateModal />

    <transition name="modal-anim">
      <keep-alive>
        <TrainModal v-if="store.chosenModalTrainId" />
      </keep-alive>
    </transition>

    <header class="app_header">
      <div class="header_container">
        <div class="header_icons">
          <span class="icons-top">
            <img :src="getIcon('pl')" alt="icon-pl" @click="changeLang('en')" v-if="currentLang == 'pl'" />
            <img :src="getIcon('en', 'jpg')" alt="icon-en" @click="changeLang('pl')" v-else />
          </span>
          <span class="icons-bottom">
            <a href="https://www.paypal.com/paypalme/spythere" target="_blank">
              <img :src="getIcon('dollar')" alt="icon paypal" />
            </a>

            <a href="https://discord.gg/x2mpNN3svk" target="_blank">
              <img :src="getIcon('discord', 'png')" alt="icon discord" />
            </a>
          </span>
        </div>

        <div class="header_body">
          <status-indicator />
          <span class="header_brand">
            <img :src="getImage('stacjownik-header-logo.svg')" alt="Stacjownik" />
          </span>

          <span class="header_info">
            <Clock />

            <div class="info_counter">
              <img :src="getIcon('dispatcher')" alt="icon dispatcher" />
              <span class="text--primary">{{ onlineDispatchers.length }}</span>
              <span class="text--grayed"> / </span>
              <span class="text--primary">{{ trainList.length }}</span>
              <img :src="getIcon('train')" alt="icon train" />
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
            <router-link class="route" active-class="route-active" to="/journal/timetables">
              {{ $t('app.journal') }}
            </router-link>
          </span>
        </div>
      </div>
    </header>

    <main class="app_main">
      <router-view v-slot="{ Component }">
        <keep-alive>
          <component :is="Component" :key="$route.path" />
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
import options from './data/options.json';

import StatusIndicator from './components/App/StatusIndicator.vue';
import SelectBox from './components/Global/SelectBox.vue';
import { useStore } from './store/store';
import UpdateModal from './components/App/UpdateModal.vue';
import TrainModal from './components/Global/TrainModal.vue';
import StorageManager from './scripts/managers/storageManager';
import imageMixin from './mixins/imageMixin';

export default defineComponent({
  components: {
    Clock,
    StatusIndicator,
    SelectBox,
    UpdateModal,
    TrainModal,
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
    options,

    currentLang: 'pl',
    releaseURL: '',
  }),

  created() {
    this.loadLang();
  },

  async mounted() {
    this.updateStorage();
    this.setReleaseURL();

    function preventScroll(e: Event) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();

      return false;
    }

    watch(
      () => this.store.blockScroll,
      (value) => {
        if (value) {
          document.body.classList.add('no-scroll');
          // document.querySelector('#app')!.addEventListener('wheel', preventScroll, { passive: false,  });
          // document.querySelector('#app')!.addEventListener('touchmove', preventScroll, { passive: false });
          return;
        }

        document.body.classList.remove('no-scroll');

        // document.querySelector('#app')!.removeEventListener('wheel', preventScroll);
        // document.querySelector('#app')!.removeEventListener('touchmove', preventScroll);
      }
    );
  },

  methods: {
    changeRegion(region: { id: string; value: string }) {
      this.store.changeRegion(region);
    },

    changeLang(lang: string) {
      this.$i18n.locale = lang;
      this.currentLang = lang;

      StorageManager.setStringValue('lang', lang);
    },

    setReleaseURL() {
      const releaseURL = StorageManager.getStringValue('releaseURL');

      this.releaseURL = releaseURL || '';
    },

    updateStorage() {
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
