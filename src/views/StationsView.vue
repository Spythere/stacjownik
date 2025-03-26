<template>
  <section class="stations-view">
    <div class="wrapper">
      <div class="stations-options">
        <StationFilterCard
          :showCard="filterCardOpen"
          :exit="filterCardOpen = false"
          ref="filterCardRef"
        />

        <StationStats />

        <button
          class="btn-donation btn--image"
          ref="btn"
          @click="isDonationCardOpen = true"
          @focus="isDonationCardOpen = false"
        >
          <img src="/images/icon-dollar.svg" alt="dollar donation icon" />
          <span>{{ $t('donations.button-title') }}</span>
        </button>
      </div>

      <DonationCard :is-card-open="isDonationCardOpen" @toggle-card="toggleDonationCard" />
      <StationTable @toggle-donation-card="toggleDonationCard" />
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import StationTable from '../components/StationsView/StationTable.vue';
import StationFilterCard from '../components/StationsView/StationFilterCard.vue';
import { useMainStore } from '../store/mainStore';
import DonationCard from '../components/Global/DonationCard.vue';
import StationStats from '../components/StationsView/StationStats.vue';
import { initFilters, setupFilters } from '../managers/stationFilterManager';
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
    DonationCard
  },

  data: () => ({
    filterCardOpen: false,
    isDonationCardOpen: false,

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
    toggleDonationCard(value: boolean) {
      this.isDonationCardOpen = value;
    }
  }
});
</script>

<style lang="scss" scoped>
@use '../styles/responsive';

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
  flex-wrap: wrap;
  gap: 0.5em;

  position: relative;
  margin-bottom: 0.5em;
}

button.btn-donation {
  margin-left: auto;

  $btnColor: #254069;

  background-color: $btnColor;

  &:hover {
    background-color: lighten($btnColor, 5%);
  }

  @include responsive.smallScreen{
    span {
      display: none;
    }
  }
}

.count {
  padding: 0.5em;
}
</style>
