<template>
  <header class="app_header">
    <div class="header-container">
      <img
        v-if="!isChristmas"
        src="/images/stacjownik-header-logo.svg"
        alt="Stacjownik logo"
        width="150"
      />

      <img
        v-else
        src="/images/stacjownik-header-logo-christmas.svg"
        alt="Stacjownik logo (christmas)"
      />
    </div>
  </header>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import { useMainStore } from '../../store/mainStore';
import StatusIndicator from './StatusIndicator.vue';
import Clock from './Clock.vue';
import RegionDropdown from '../Global/RegionDropdown.vue';

export default defineComponent({
  components: { StatusIndicator, Clock, RegionDropdown },

  setup() {
    return {
      store: useMainStore()
    };
  },

  computed: {
    onlineTrainsCount() {
      return this.store.trainList.filter((train) => train.region == this.store.region.id).length;
    },

    onlineDispatchersCount() {
      return this.store.activeSceneryList.filter(
        (scenery) => scenery.region == this.store.region.id && scenery.dispatcherId != -1
      ).length;
    },

    isChristmas() {
      const date = new Date();

      return date.getUTCMonth() == 11 && date.getUTCDate() >= 6 && date.getUTCDate() <= 31;
    }
  }
});
</script>

<style lang="scss" scoped>
@use '../../styles/responsive';

.app_header {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 0.5em;

  background-color: #2c2c2c;
}

.header-container {
  display: flex;
  align-items: center;
  padding: 0.25em;

  width: 100%;
  //   max-width: var(--max-container-width);
}
</style>
