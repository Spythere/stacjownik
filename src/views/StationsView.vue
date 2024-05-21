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

      <DonationModal :isModalOpen="isDonationModalOpen" @toggleModal="toggleDonationModal" />
      <StationTable @toggleDonationModal="toggleDonationModal" />
      <StationStats />
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import StationTable from '../components/StationsView/StationTable.vue';
import StationFilterCard from '../components/StationsView/StationFilterCard.vue';
import { useMainStore } from '../store/mainStore';
import DonationModal from '../components/Global/DonationModal.vue';
import StationStats from '../components/StationsView/StationStats.vue';
import { initFilters, setupFilters } from '../managers/stationFilterManager';
import { filterStations, sortStations } from '../scripts/utils/stationFilterUtils';
import { reactive } from 'vue';
import { provide } from 'vue';
import { ActiveSorter } from '../components/StationsView/typings';
import { onMounted } from 'vue';

const filterInitStates = { ...initFilters };

export default defineComponent({
  components: {
    StationTable,
    StationFilterCard,
    StationStats,
    DonationModal
  },

  data: () => ({
    filterCardOpen: false,
    isDonationModalOpen: false,

    mainStore: useMainStore()
  }),

  setup() {
    const filters = reactive(filterInitStates);
    const activeSorter = reactive({ headerName: 'station', dir: 1 }) as ActiveSorter;

    provide('StationsView_filters', filters);
    provide('StationsView_activeSorter', activeSorter);

    onMounted(() => {
      setupFilters(filters);
    });
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
  flex-wrap: wrap;
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
