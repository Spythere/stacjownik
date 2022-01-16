<template>
  <section class="station_table">
    <div class="table_wrapper">
      <table>
        <thead>
          <tr>
            <th v-for="(id, i) in headIds" :key="id" @click="() => changeSorter(i)">
              <span class="header_wrapper">
                <div v-html="$t(`sceneries.${id}`)"></div>

                <img
                  class="sort-icon"
                  v-if="sorterActive.index == i"
                  :src="sorterActive.dir == 1 ? ascIcon : descIcon"
                  alt
                />
              </span>
            </th>

            <th v-for="(id, i) in headIconsIds" :key="id" @click="() => changeSorter(i + 7)">
              <span class="header_wrapper">
                <img :src="require(`@/assets/icon-${id}.svg`)" :alt="id" :title="$t(`sceneries.${id}s`)" />

                <img
                  class="sort-icon"
                  v-if="sorterActive.index == i + 7"
                  :src="sorterActive.dir == 1 ? ascIcon : descIcon"
                  alt
                />
              </span>
            </th>
          </tr>
        </thead>

        <tbody>
          <tr
            class="station"
            v-for="(station, i) in stations"
            :key="i + station.name"
            @click="() => setScenery(station.name)"
            @keydown.enter="setScenery(station.name)"
            tabindex="0"
          >
            <td
              class="station_name"
              :class="{
                default: station.generalInfo?.default,
                'non-public': station.generalInfo?.nonPublic,
                online: station.onlineInfo,
                unavailable: station.generalInfo?.unavailable,
              }"
            >
              <b v-if="station.generalInfo?.project" style="color: salmon;">{{ station.generalInfo.project }}</b>
              {{ station.name }}
            </td>

            <td class="station_level">
              <span v-if="station.generalInfo">
                <span
                  v-if="
                    station.generalInfo.reqLevel > -1 &&
                      !station.generalInfo.nonPublic &&
                      !station.generalInfo.unavailable
                  "
                  :style="calculateExpStyle(station.generalInfo.reqLevel, station.generalInfo.supportersOnly)"
                >
                  {{ station.generalInfo.reqLevel >= 2 ? station.generalInfo.reqLevel : 'L' }}
                </span>

                <span v-else-if="station.generalInfo.nonPublic">
                  <img :src="lockIcon" alt="non-public" :title="$t('desc.non-public')" />
                </span>

                <span v-else>
                  <img :src="unavailableIcon" alt="unavailable" :title="$t('desc.unavailable')" />
                </span>
              </span>

              <span v-else>
                ?
              </span>
            </td>

            <td class="station_status">
              <span class="status-badge" :class="station.onlineInfo.statusID" v-if="station.onlineInfo">
                {{ $t(`status.${station.onlineInfo.statusID}`) }}
                {{ station.onlineInfo.statusID == 'online' ? station.onlineInfo.statusTimeString : '' }}
              </span>

              <span class="status-badge free" v-else>
                {{ $t('status.free') }}
              </span>
            </td>

            <td class="station_dispatcher-name">
              {{ station.onlineInfo ? station.onlineInfo.dispatcherName : '' }}
            </td>

            <td class="station_dispatcher-exp">
              <span
                v-if="station.onlineInfo"
                :style="calculateExpStyle(station.onlineInfo.dispatcherExp, station.onlineInfo.dispatcherIsSupporter)"
              >
                {{ 2 > station.onlineInfo.dispatcherExp ? 'L' : station.onlineInfo.dispatcherExp }}
              </span>
            </td>

            <td class="station_tracks twoway">
              <span
                v-if="station.generalInfo && station.generalInfo.routes.twoWay.catenary > 0"
                class="track catenary"
                :title="`Liczba zelektryfikowanych szlaków dwutorowych: ${station.generalInfo.routes.twoWay.catenary}`"
              >
                {{ station.generalInfo.routes.twoWay.catenary }}
              </span>

              <span
                v-if="station.generalInfo && station.generalInfo.routes.twoWay.noCatenary > 0"
                class="track no-catenary"
                :title="
                  `Liczba niezelektryfikowanych szlaków dwutorowych: ${station.generalInfo.routes.twoWay.noCatenary}`
                "
              >
                {{ station.generalInfo.routes.twoWay.noCatenary }}
              </span>

              <span class="separator"></span>

              <span
                v-if="station.generalInfo && station.generalInfo.routes.oneWay.catenary > 0"
                class="track catenary"
                :title="
                  `Liczba zelektryfikowanych szlaków jednotorowych: ${station.generalInfo.routes.oneWay.catenary}`
                "
              >
                {{ station.generalInfo.routes.oneWay.catenary }}
              </span>

              <span
                v-if="station.generalInfo && station.generalInfo.routes.oneWay.noCatenary > 0"
                class="track no-catenary"
                :title="
                  `Liczba niezelektryfikowanych szlaków jednotorowych: ${station.generalInfo.routes.oneWay.noCatenary}`
                "
              >
                {{ station.generalInfo.routes.oneWay.noCatenary }}
              </span>
            </td>

            <td class="station_info">
              <img
                class="icon-info"
                v-if="station.generalInfo?.controlType"
                :src="require(`@/assets/icon-${station.generalInfo.controlType}.svg`)"
                :alt="station.generalInfo.controlType"
                :title="$t('desc.control-type') + $t(`controls.${station.generalInfo.controlType}`)"
              />

               <img
                class="icon-info"
                v-if="station.generalInfo?.SUP"
                :src="require(`@/assets/icon-SUP.svg`)"
                alt="SUP (RASP-UZK)"
                :title="$t('desc.SUP')"
              />

              <img
                class="icon-info"
                v-if="station.generalInfo?.signalType"
                :src="require(`@/assets/icon-${station.generalInfo.signalType}.svg`)"
                :alt="station.generalInfo.signalType"
                :title="$t('desc.signals-type') + $t(`signals.${station.generalInfo.signalType}`)"
              />

              <img
                v-if="station.generalInfo?.SBL && station.generalInfo?.SBL !== ''"
                :src="SBLIcon"
                alt="SBL"
                :title="$t('desc.SBL') + `${station.generalInfo.SBL}`"
              />

              <img v-if="!station.generalInfo" :src="unknownIcon" alt="icon-unknown" :title="$t('desc.unknown')" />
            </td>

            <td class="station_users" :class="{ inactive: !station.onlineInfo }">
              <span>
                <span class="highlight">{{ station.onlineInfo?.currentUsers || '0' }}</span>
                /
                <span>{{ station.onlineInfo?.maxUsers || '0' }}</span>
              </span>
            </td>

            <td class="station_spawns" :class="{ inactive: !station.onlineInfo }">
              <span class="highlight">{{ station.onlineInfo?.spawns.length || '0' }}</span>
            </td>

            <td class="station_schedules" :class="{ inactive: !station.onlineInfo }">
              <span>
                <span class="highlight">
                  {{ station.onlineInfo?.scheduledTrains?.length || '0' }}
                </span>
                /
                <span style="color: #bbb">
                  {{ station.onlineInfo?.scheduledTrains?.filter((train) => train.stopInfo.confirmed).length || '0' }}
                </span>
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="no-stations" v-if="isDataLoaded && stations.length == 0">
      {{ $t('sceneries.no-stations') }}
    </div>

    <div class="no-stations" v-if="!isDataLoaded && stations.length == 0">
      {{ $t('app.loading') }}
    </div>
  </section>
