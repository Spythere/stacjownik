<template>
  <div class="train-stats" v-click-outside="closeStats">
    <action-button class="stats_button" @click="toggleStatsOpen">
      <img :src="statsIcon" :alt="$t('trains.stats')" />
      <p>{{ $t("trains.stats") }}</p>
    </action-button>

    <transition name="stats-anim" class="stats_wrapper" tag="div">
      <div class="stats-body" v-if="trainStatsOpen">
        <h2 class="stats-header">
          <img :src="statsIcon" :alt="$t('trains.stats')" />
          {{ $t("trains.stats") }}
        </h2>

        <div class="stats-speed">
          <div class="title stats-title">
            {{ $t("trains.stats-speed") }}
          </div>
          <div class="stats-content">
            {{ speedStats.min }} | {{ speedStats.avg }} | {{ speedStats.max }}
          </div>
        </div>

        <div class="stats-length">
          <div class="title stats-title">
            {{ $t("trains.stats-length") }}
          </div>
          <div class="stats-content">
            {{ timetableStats.min }} | {{ timetableStats.avg }} |
            {{ timetableStats.max }}
          </div>
        </div>

        <div class="stats-categories">
          <div class="title stats-title">
            {{ $t("trains.stats-categories") }}
          </div>

          <div class="category-list">
            <span
              class="category"
              v-for="[key, value] of categoryList"
              :key="key"
            >
              <span class="category-type">{{ key }}</span>
              <span class="category-count">{{ value }}</span>
            </span>
          </div>

          <div class="special-list">
            <span class="special twr">
              <span class="special-type">{{
                $t("trains.stats-special-twr")
              }}</span>
              <span class="special-count">{{ specialTrainCount[0] }}</span>
            </span>

            <span class="special skr">
              <span class="special-type">{{
                $t("trains.stats-special-skr")
              }}</span>
              <span class="special-count">{{ specialTrainCount[1] }}</span>
            </span>
          </div>
        </div>

        <div class="stats-locos">
          <div class="title stats-title">{{ $t("trains.stats-locos") }}</div>

          <div class="loco-list stats-content">
            <div class="loco-item" v-for="(loco, i) in locoList" :key="i">
              {{ loco[0] }} | {{ loco[1] }}
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import ActionButton from "@/components/Global/ActionButton.vue";

import Train from "@/scripts/interfaces/Train";
import { computed, defineComponent } from "@vue/runtime-core";

