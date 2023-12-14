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
  mounted() {
    // const storedTab = StorageManager.getStringValue('journalStatsTab');
    // if (storedTab && storedTab !== '' && this.statsButtons.some((b) => b.tab == storedTab))
    //   this.currentStatsTab = storedTab as Journal.StatsTab;
  },
  // watch: {
  //   'mainStore.driverStatsData'(newData, prevData) {
  //     this.currentStatsTab =
  //       JSON.stringify(prevData) !== JSON.stringify(newData) && newData !== undefined
  //         ? Journal.StatsTab.DRIVER_STATS
  //         : this.currentStatsTab;
  //   }
  // },
  methods: {
    onTabButtonClick(tab: Journal.StatsTab) {
      this.currentStatsTab = tab == this.currentStatsTab ? null : tab;

      StorageManager.setStringValue('journalStatsTab', this.currentStatsTab ?? '');
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
