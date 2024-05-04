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

      <div class="stations-stats">
        <hr style="margin: 0.5em 0" />
        Średnia liczba rozkładów jazdy na dyżurnego: <b>{{ avgTimetableCount }}</b> | Dostępne
        szlaki 1-torowe: <b>{{ oneWayTracks }}</b> (zelektr.) / <b>{{ 0 }}</b> (spalinowe) |
        Dostępne szlaki 2-torowe: <b>{{ 0 }}</b> (zelektr.) / <b>{{ 0 }}</b> (spalinowe) | Otwarte
        spawny: <b>{{ 0 }}</b> (PAS.) / <b>{{ 0 }}</b> (TOW.) / <b>{{ 0 }}</b> (LUZ.)
      </div>
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
    avgTimetableCount() {
      const scheduledTrainsTotal = this.store.activeSceneryList.reduce<number>((acc, sc) => {
        if (sc.region != 'eu') return acc;

        acc += sc.scheduledTrainCount.all;

        return acc;
      }, 0);

      return (
        this.store.activeSceneryList.length != 0
          ? scheduledTrainsTotal / this.store.activeSceneryList.length
          : 0
      ).toFixed(2);
    },

    oneWayTracks() {
      // return this.computedStationList
      //   .filter((st) => st.onlineInfo && st.generalInfo?.routes.single)
      //   .map((st) => st.generalInfo!.routes.single.map((r) => r.routeName))
      //   .join(', ');

      return [];
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

.stations-stats {
  text-align: center;
  color: #ccc;
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
