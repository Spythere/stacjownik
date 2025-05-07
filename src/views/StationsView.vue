<template>
  <section class="stations-view">
    <div class="wrapper">
      <div class="stations-topbar">
        <div class="topbar-cards">
          <StationFilterCard
            :showCard="filterCardOpen"
            :exit="filterCardOpen = false"
            ref="filterCardRef"
          />

          <StationStats />
        </div>

        <div class="topbar-links">
          <a
            class="a-button btn--image gnr-link"
            href="https://generator-td2.web.app/"
            target="_blank"
            data-tooltip-type="HtmlTooltip"
            :data-tooltip-content="`<b>${$t('app.gnr-link-content')}</b>`"
          >
            <img src="/images/icon-gnr.svg" alt="GeneraTOR app icon" />
          </a>

          <a
            class="a-button btn--image pojazdownik-link"
            href="https://pojazdownik-td2.web.app/"
            target="_blank"
            data-tooltip-type="HtmlTooltip"
            :data-tooltip-content="`<b>${$t('app.pojazdownik-link-content')}</b>`"
          >
            <img src="/images/icon-pojazdownik.svg" alt="Pojazdownik app icon" />
          </a>

          <button
            class="btn--image donation-button"
            ref="btn"
            @click="isDonationCardOpen = true"
            @focus="isDonationCardOpen = false"
          >
            <img src="/images/icon-diamond.svg" alt="dollar donation icon" />
            <span>{{ $t('donations.button-title') }}</span>
          </button>
        </div>
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

.stations-topbar {
  display: flex;
  gap: 0.5em;
  justify-content: space-between;

  position: relative;
  margin-bottom: 0.5em;

  & > div {
    display: flex;
    gap: 0.5em;
  }
}

button.donation-button {
  margin-left: auto;
  background: #833ab4;
  background: linear-gradient(
    120deg,
    rgba(131, 58, 180, 1) 0%,
    rgba(253, 29, 29, 1) 50%,
    rgba(131, 58, 180, 1) 100%
  );
  transition: background 300ms;
  background-size: 300%;

  &:hover {
    background-size: 100%;
  }
}

a.pojazdownik-link {
  background-color: #1f263b;

  &:hover {
    background-color: #2e3958;
  }
}

a.gnr-link {
  background-color: #141414;

  &:hover {
    background-color: #222222;
  }
}

@media only screen and (max-width: 900px) {
  .topbar-links > * > span {
    display: none;
  }
}
</style>
