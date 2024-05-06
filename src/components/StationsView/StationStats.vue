<template>
  <div class="station-stats">
    <div class="separator" />
    <div>
      {{ $t('station-stats.u-factor') }}
      <a
        href="https://td2.info.pl/dyskusje/wspolczynnik-ugla-czy-to-ma-sens/msg81011/#msg81011"
        target="_blank"
        :data-tooltip="$t('station-stats.u-factor-tooltip')"
        >(?)</a
      >:
      <b :style="calculateFactorStyle()">
        {{ uFactor.toFixed(2) }}
      </b>
      | {{ $t('station-stats.avg-timetable-count') }}
      <b>{{ avgTimetableCount.toFixed(2) }}</b>
    </div>
    <div>
      {{ $t('station-stats.single-track-count') }}
      <b>{{ trackCount.oneWayElectric }}</b> {{ $t('station-stats.electrified') }} /
      <b>{{ trackCount.oneWayOther }}</b> {{ $t('station-stats.not-electrified') }} |
      {{ $t('station-stats.double-track-count') }} <b>{{ trackCount.twoWayElectric }}</b>
      {{ $t('station-stats.electrified') }} / <b>{{ trackCount.twoWayOther }}</b>
      {{ $t('station-stats.not-electrified') }} | {{ $t('station-stats.open-spawns') }}
      <b>{{ spawnCount.passenger }}</b> - PAS / <b>{{ spawnCount.freight }}</b> - TOW /
      <b>{{ spawnCount.loco }}</b> - LUZ / <b>{{ spawnCount.all }}</b> - ALL
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useMainStore } from '../../store/mainStore';

export default defineComponent({
  data() {
    return {
      mainStore: useMainStore()
    };
  },

  methods: {
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
      const scheduledTrainsTotal = this.mainStore.activeSceneryList.reduce<number>((acc, sc) => {
        if (sc.region != this.mainStore.region.id) return acc;

        acc += sc.scheduledTrainCount.all;

        return acc;
      }, 0);

      return this.mainStore.activeSceneryList.length != 0
        ? scheduledTrainsTotal / this.mainStore.activeSceneryList.length
        : 0;
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
            [...st.generalInfo!.routes.single, ...st.generalInfo!.routes.double].forEach((r) => {
              if (r.isInternal) return;

              const keyName: keyof typeof acc = `${r.routeTracks == 2 ? 'twoWay' : 'oneWay'}${r.isElectric ? 'Electric' : 'Other'}`;

              acc[keyName] += 1;
            });

            return acc;
          },
          { oneWayElectric: 0, oneWayOther: 0, twoWayElectric: 0, twoWayOther: 0 }
        );
    },

    spawnCount() {
      return this.mainStore.activeSceneryList.reduce(
        (acc, scenery) => {
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
.separator {
  width: 100%;
  height: 2px;
  margin: 0.5em 0;
  background-color: #ddd;
}

.station-stats {
  text-align: center;
  color: #ddd;
}

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
</style>
