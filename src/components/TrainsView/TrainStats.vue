<template>
  <div class="dropdown" @keydown.esc="showOptions = false" @focusout="showOptions = false">
    <div class="bg" v-if="showOptions" @click="showOptions = false"></div>

    <button class="filter-button btn--filled btn--image" @click="toggleShowOptions" ref="button">
      <img src="/images/icon-stats.svg" alt="Open filters icon" />
      STATYSTYKI
    </button>

    <transition name="dropdown-anim">
      <div class="dropdown_wrapper" v-if="showOptions">
        <h1 class="text--primary">
          <img src="/images/icon-stats.svg" alt="Open filters icon" />
          STATYSTYKI ONLINE
        </h1>

        <hr style="margin: 0.5em 0" />

        <div class="top-list">
          <transition-group tag="ul" name="stats-anim">
            <li class="badge" key="timetable-count">
              <span>AKTYWNE RJ</span>
              <span>
                <b>{{ timetableCount }}</b>
              </span>
            </li>

            <li class="badge" key="avg-speed">
              <span>ŚREDNIA PRĘDKOŚĆ</span>
              <span>
                <b>{{ avgSpeed.toFixed(1) }} km/h</b>
              </span>
            </li>

            <li class="badge" key="avg-speed">
              <span>ŚREDNI RJ</span>
              <span>
                <b>{{ avgDistance.toFixed(1) }} km</b>
              </span>
            </li>
          </transition-group>
        </div>

        <div class="top-list categories" v-if="store.dataStatuses.trains == 2">
          <h3>Najpopularniejsze kategorie RJ</h3>

          <transition-group tag="ul" name="stats-anim">
            <li class="badge" v-for="top in topCategories" :key="top.name">
              <span>{{ top.name }}</span>
              <span>{{ top.count }}</span>
            </li>
          </transition-group>
        </div>

        <div class="top-list vehicles" v-if="store.dataStatuses.trains == 2">
          <h3>Najpopularniejsze pojazdy</h3>

          <transition-group tag="ul" name="stats-anim">
            <li class="badge" v-for="top in topVehicles" :key="top.name">
              <span>{{ top.name }}</span>
              <span>{{ top.count }}</span>
            </li>
          </transition-group>
        </div>

        <div class="top-list vehicle-types" v-if="store.dataStatuses.trains == 2">
          <h3>Najpopularniejsze jednostki</h3>

          <transition-group tag="ul" name="stats-anim">
            <li class="badge" v-for="top in topUnits" :key="top.name">
              <span>{{ top.name }}</span>
              <span>{{ top.count }}</span>
            </li>
          </transition-group>
        </div>
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useStore } from '../../store/mainStore';

interface ITop {
  name: string;
  count: number;
}

export default defineComponent({
  data() {
    return {
      showOptions: false,
      store: useStore()
    };
  },

  computed: {
    regionTrains() {
      return this.store.trainList.filter((train) => train.region == this.store.region.id);
    },

    regionTrainsWithTT() {
      return this.regionTrains.filter((train) => train.timetableData);
    },

    timetableCount() {
      return this.regionTrainsWithTT.length;
    },

    avgSpeed() {
      if (this.regionTrains.length == 0) return 0;

      return (
        this.regionTrains.reduce((acc, train) => (acc += train.speed), 0) / this.regionTrains.length
      );
    },

    avgDistance() {
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