export default defineComponent({
  components: { ActionButton },
  props: {
    trains: {
      type: Array as () => Train[],
      required: true,
    },
  },

  data: () => ({
    trainStatsOpen: false,
    statsIcon: require("@/assets/icon-stats.svg"),
  }),

  methods: {
    toggleStatsOpen() {
      this.trainStatsOpen = !this.trainStatsOpen;
    },

    closeStats() {
      this.trainStatsOpen = false;
    },
  },

  setup(props) {
    const speedStats = computed(() => {
      if (props.trains.length == 0) return { avg: "0", min: "0", max: "0" };

      const avg = (
        props.trains.reduce((acc, train) => acc + train.speed, 0) /
        props.trains.length
      ).toFixed(2);

      const minMaxSpeed = props.trains.reduce((acc, train) => {
        if (!train.timetableData) return acc;

        acc[0] = !acc[0] || train.speed < acc[0] ? train.speed : acc[0];

        acc[1] = !acc[1] || train.speed > acc[1] ? train.speed : acc[1];
        return acc;
      }, [] as any);

      return {
        avg,
        min: minMaxSpeed[0].toString(),
        max: minMaxSpeed[1].toString(),
      };
    });

    const timetableStats = computed(() => {
      if (props.trains.length == 0) return { avg: "0", min: "0", max: "0" };

      const avg = (
        props.trains.reduce(
          (acc, train) =>
            train.timetableData ? acc + train.timetableData.routeDistance : acc,
          0
        ) / props.trains.length
      ).toFixed(2);

      const minMaxDistance = props.trains.reduce((acc, train) => {
        if (!train.timetableData) return acc;

        acc[0] =
          !acc[0] || train.timetableData.routeDistance < acc[0]
            ? train.timetableData.routeDistance
            : acc[0];

        acc[1] =
          !acc[1] || train.timetableData.routeDistance > acc[1]
            ? train.timetableData.routeDistance
            : acc[1];
        return acc;
      }, [] as any);

      return {
        avg,
        min: minMaxDistance[0].toString(),
        max: minMaxDistance[1].toString(),
      };
    });

    const categoryList = computed(() => {
      const map = props.trains.reduce((acc, train) => {
        if (!train.timetableData || !train.timetableData.category) return acc;

        acc.set(
          train.timetableData.category,
          acc.get(train.timetableData.category)
            ? acc.get(train.timetableData.category) + 1
            : 1
        );

        return acc;
      }, new Map());

      return new Map([...map.entries()].sort((a, b) => b[1] - a[1]));
    });

    const locoList = computed(() => {
      const map: Map<string, number> = props.trains.reduce((acc, train) => {
        if (!train.timetableData || !train.locoType) return acc;

        acc.set(
          train.locoType,
          acc.get(train.locoType) ? acc.get(train.locoType) + 1 : 1
        );

        return acc;
      }, new Map());

      const sorted = [...map.entries()]
        .sort((a, b) => b[1] - a[1])
        .filter((v, i) => i < 3);

      return sorted;
    });

    const specialTrainCount = computed(() => {
      const twrList = props.trains.filter(
        (train) => train.timetableData && train.timetableData.TWR
      );
      const skrList = props.trains.filter(
        (train) => train.timetableData && train.timetableData.SKR
      );

      return [twrList.length, skrList.length];
    });

    return {
      speedStats,
      timetableStats,
      categoryList,
      locoList,
      specialTrainCount,
    };
  },
});
</script>

<style lang="scss" scoped>
@import "../../styles/responsive";

.stats-anim {
  &-enter-active,
  &-leave-active {
    transition: all 150ms ease-out;
  }

  &-enter-from,
  &-leave-to {
    opacity: 0;
    transform: translateY(30px);
  }
}

.train-stats {
  position: relative;
  top: 0;
  z-index: 99;
}

.stats {
  &_wrapper {
    margin-bottom: 0.5em;
    outline: none;
  }

  &-header {
    display: flex;
    margin-bottom: 0.85em;

    img {
      vertical-align: middle;
      margin-right: 0.35em;
    }
  }

  &-body {
    position: absolute;
    display: inline-block;
    max-width: 700px;
    width: 100%;

    top: 100%;
    left: 0;

    background: #222;
    border-radius: 0 1em 1em 1em;

    padding: 1em;
  }

  &-content {
    color: #ddd;
  }
}

.category,
.special {
  &-list {
    display: flex;
    flex-wrap: wrap;
  }

  margin-right: 0.4em;
  margin-bottom: 0.4em;

  &-type,
  &-count {
    display: inline-block;
    padding: 0.2em 0.4em;
  }

  &-type {
    background: #585858;
    font-weight: 600;
  }

  &-count {
    background: #ffc014;
    color: black;
  }
}

.special {
  &-list {
    font-size: 0.85em;
  }

  &-count {
    background: gray;
    color: white;
  }

  &.twr > &-type {
    background-color: var(--clr-twr);

    color: black;
  }

  &.skr > &-type {
    background-color: var(--clr-skr);

    color: white;
  }
}

.warning {
  display: inline-block;
  margin-right: 0.4em;
  padding: 0.2em 0.3em;

  color: black;
  font-weight: bold;
  font-size: 0.85em;
}

@include smallScreen {
  .stats-body {
    display: block;
    width: 100%;

    border-radius: 0 0 1em 1em;
  }

  .stats_button {
    margin: 0 auto;
  }
}
</style>