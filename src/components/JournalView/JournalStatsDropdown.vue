<template>
  <div
    class="journal-stats dropdown"
    v-if="!mainStore.isOffline"
    @keydown.esc="dropdownEnabled = false"
  >
    <div
      class="dropdown_background"
      v-if="dropdownEnabled != false"
      @click="dropdownEnabled = false"
    ></div>

    <div class="actions-bar">
      <button class="btn--filled btn--image" @click="onTabButtonClick()">
        <img src="/images/icon-stats.svg" alt="stats icon" />
        {{ $t('journal.daily-stats.button') }}
      </button>
    </div>

    <transition name="dropdown-anim">
      <div class="dropdown_wrapper dropdown-align-right" v-if="dropdownEnabled">
        <keep-alive>
          <JournalDailyStats />
        </keep-alive>
      </div>
    </transition>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { useMainStore } from '../../store/mainStore';
import JournalDailyStats from './JournalDailyStats.vue';

const mainStore = useMainStore();
const dropdownEnabled = ref(false);

function onTabButtonClick() {
  dropdownEnabled.value = !dropdownEnabled.value;
}
</script>

<style lang="scss" scoped>
@use '../../styles/dropdown';
@use '../../styles/dropdown-filters';

.dropdown_wrapper.dropdown-align-right {
  left: auto;
  right: 0;
  max-width: 700px;
}
</style>
