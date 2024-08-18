<template>
  <div
    class="dropdown"
    @keydown.esc="showDropdown = false"
    v-click-outside="() => (showDropdown = false)"
  >
    <div class="bg" v-if="showDropdown" @click="showDropdown = false"></div>

    <button class="filter-button btn--filled btn--image" @click="toggleDropdown" ref="button">
      <img src="/images/icon-stats.svg" alt="Open filters icon" />
      <!-- {{ $t('train-stats.stats-button') }} -->
      <span>STATYSTYKI</span>
    </button>

    <transition name="dropdown-anim">
      <div class="dropdown_wrapper" v-if="showDropdown">
        <div>
          <h1 class="text--primary">
            <img src="/images/icon-stats.svg" alt="Open filters icon" />
            {{ $t('train-stats.title') }}
          </h1>

          <hr style="margin: 0.5em 0" />

          <div>
            <div>
              <span
                >{{ $t('station-stats.u-factor') }}
                <a
                  href="https://td2.info.pl/dyskusje/wspolczynnik-ugla-czy-to-ma-sens/msg81011/#msg81011"
                  target="_blank"
                  :data-tooltip="$t('station-stats.u-factor-tooltip')"
                  >(?)</a
                >:
              </span>
              <b class="u-factor" :style="calculateFactorStyle()">
                {{ uFactor.toFixed(2) }}
              </b>
            </div>
            <div>
              {{ $t('station-stats.avg-timetable-count') }}
              <b>{{ avgTimetableCount.toFixed(2) }}</b>
            </div>
            <div>
              {{ $t('station-stats.single-track-count') }}
              <b>{{ trackCount.oneWay }}</b> (<b>{{ trackCount.oneWayElectric }} ⚡</b>)
            </div>
            <div>
              {{ $t('station-stats.double-track-count') }}
              <b>{{ trackCount.twoWay }}</b>
              (<b>{{ trackCount.twoWayElectric }} ⚡</b>)
            </div>
            <div>
              {{ $t('station-stats.cross-sceneries') }}
              <b>{{ trackCount.crossTrack }}</b> (<b>{{ trackCount.crossTrackElectric }} ⚡</b>)
            </div>
            <div>
              {{ $t('station-stats.open-spawns') }} <b>{{ spawnCount.passenger }}</b> - PAS /
              <b>{{ spawnCount.freight }}</b> - TOW / <b>{{ spawnCount.loco }}</b> - LUZ /
              <b>{{ spawnCount.all }}</b> - ALL
            </div>
          </div>
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
      if (this.uFactor == 0) return '';

      const norm = this.uFactor == 0 ? 1 : Math.max(Math.min(this.uFactor / 2, 1), 0);
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

      return activeDispatchers.length != 0 ? activeTrains.length / activeDispatchers.length : 0;
    },

    avgTimetableCount() {
      const regionSceneries = this.mainStore.activeSceneryList.filter((sc) => {
        return sc.region == this.mainStore.region.id;
      });

      const timetableCountSum = regionSceneries.reduce((acc, sc) => {
        acc += sc.scheduledTrainCount.all;
        return acc;
      }, 0);

      if (regionSceneries.length == 0) return 0;

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
            crossTrackElectric: 0
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
@import '../../styles/dropdown.scss';

h1 img {
  vertical-align: text-bottom;
}

h3 {
  margin: 0.5em 0;
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

@include smallScreen {
  .filter-button span {
    display: none;
  }
}
</style>
