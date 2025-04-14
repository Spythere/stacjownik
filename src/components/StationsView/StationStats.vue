<template>
  <div
    class="dropdown"
    @keydown.esc="showDropdown = false"
    v-click-outside="() => (showDropdown = false)"
  >
    <div class="bg" v-if="showDropdown" @click="showDropdown = false"></div>

    <button class="filter-button btn--filled btn--image" @click="toggleDropdown" ref="button">
      <img src="/images/icon-stats.svg" alt="Open filters icon" />
      {{ $t('station-stats.stats-button') }}
    </button>

    <transition name="dropdown-anim">
      <div class="dropdown_wrapper" v-if="showDropdown">
        <div>
          <h1 class="stats-title text--primary">
            <img src="/images/icon-stats.svg" alt="Open filters icon" />
            {{ $t('station-stats.title') }}
          </h1>

          <hr style="margin: 0.5em 0" />

          <div v-if="uFactor > -1 || avgTimetableCount > -1 || trackCount.all > 0">
            <div class="badges-container">
              <div class="badge stat-badge">
                <span>
                  {{ $t('station-stats.u-factor') }}
                  <a
                    href="https://td2.info.pl/dyskusje/wspolczynnik-ugla-czy-to-ma-sens/msg81011/#msg81011"
                    target="_blank"
                    :data-tooltip="$t('station-stats.u-factor-tooltip')"
                    >(?)</a
                  >:
                </span>

                <span>
                  <b class="u-factor" :style="calculateFactorStyle()">
                    {{ uFactor >= 0 ? uFactor.toFixed(2) : '---' }}
                  </b>
                </span>
              </div>

              <div class="badge stat-badge">
                <span>{{ $t('station-stats.avg-timetable-count') }}</span>
                <span>
                  <b>{{ avgTimetableCount >= 0 ? avgTimetableCount.toFixed(2) : '---' }}</b>
                </span>
              </div>
            </div>

            <hr style="margin: 0.5em 0" />

            <div class="badges-container">
              <div class="badge stat-badge">
                <span>{{ $t('station-stats.single-track-count') }}</span>
                <span>
                  <b> {{ trackCount.oneWay }}</b> (<b>{{ trackCount.oneWayElectric }} ⚡</b>)
                </span>
              </div>

              <div class="badge stat-badge">
                <span>{{ $t('station-stats.double-track-count') }}</span>
                <span>
                  <b>{{ trackCount.twoWay }}</b> (<b>{{ trackCount.twoWayElectric }} ⚡</b>)
                </span>
              </div>

              <div class="badge stat-badge">
                <span> {{ $t('station-stats.cross-sceneries') }}</span>
                <span>
                  <b>{{ trackCount.crossTrack }}</b> (<b>{{ trackCount.crossTrackElectric }} ⚡</b>)
                </span>
              </div>
            </div>

            <hr style="margin: 0.5em 0" />

            <div class="badges-container">
              <div class="badge stat-badge">
                <span> {{ $t('station-stats.open-spawns-all') }}</span>
                <span>
                  <b>{{ spawnCount.all }}</b>
                </span>
              </div>

              <div class="badge stat-badge">
                <span> {{ $t('station-stats.open-spawns-pas') }}</span>
                <span>
                  <b>{{ spawnCount.passenger }}</b>
                </span>
              </div>

              <div class="badge stat-badge">
                <span> {{ $t('station-stats.open-spawns-freight') }}</span>
                <span>
                  <b>{{ spawnCount.freight }}</b>
                </span>
              </div>

              <div class="badge stat-badge">
                <span> {{ $t('station-stats.open-spawns-loco') }}</span>
                <span>
                  <b>{{ spawnCount.loco }}</b>
                </span>
              </div>
            </div>
          </div>

          <div v-else>{{ $t('station-stats.no-stats') }}</div>
        </div>

        <div tabindex="0" @focus="() => (showDropdown = false)"></div>
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useMainStore } from '../../store/mainStore';

