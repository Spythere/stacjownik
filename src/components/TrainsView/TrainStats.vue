<template>
  <div
    class="dropdown"
    @keydown.esc="showOptions = false"
    v-click-outside="() => (showOptions = false)"
  >
    <div class="bg" v-if="showOptions" @click="showOptions = false"></div>

    <button class="filter-button btn--filled btn--image" @click="toggleShowOptions" ref="button">
      <img src="/images/icon-stats.svg" alt="Open filters icon" />
      {{ $t('train-stats.stats-button') }}
    </button>

    <transition name="dropdown-anim">
      <div class="dropdown_wrapper" v-if="showOptions">
        <h1 class="text--primary">
          <img src="/images/icon-stats.svg" alt="Open filters icon" />
          {{ $t('train-stats.title') }}
        </h1>

        <hr style="margin: 0.5em 0" />

        <div v-if="apiStore.dataStatuses.connection == Status.Loaded && regionTrains.length > 0">
          <div class="top-list general">
            <transition-group tag="ul" name="stats-anim">
              <li class="badge stat-badge" key="timetable-count">
                <span>{{ $t('train-stats.timetable-count') }}</span>
                <span>
                  <b>{{ regionTrainsWithTT.length }}</b>
                </span>
              </li>

              <li class="badge stat-badge" key="avg-speed">
                <span>{{ $t('train-stats.avg-speed') }}</span>
                <span>
                  <b>{{ stats.avgSpeed.toFixed(1) }} km/h</b>
                </span>
              </li>

              <li class="badge stat-badge" key="avg-distance">
                <span>{{ $t('train-stats.avg-timetable') }}</span>
                <span>
                  <b>{{ stats.avgDistance.toFixed(1) }} km</b>
                </span>
              </li>
            </transition-group>
          </div>

          <div class="top-list categories">
            <h3>{{ $t('train-stats.top-categories') }}</h3>

            <transition-group tag="ul" name="stats-anim">
              <li class="badge stat-badge" v-for="top in stats.topCategories" :key="top.name">
                <span>{{ top.name }}</span>
                <span>{{ top.count }}</span>
              </li>
            </transition-group>

            <span class="no-data" v-if="stats.topCategories.length == 0">
              {{ $t('train-stats.no-timetables') }}
            </span>
          </div>

          <div class="top-list vehicles">
            <h3>{{ $t('train-stats.top-vehicles') }}</h3>

            <transition-group tag="ul" name="stats-anim">
              <li class="badge stat-badge" v-for="top in stats.topVehicles" :key="top.name">
                <span>{{ top.name }}</span>
                <span>{{ top.count }}</span>
              </li>
            </transition-group>

            <span class="no-data" v-if="stats.topVehicles.length == 0">
              {{ $t('train-stats.no-vehicles') }}
            </span>
          </div>

          <div class="top-list vehicle-types">
            <h3>{{ $t('train-stats.top-units') }}</h3>

            <transition-group tag="ul" name="stats-anim">
              <li class="badge stat-badge" v-for="top in stats.topUnits.slice(0, 7)" :key="top.name">
                <span>{{ top.name }}</span>
                <span>{{ top.count }}</span>
              </li>
            </transition-group>

            <span class="no-data" v-if="stats.topUnits.length == 0">
              {{ $t('train-stats.no-units') }}
            </span>
          </div>
        </div>

        <div v-else-if="apiStore.dataStatuses.connection != Status.Loaded">
          {{ $t('train-stats.stats-loading') }}
        </div>

        <div class="no-data" v-else>
          {{ $t('train-stats.no-stats') }}
        </div>

        <div tabindex="0" @focus="() => (showOptions = false)"></div>
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useMainStore } from '../../store/mainStore';
import { Status } from '../../typings/common';
import { useApiStore } from '../../store/apiStore';

interface ITop {
  name: string;
  count: number;
}

interface IStats {
  timetableCount: number;
  avgSpeed: number;
  avgDistance: number;
  topCategories: ITop[];
  topVehicles: ITop[];
  topUnits: ITop[];
}

function compareTop(top1: ITop, top2: ITop) {
  return Math.sign(top2.count - top1.count) || top1.name.localeCompare(top2.name, 'pl-PL');
}

export default defineComponent({
  data() {
    return {
      showOptions: false,
      store: useMainStore(),
      apiStore: useApiStore(),
      Status: Status.Data
    };
  },

  computed: {
    regionTrains() {
      return this.store.trainList.filter((train) => train.region == this.store.region.id);
    },

    regionTrainsWithTT() {
      return this.regionTrains.filter((train) => train.timetableData);
    },

    stats() {
      const stats = this.regionTrains.reduce(
        (acc, train, i, arr) => {
          // AVG SPEED
          acc.avgSpeed += train.speed / arr.length;

          // TOP VEHICLES
          const locoType = train.locoType.split('-')[0];
          const topVehicle = acc.topVehicles.find((top) => top.name == locoType);

          if (!topVehicle) acc.topVehicles.push({ name: locoType, count: 1 });
          else topVehicle.count++;

          // TOP UNITS
          const unitType = train.locoType;
          const topUnit = acc.topUnits.find((top) => top.name == unitType);

          if (!topUnit) acc.topUnits.push({ name: unitType, count: 1 });
          else topUnit.count++;

          if (train.timetableData !== undefined) {
            acc.timetableCount++;
            // AVG DISTANCE
            acc.avgDistance += train.timetableData.routeDistance;

            // TOP CATEGORIES
            const topCategory = acc.topCategories.find(
              (top) => top.name == train.timetableData!.category
            );

            if (!topCategory)
              acc.topCategories.push({ name: train.timetableData!.category, count: 1 });
            else topCategory.count++;
          }

          if (i == arr.length - 1 && acc.timetableCount != 0) {
            acc.avgDistance /= acc.timetableCount;
          }

          return acc;
        },
        {
          timetableCount: 0,
          avgDistance: 0,
          avgSpeed: 0,
          topCategories: [],
          topUnits: [],
          topVehicles: []
        } as IStats
      );

      stats.topCategories.sort(compareTop);
      stats.topUnits.sort(compareTop);
      stats.topVehicles.sort(compareTop);

      return stats;
    }
  },

  methods: {
    toggleShowOptions() {
      this.showOptions = !this.showOptions;

      this.$nextTick(() => {
        if (this.showOptions) (this.$refs['button'] as HTMLButtonElement)?.focus();
      });
    }
  }
});
</script>

<style lang="scss" scoped>
@import '../../styles/dropdown.scss';
@import '../../styles/badge.scss';
@import '../../styles/responsive.scss';

h1 img {
  vertical-align: text-bottom;
}

h3 {
  margin: 0.5em 0;
}

.no-data {
  font-size: 1.1em;
  color: #ccc;
}

.top-list ul {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5em;
}

.dropdown_wrapper {
  max-width: 600px;
}

@include smallScreen {
  h1,
  .no-data {
    text-align: center;
  }
}
</style>