</template>

<script lang="ts">
import styleMixin from '@/mixins/styleMixin';

import { DataStatus } from '@/scripts/enums/DataStatus';
import { computed, ComputedRef, defineComponent } from '@vue/runtime-core';
import { useStore } from '@/store';
import { GETTERS } from '@/constants/storeConstants';
import Station from '@/scripts/interfaces/Station';

export default defineComponent({
  props: {
    stations: {
      type: Array as () => Station[],
      required: true,
    },

    sorterActive: {
      type: Object as () => { index: number; dir: number },
      required: true,
    },

    setFocusedStation: { type: Function, required: true },
    changeSorter: { type: Function, required: true },
  },

  mixins: [styleMixin],

  data: () => ({
    likeIcon: require('@/assets/icon-like.svg'),
    spawnIcon: require('@/assets/icon-spawn.svg'),
    timetableIcon: require('@/assets/icon-timetable.svg'),
    userIcon: require('@/assets/icon-user.svg'),
    trainIcon: require('@/assets/icon-train.svg'),
    SBLIcon: require('@/assets/icon-SBL.svg'),
    SUPIcon: require("@/assets/icon-SUP.svg"),
    lockIcon: require('@/assets/icon-lock.svg'),
    unavailableIcon: require('@/assets/icon-unavailable.svg'),
    unknownIcon: require('@/assets/icon-unknown.svg'),

    ascIcon: require('@/assets/icon-arrow-asc.svg'),
    descIcon: require('@/assets/icon-arrow-desc.svg'),

    headIds: ['station', 'min-lvl', 'status', 'dispatcher', 'dispatcher-lvl', 'routes', 'general'],

    headIconsIds: ['user', 'spawn', 'timetable'],
  }),

  setup() {
    const store = useStore();

    const dataConnectionStatus: ComputedRef<DataStatus> = computed(() => store.getters[GETTERS.dataStatus]);

    const isDataLoaded = computed(() => {
      return dataConnectionStatus.value == DataStatus.Loaded;
    });

    return {
      isDataLoaded,
    };
  },

  methods: {
    setScenery(name: string) {
      const station = this.stations.find((station) => station.name === name);

      if (!station) return;

      this.$router.push({
        name: 'SceneryView',
        query: { station: station.name.replaceAll(' ', '_') },
      });
    },
  },
});
</script>

