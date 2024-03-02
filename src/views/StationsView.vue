<template>
  <section class="stations-view">
    <div class="wrapper">
      <div class="stations-options">
        <StationFilterCard
          :showCard="filterCardOpen"
          :exit="(filterCardOpen = false)"
          ref="filterCardRef"
        />

        <Donation :isModalOpen="isDonationModalOpen" @toggleModal="toggleDonationModal" />
      </div>

      <StationTable :stations="computedStationList" @toggleDonationModal="toggleDonationModal" />
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import StationTable from '../components/StationsView/StationTable.vue';
import StationFilterCard from '../components/StationsView/StationFilterCard.vue';
import { useStationFiltersStore } from '../store/stationFiltersStore';
import { useMainStore } from '../store/mainStore';
import Donation from '../components/Global/Donation.vue';

export default defineComponent({
  components: {
    StationTable,
    StationFilterCard,
    Donation
  },

  data: () => ({
    filterCardOpen: false,
    modalHidden: true,
    STORAGE_KEY: 'options_saved',
    focusedStationName: '',
    filterStore: useStationFiltersStore(),
    store: useMainStore(),

    isDonationModalOpen: false
  }),

  mounted() {
    this.filterStore.setupFilters();
  },

  computed: {
    computedStationList() {
      return this.filterStore.filteredStationList;
    }
  },

  methods: {
    toggleDonationModal(value: boolean) {
      this.isDonationModalOpen = value;
    }
  }
});
</script>

<style lang="scss" scoped>
@import '../styles/variables.scss';
@import '../styles/responsive.scss';

@keyframes blinkAnim {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0;
  }
}

.indicator-anim {
  &-enter-active,
  &-leave-active {
    transition: all 0.25s ease-in-out;
  }

  &-enter,
  &-leave-to {
    transform: translateY(100%);
    opacity: 0;
  }
}

.stations-view {
  position: relative;
  display: flex;
  justify-content: center;

  padding: 1em 0;
  min-height: 100%;
}

.wrapper {
  max-width: 100%;
  width: var(--max-container-width);
}

.stations-options {
  display: flex;
  justify-content: space-between;
  gap: 0.5em;

  margin-bottom: 0.5em;
}
</style>
