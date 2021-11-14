<template>
  <div class="app">
    <!-- <UpdateModal
      :currentVersion="VERSION"
      @toggleUpdateModal="toggleUpdateModal"
      v-if="updateModalVisible"
    /> -->

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
            <router-link class="route" active-class="route-active" to="/" exact
              >{{ $t("app.sceneries") }}
            </router-link>
            /
            <router-link class="route" active-class="route-active" to="/trains"
              >{{ $t("app.trains") }}
            </router-link>
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
        2021 | v{{ VERSION }}
      </footer>
    </div>
  </div>
</template>

<script lang="ts">
import Clock from "@/components/App/Clock.vue";

import StorageManager from "@/scripts/managers/storageManager";
import { computed, ComputedRef, defineComponent, provide, ref } from "vue";
import { GETTERS } from "./constants/storeConstants";
import { StoreData } from "./scripts/interfaces/StoreData";
import { useStore } from "./store";

import packageInfo from ".././package.json";

export default defineComponent({
  components: {
    Clock,
  },

  setup() {
    const store = useStore();
    store.dispatch("synchronizeData");

    const data: ComputedRef<StoreData> = computed(
      () => store.getters[GETTERS.allData]
    );

    const currentRegion: ComputedRef<{ id: string; value: string }> = computed(
      () => store.getters[GETTERS.currentRegion]
    );

    const isFilterCardVisible = ref(false);

    provide("isFilterCardVisible", isFilterCardVisible);

    return {
      data,
      currentRegion,
      isFilterCardVisible,

      openFilterCard() {
        isFilterCardVisible.value = true;
      },
    };
  },

  data: () => ({
    VERSION: packageInfo.version,
    updateModalVisible: false,
    hasReleaseNotes: false,
    currentLang: "pl",

    iconEN: require("@/assets/icon-en.jpg"),
    iconPL: require("@/assets/icon-pl.svg"),
  }),

  created() {
    this.loadLang();
  },

  mounted() {
    if (StorageManager.getStringValue("version") != this.VERSION) {
      StorageManager.setStringValue("version", this.VERSION);

      if (this.hasReleaseNotes)
        StorageManager.setBooleanValue("version_notes_read", false);
    }

    this.updateModalVisible =
      this.hasReleaseNotes &&
      !StorageManager.getBooleanValue("version_notes_read");

    this.updateToNewestVersion();
  },

  methods: {
    toggleUpdateModal() {
      this.updateModalVisible = !this.updateModalVisible;
      StorageManager.setBooleanValue("version_notes_read", true);
    },

    changeLang(lang: string) {
      this.$i18n.locale = lang;
      this.currentLang = lang;

      StorageManager.setStringValue("lang", lang);
    },

    updateToNewestVersion() {
      //   to do
      if (!StorageManager.isRegistered("unavailable-status")) {
        StorageManager.setBooleanValue("unavailable-status", true);
        StorageManager.setBooleanValue("ending-status", true);
        StorageManager.setBooleanValue("no-space-status", true);
        StorageManager.setBooleanValue("afk-status", true);
      }
    },

    loadLang() {
      const storageLang = StorageManager.getStringValue("lang");

      if (storageLang) {
        this.changeLang(storageLang);
        return;
      }

      if (!window.navigator.language) return;

      const naviLanguage = window.navigator.language.toString();

      if (naviLanguage.includes("en")) {
        this.changeLang("en");
        return;
      }
    },
  },
});
</script>

<style lang="scss" src="./App.scss"></style>