<style lang="scss" scoped>
@import '../../styles/responsive.scss';
@import '../../styles/variables.scss';

$rowCol: #4b4b4b;

.change-anim {
  &-enter-active,
  &-leave-active {
    transition: opacity 100ms ease-in;
  }

  &-enter,
  &-leave-to {
    opacity: 0;
  }
}

.highlight {
  color: gold;
}

section.station_table {
  overflow: auto;
  overflow-y: hidden;
  font-weight: 500;
}

.table_wrapper {
  overflow: auto;
}

table {
  white-space: nowrap;
  border-collapse: collapse;

  min-width: 1000px;

  thead th {
    position: sticky;
    top: 0;

    min-width: 85px;

    padding: 0.5em;
    background-color: $primaryCol;
    white-space: pre-wrap;

    cursor: pointer;
    user-select: none;
    -moz-user-select: none;
    -webkit-user-select: none;

    span {
      display: flex;
      align-items: center;
      justify-content: center;

      img {
        width: 1.5em;
        vertical-align: middle;
      }
    }
  }
}

tr.station {
  background-color: $rowCol;

  &:nth-child(even) {
    background-color: lighten($rowCol, 5);
    color: white;
  }

  &:hover,
  &:focus {
    background-color: lighten($rowCol, 20);
  }

  & > td {
    padding: 0.25em 1em;
    text-align: center;

    cursor: pointer;

    @include smallScreen() {
      margin: 0;
      padding: 0.1em 0.5em;
    }
  }
}

td.station {
  &_name {
    font-weight: bold;

    &.default {
      color: $accentCol;
    }

    &.non-public {
      color: #bebebe;
    }

    &.unavailable {
      font-weight: 500;
      color: #bebebe;
    }
  }

  &_level,
  &_dispatcher-exp {
    span {
      display: block;

      width: 2em;
      height: 2em;
      line-height: 2em;
      margin: 0 auto;
    }

    img {
      width: 2em;
      border-radius: 50%;
    }
  }

  &_level {
    span {
      background-color: #888;
      border-radius: 50%;
    }
  }

  &_info,
  &_tracks {
    img {
      width: 2.2em;
      margin: 0 0.2em;
      vertical-align: middle;
    }
  }

  &_tracks {
    .no-catenary {
      background-color: #939393;
    }

    .catenary {
      background-color: #009dce;
    }

    .track {
      margin: 0 0.35em;
      padding: 0.35em;
      font-size: 1.05em;
      white-space: pre-wrap;
    }
  }

  &_users,
  &_spawns,
  &_schedules {
    &.inactive {
      opacity: 0.2;
    }
  }
}

.separator {
  border-left: 3px solid #b3b3b3;
}

.no-stations {
  text-align: center;
  font-size: 1.5em;

  padding: 1em;
  margin: 1em 0;

  background: #333;
}
</style>
