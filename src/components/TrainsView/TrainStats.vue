<template>
  <div class="dropdown" @keydown.esc="showOptions = false" @focusout="showOptions = false">
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

        <div v-if="store.dataStatuses.trains == Status.Loaded && regionTrains.length > 0">
          <div class="top-list general">
            <transition-group tag="ul" name="stats-anim">
              <li class="badge" key="timetable-count">
                <span>{{ $t('train-stats.timetable-count') }}</span>
                <span>
                  <b>{{ regionTrainsWithTT.length }}</b>
                </span>
              </li>

              <li class="badge" key="avg-speed">
                <span>{{ $t('train-stats.avg-speed') }}</span>
                <span>
                  <b>{{ avgSpeed.toFixed(1) }} km/h</b>
                </span>
              </li>

              <li class="badge" key="avg-distance">
                <span>{{ $t('train-stats.avg-timetable') }}</span>
                <span>
                  <b>{{ avgDistance.toFixed(1) }} km</b>
                </span>
              </li>
            </transition-group>
          </div>

          <div class="top-list categories">
            <h3>{{ $t('train-stats.top-categories') }}</h3>

            <transition-group tag="ul" name="stats-anim">
              <li class="badge" v-for="top in topCategories" :key="top.name">
                <span>{{ top.name }}</span>
                <span>{{ top.count }}</span>
              </li>
            </transition-group>
          </div>

          <div class="top-list vehicles">
            <h3>{{ $t('train-stats.top-vehicles') }}</h3>

            <transition-group tag="ul" name="stats-anim">
              <li class="badge" v-for="top in topVehicles" :key="top.name">
                <span>{{ top.name }}</span>
                <span>{{ top.count }}</span>
              </li>
            </transition-group>
          </div>

          <div class="top-list vehicle-types">
            <h3>{{ $t('train-stats.top-units') }}</h3>

            <transition-group tag="ul" name="stats-anim">
              <li class="badge" v-for="top in topUnits" :key="top.name">
                <span>{{ top.name }}</span>
                <span>{{ top.count }}</span>
              </li>
            </transition-group>
          </div>
        </div>

        <div v-else-if="store.dataStatuses.trains != Status.Loaded">
          {{ $t('train-stats.stats-loading') }}
        </div>

        <div class="no-data" v-else>
          {{ $t('train-stats.none-stats') }}
        </div>
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useStore } from '../../store/mainStore';
import { Status } from '../../typings/common';

interface ITop {
  name: string;
  count: number;
}

export default defineComponent({
  data() {
    return {
      showOptions: false,
      store: useStore(),
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

    avgSpeed() {
      if (this.regionTrains.length == 0) return 0;

      return (
        this.regionTrains.reduce((acc, train) => (acc += train.speed), 0) / this.regionTrains.length
      );
    },

    avgDistance() {
      if (this.regionTrainsWithTT.length == 0) return 0;

      return (
        this.regionTrainsWithTT.reduce((acc, train) => {
          acc += train.timetableData!.routeDistance;

          return acc;
        }, 0) / this.regionTrainsWithTT.length
      );
    },

    topCategories() {
      return this.regionTrainsWithTT
        .reduce((acc, train) => {
          const topCategory = acc.find((top) => top.name == train.timetableData!.category);

          if (!topCategory) acc.push({ name: train.timetableData!.category, count: 1 });
          else topCategory.count++;

          return acc;
        }, [] as ITop[])
        .sort((c1, c2) => Math.sign(c2.count - c1.count))
        .slice(0, 5);
    },

    topVehicles() {
      return this.regionTrains
        .reduce((acc, train) => {
          const locoType = train.locoType.split('-')[0];
          const topVehicle = acc.find((top) => top.name == locoType);

          if (!topVehicle) acc.push({ name: locoType, count: 1 });
          else topVehicle.count++;

          return acc;
        }, [] as ITop[])
        .sort((c1, c2) => Math.sign(c2.count - c1.count))
        .slice(0, 8);
    },

    topUnits() {
      return this.regionTrains
        .reduce((acc, train) => {
          const locoType = train.locoType;
          const topVehicle = acc.find((top) => top.name == locoType);

          if (!topVehicle) acc.push({ name: locoType, count: 1 });
          else topVehicle.count++;

          return acc;
        }, [] as ITop[])
        .sort((c1, c2) => Math.sign(c2.count - c1.count))
        .slice(0, 5);
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

.badge {
  margin: 0;

  & > span:first-child {
    background-color: $accentCol;
    color: black;
  }
}

.dropdown_wrapper {
  max-width: 600px;
}

.stats-anim {
  &-move,
  &-enter-active,
  &-leave-active {
    transition: all 250ms ease;
  }

  &-enter-from,
  &-leave-to {
    opacity: 0;
    transform: translateX(5px);
  }

  &-leave-active {
    position: absolute;
  }
}
</style>
