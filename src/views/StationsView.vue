<template>
  <section class="stations-view">
    <div class="wrapper">
      <div class="stations-options">
        <StationFilterCard
          :showCard="filterCardOpen"
          :exit="(filterCardOpen = false)"
          ref="filterCardRef"
        />

        <button
          class="btn-donation btn--image"
          ref="btn"
          @click="isDonationModalOpen = true"
          @focus="isDonationModalOpen = false"
        >
          <img src="/images/icon-dollar.svg" alt="dollar donation icon" />
          <span>{{ $t('donations.button-title') }}</span>
        </button>
      </div>

      <Donation :isModalOpen="isDonationModalOpen" @toggleModal="toggleDonationModal" />
      <StationTable @toggleDonationModal="toggleDonationModal" />
      <StationStats />
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
import StationStats from '../components/StationsView/StationStats.vue';

export default defineComponent({
  components: {
    StationTable,
    StationFilterCard,
    StationStats,
    Donation
  },

  data: () => ({
    filterCardOpen: false,
    isDonationModalOpen: false,

    filterStore: useStationFiltersStore(),
    store: useMainStore()
  }),

  mounted() {
    this.filterStore.setupFilters();
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

button.btn-donation {
  $btnColor: #254069;

  background-color: $btnColor;

  &:hover {
    background-color: lighten($btnColor, 5%);
  }

  @include smallScreen {
    span {
      display: none;
    }
  }
}
</style>
