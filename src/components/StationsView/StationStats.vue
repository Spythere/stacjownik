<template>
  <div class="station-stats">
    <div class="separator" />

    <div class="stats-row">
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
        &bull;
        {{ $t('station-stats.med-timetable-count') }}
        <b>{{ medTimetableCount }}</b>
      </div>

      <div>
        &bull;
        {{ $t('station-stats.single-track-count') }}
        <b>{{ trackCount.oneWay }}</b> (<b>{{ trackCount.oneWayElectric }} ⚡</b>)
      </div>

      <div>
        &bull;
        {{ $t('station-stats.double-track-count') }}
        <b>{{ trackCount.twoWay }}</b>
        (<b>{{ trackCount.twoWayElectric }} ⚡</b>)
      </div>

      <div>
        &bull; {{ $t('station-stats.cross-sceneries') }} <b>{{ trackCount.crossTrack }}</b> (<b
          >{{ trackCount.crossTrackElectric }} ⚡</b
        >)
      </div>

      <div>
        &bull;
        {{ $t('station-stats.open-spawns') }} <b>{{ spawnCount.passenger }}</b> - PAS /
        <b>{{ spawnCount.freight }}</b> - TOW / <b>{{ spawnCount.loco }}</b> - LUZ /
        <b>{{ spawnCount.all }}</b> - ALL
      </div>
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

    medTimetableCount() {
      const scheduledTrainsArr = this.mainStore.activeSceneryList
        .reduce<number[]>((acc, sc) => {
          if (sc.region != this.mainStore.region.id) return acc;

          acc.push(sc.scheduledTrainCount.all);

          return acc;
        }, [])
        .sort((a, b) => Math.sign(a - b));

      if (scheduledTrainsArr.length == 0) return 0;

      if (scheduledTrainsArr.length % 2 == 0) {
        let v1 = scheduledTrainsArr[scheduledTrainsArr.length / 2];
        let v2 = scheduledTrainsArr[scheduledTrainsArr.length / 2 - 1];

        return (v1 + v2) / 2;
      }

      return scheduledTrainsArr[~~(scheduledTrainsArr.length / 2)];
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
  background-color: #aaa;
}

.station-stats {
  text-align: center;
  color: #ddd;
}

.stats-row {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  text-wrap: pretty;
  gap: 0.25em;
  margin-top: 0.25em;
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
</style>
