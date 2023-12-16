<template>
  <div
    class="journal-stats dropdown"
    v-if="!mainStore.isOffline"
    @keydown.esc="currentStatsTab = null"
  >
    <div
      class="dropdown_background"
      v-if="currentStatsTab !== null"
      @click="currentStatsTab = null"
    ></div>

    <div class="actions-bar">
      <button
        v-for="button in statsButtons"
        :key="button.tab"
        class="btn--filled btn--image"
        :data-selected="button.tab == currentStatsTab"
        :data-disabled="button.disabled"
        :disabled="button.disabled"
        @click="onTabButtonClick(button.tab)"
      >
        <img
          v-if="button.iconName"
          :src="`/images/icon-${button.iconName}.svg`"
          :alt="button.iconName"
        />
        {{ $t(button.localeKey) }}
      </button>
    </div>

    <transition name="dropdown-anim">
      <div class="dropdown_wrapper" v-if="currentStatsTab !== null">
        <keep-alive>
          <component :is="currentStatsTab" :key="currentStatsTab"></component>
        </keep-alive>
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { useMainStore } from '../../store/mainStore';
import StorageManager from '../../managers/storageManager';
import { Journal } from './typings';
import JournalDailyStats from './JournalDailyStats.vue';
import JournalDispatcherStats from './JournalDispatcherStats.vue';
import JournalDriverStats from './JournalDriverStats.vue';
import { Status } from '../../typings/common';
import http from '../../http';
import { API } from '../../typings/api';

export default defineComponent({
  components: { JournalDailyStats, JournalDriverStats, JournalDispatcherStats },
  props: {
    statsButtons: {
      type: Array as PropType<Journal.StatsButton[]>,
      required: true
    }
  },
  data() {
    return {
      Journal,
      mainStore: useMainStore(),
      currentStatsTab: null as Journal.StatsTab | null
    };
  },

  watch: {
    async 'mainStore.driverStatsName'(val) {
      await this.fetchDriverStats();
    },

    async 'mainStore.dispatcherStatsName'() {
      await this.fetchDispatcherStats();
    }
  },

  methods: {
    onTabButtonClick(tab: Journal.StatsTab) {
      this.currentStatsTab = tab == this.currentStatsTab ? null : tab;

      StorageManager.setStringValue('journalStatsTab', this.currentStatsTab ?? '');
    },

    async fetchDriverStats() {
      if (!this.mainStore.driverStatsName) {
        this.mainStore.driverStatsData = undefined;
        this.mainStore.driverStatsStatus = Status.Data.Initialized;
        return;
      }

      try {
        this.mainStore.driverStatsStatus = Status.Data.Loading;

        const statsData: API.DriverStats.Response = await (
          await http.get(`api/getDriverInfo?name=${this.mainStore.driverStatsName}`)
        ).data;

        this.mainStore.driverStatsData = statsData;
        this.mainStore.driverStatsStatus = Status.Data.Loaded;
      } catch (error) {
        this.mainStore.driverStatsData = undefined;
        this.mainStore.driverStatsStatus = Status.Data.Error;
        console.error('Ups! Wystąpił błąd przy próbie pobrania statystyk maszynisty! :/');
      }
    },

    async fetchDispatcherStats() {
      if (!this.mainStore.dispatcherStatsName) {
        this.mainStore.dispatcherStatsData = undefined;
        return;
      }

      try {
        const statsData: API.DispatcherStats.Response = await (
          await http.get('api/getDispatcherInfo', {
            params: {
              name: this.mainStore.dispatcherStatsName
            }
          })
        ).data;

        this.mainStore.dispatcherStatsData = statsData;
      } catch (error) {
        this.mainStore.dispatcherStatsData = undefined;

        console.error('Ups! Wystąpił błąd przy próbie pobrania statystyk dyżurnego! :/');
      }
    }
  }
});
</script>

<style lang="scss" scoped>
@import '../../styles/dropdown.scss';
@import '../../styles/dropdown_filters.scss';
@import '../../styles/variables.scss';

.dropdown_wrapper {
  max-width: 100%;
}
</style>
