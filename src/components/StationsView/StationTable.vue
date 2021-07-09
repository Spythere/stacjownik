<template>
  <section class="station_table">
    <div class="table_wrapper">
      <table>
        <thead>
          <tr>
            <th
              v-for="(id, i) in headIds"
              :key="id"
              @click="() => changeSorter(i)"
            >
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

            <th
              v-for="(id, i) in headIconsIds"
              :key="id"
              @click="() => changeSorter(i + 7)"
            >
              <span class="header_wrapper">
                <img
                  :src="require(`@/assets/icon-${id}.svg`)"
                  :alt="id"
                  :title="$t(`sceneries.${id}s`)"
                />

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
            :key="i + station.stationHash"
            @click="() => setScenery(station.stationName)"
          >
            <td
              class="station_name"
              :class="{
                'default-station': station.default,
                online: station.online,
                'station-unavailable': station.unavailable,
              }"
            >
              {{ station.stationName }}
            </td>

            <td class="station_level">
              <span
                v-if="station.reqLevel"
                :style="calculateExpStyle(station.reqLevel)"
              >
                {{
                  station.reqLevel && Number(station.reqLevel) > -1
                    ? Number(station.reqLevel) >= 2
                      ? station.reqLevel
                      : "L"
                    : "?"
                }}
              </span>

              <span v-else>?</span>
            </td>

            <td class="station_status">
              <span class="status-badge" :class="station.statusID"
                >{{ $t(`status.${station.statusID}`) }}
                {{
                  station.statusID == "online" ? station.statusTimeString : ""
                }}
              </span>
            </td>

            <td class="station_dispatcher-name">
              {{ station.online ? station.dispatcherName : "" }}
            </td>

            <td class="station_dispatcher-exp">
              <span
                v-if="station.online"
                :style="calculateExpStyle(station.dispatcherExp)"
                >{{
                  2 > station.dispatcherExp ? "L" : station.dispatcherExp
                }}</span
              >
            </td>

            <td class="station_tracks twoway">
              <span
                v-if="station.routes && station.routes.twoWay.catenary > 0"
                class="track catenary"
                :title="`Liczba zelektryfikowanych szlaków dwutorowych: ${station.routes.twoWay.catenary}`"
              >
                {{ station.routes.twoWay.catenary }}
              </span>

              <span
                v-if="station.routes && station.routes.twoWay.noCatenary > 0"
                class="track no-catenary"
                :title="`Liczba niezelektryfikowanych szlaków dwutorowych: ${station.routes.twoWay.noCatenary}`"
              >
                {{ station.routes.twoWay.noCatenary }}
              </span>

              <span class="separator"></span>

              <span
                v-if="station.routes && station.routes.oneWay.catenary > 0"
                class="track catenary"
                :title="`Liczba zelektryfikowanych szlaków jednotorowych: ${station.routes.oneWay.catenary}`"
              >
                {{ station.routes.oneWay.catenary }}
              </span>

              <span
                v-if="station.routes && station.routes.oneWay.noCatenary > 0"
                class="track no-catenary"
                :title="`Liczba niezelektryfikowanych szlaków jednotorowych: ${station.routes.oneWay.noCatenary}`"
              >
                {{ station.routes.oneWay.noCatenary }}
              </span>
            </td>

            <td class="station_info">
              <img
                class="icon-info"
                v-if="station.controlType"
                :src="require(`@/assets/icon-${station.controlType}.svg`)"
                :alt="station.controlType"
                :title="
                  $t('desc.control-type') +
                  $t(`controls.${station.controlType}`)
                "
              />

              <img
                class="icon-info"
                v-if="station.signalType"
                :src="require(`@/assets/icon-${station.signalType}.svg`)"
                :alt="station.signalType"
                :title="
                  $t('desc.signals-type') + $t(`signals.${station.signalType}`)
                "
              />

              <img
                v-if="station.SBL && station.SBL !== ''"
                :src="SBLIcon"
                alt="SBL"
                :title="$t('desc.SBL') + `${station.SBL}`"
              />

              <img
                v-if="station.nonPublic || !station.reqLevel"
                :src="lockIcon"
                alt="non-public"
                :title="$t('desc.non-public')"
              />

              <img
                v-if="station.unavailable"
                :src="unavailableIcon"
                alt="icon-unavailable"
                :title="$t('desc.unavailable')"
              />
            </td>

            <td class="station_users" :class="{ inactive: !station.online }">
              <span>
                <span class="highlight">{{ station.currentUsers }}</span>
                /
                <span>{{ station.maxUsers }}</span>
              </span>
            </td>

            <td class="station_spawns" :class="{ inactive: !station.online }">
              <span class="highlight">{{ station.spawns.length }}</span>
            </td>

            <td
              class="station_schedules"
              :class="{ inactive: !station.online }"
            >
              <span class="highlight">
                {{ station.scheduledTrains.length }}
              </span>
              /
              <span style="color: #bbb">{{
                station.scheduledTrains.filter(
                  (train) => train.stopInfo.confirmed
                ).length
              }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="no-stations" v-if="stations.length == 0 && isDataLoaded">
      {{ $t("sceneries.no-stations") }}
    </div>

    <div class="no-stations" v-else-if="!isDataLoaded">
      {{ $t("app.loading") }}
    </div>
  </section>
</template>

<script lang="ts">
import styleMixin from "@/mixins/styleMixin";

import { DataStatus } from "@/scripts/enums/DataStatus";
import { computed, ComputedRef, defineComponent } from "@vue/runtime-core";
import { useStore } from "@/store";
import { GETTERS } from "@/constants/storeConstants";
import Station from "@/scripts/interfaces/Station";

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
    likeIcon: require("@/assets/icon-like.svg"),
    spawnIcon: require("@/assets/icon-spawn.svg"),
    timetableIcon: require("@/assets/icon-timetable.svg"),
    userIcon: require("@/assets/icon-user.svg"),
    trainIcon: require("@/assets/icon-train.svg"),
    SBLIcon: require("@/assets/icon-SBL.svg"),
    lockIcon: require("@/assets/icon-lock.svg"),
    unavailableIcon: require("@/assets/icon-unavailable.svg"),

    ascIcon: require("@/assets/icon-arrow-asc.svg"),
    descIcon: require("@/assets/icon-arrow-desc.svg"),

    headIds: [
      "station",
      "min-lvl",
      "status",
      "dispatcher",
      "dispatcher-lvl",
      "routes",
      "general",
    ],

    headIconsIds: ["user", "spawn", "timetable"],
  }),

  setup() {
    const store = useStore();

    const dataConnectionStatus: ComputedRef<DataStatus> = computed(
      () => store.getters[GETTERS.dataStatus]
    );

    const isDataLoaded = computed(() => {
      return dataConnectionStatus.value == DataStatus.Loaded;
    });

    return {
      isDataLoaded,
    };
  },

  methods: {
    setScenery(name: string) {
      const station = this.stations.find(
        (station) => station.stationName === name
      );

      if (!station) return;

      this.$router.push({
        name: "SceneryView",
        query: { station: station.stationName.replaceAll(" ", "_") },
      });
    },
  },
});
</script>

<style lang="scss" scoped>
@import "../../styles/responsive.scss";
@import "../../styles/variables.scss";

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
  &_level,
  &_dispatcher-exp {
    span {
      display: block;

      width: 2em;
      height: 2em;
      line-height: 2em;
      margin: 0 auto;
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