export default defineComponent({
  data() {
    return {
      mainStore: useMainStore(),
      showDropdown: false
    };
  },

  methods: {
    toggleDropdown() {
      this.showDropdown = !this.showDropdown;
    },

    calculateFactorStyle() {
      if (this.uFactor <= 0) return '';

      const norm = Math.max(Math.min(this.uFactor / 2, 1), 0);
      const lerp = 120 * norm;

      return `color: hsl(${lerp}, 100%, 60%)`;
    }
  },

  computed: {
    uFactor() {
      const activeDispatchers = this.mainStore.activeSceneryList.filter(
        (scenery) => scenery.region == this.mainStore.region.id && scenery.dispatcherId != -1
      );

      const activeTrains = this.mainStore.trainList.filter(
        (train) => train.region == this.mainStore.region.id
      );

      return activeDispatchers.length != 0 ? activeTrains.length / activeDispatchers.length : -1;
    },

    avgTimetableCount() {
      const regionSceneries = this.mainStore.activeSceneryList.filter((sc) => {
        return sc.region == this.mainStore.region.id;
      });

      const timetableCountSum = regionSceneries.reduce((acc, sc) => {
        acc += sc.scheduledTrainCount.all;
        return acc;
      }, 0);

      if (regionSceneries.length == 0) return -1;

      return timetableCountSum / regionSceneries.length;
    },

    trackCount() {
      return this.mainStore.allStationInfo
        .filter(
          (st) =>
            st.onlineInfo?.dispatcherId != -1 &&
            st.onlineInfo?.region == this.mainStore.region.id &&
            st.generalInfo?.routes
        )
        .reduce(
          (acc, st) => {
            const { routes } = st.generalInfo!;

            acc.all++;

            if (
              routes.single.filter((r) => !r.isInternal).length > 0 &&
              routes.double.filter((r) => !r.isInternal).length > 0
            ) {
              acc.crossTrack++;

              if (
                routes.single.some((r) => r.isElectric) &&
                routes.double.some((r) => r.isElectric)
              )
                acc.crossTrackElectric++;
            }

            [...routes.single, ...routes.double].forEach((r) => {
              if (r.isInternal) return;

              acc[r.routeTracks == 2 ? 'twoWay' : 'oneWay'] += 1;
              if (r.isElectric) acc[r.routeTracks == 2 ? 'twoWayElectric' : 'oneWayElectric'] += 1;
            });

            return acc;
          },
          {
            oneWay: 0,
            oneWayElectric: 0,
            twoWay: 0,
            twoWayElectric: 0,
            crossTrack: 0,
            crossTrackElectric: 0,
            all: 0
          }
        );
    },

    spawnCount() {
      return this.mainStore.activeSceneryList.reduce(
        (acc, scenery) => {
          if (scenery.region != this.mainStore.region.id) return acc;

          scenery.spawns.forEach((spawn) => {
            if (/EZT|POS|OSOB/i.test(spawn.spawnName)) acc['passenger'] += 1;
            if (/TOW/i.test(spawn.spawnName)) acc['freight'] += 1;
            if (/LUZ|SM/i.test(spawn.spawnName)) acc['loco'] += 1;
            if (/ALL/i.test(spawn.spawnName)) acc['all'] += 1;
          });

          return acc;
        },
        { passenger: 0, freight: 0, loco: 0, all: 0 }
      );
    }
  }
});
</script>

<style lang="scss" scoped>
@use '../../styles/dropdown';
@use '../../styles/badge';
@use '../../styles/responsive';

h1.stats-title img {
  vertical-align: text-bottom;
}

.badges-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5em;
}

.u-factor {
  [data-factor-low='true'] {
    color: #ddd;
  }

  [data-factor-mediocre='true'] {
    color: lightgreen;
  }

  [data-factor-high='true'] {
    color: greenyellow;
  }

  [data-factor-highest='true'] {
    color: rgb(22, 245, 22);
  }
}

@include responsive.smallScreen {
  h1.stats-title {
    text-align: center;
  }
}
</style>
