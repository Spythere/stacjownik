<template>
  <section class="station_table">
    <button class="return-btn" @click="scrollToTop" v-if="showReturnButton">
      <img :src="icons.arrow" alt="return arrow" />
    </button>

    <div class="table_wrapper">
      <table>
        <thead>
          <tr>
            <th v-for="(headerName, i) in headIds" :key="headerName" @click="changeSorter(headerName)">
              <span class="header_wrapper">
                <div v-html="$t(`sceneries.${headerName}`)"></div>

                <img
                  class="sort-icon"
                  v-if="sorterActive.headerName == headerName"
                  :src="sorterActive.dir == 1 ? getIcon('arrow-asc') : getIcon('arrow-desc')"
                  alt="sort icon"
                />
              </span>
            </th>

            <th v-for="(headerName, i) in headIconsIds" :key="headerName" @click="changeSorter(headerName)">
              <span class="header_wrapper">
                <img :src="getIcon(headerName)" :alt="headerName" :title="$t(`sceneries.${headerName}s`)" />

                <img
                  class="sort-icon"
                  v-if="sorterActive.headerName == headerName"
                  :src="sorterActive.dir == 1 ? getIcon('arrow-asc') : getIcon('arrow-desc')"
                  alt="sort icon"
                />
              </span>
            </th>
          </tr>
        </thead>

        <tbody>
          <tr
            class="station"
            :class="{ 'last-selected': lastSelectedStationName == station.name }"
            v-for="(station, i) in stations"
            :key="i + station.name"
            @click.left="setScenery(station.name)"
            @click.right="openForumSite($event, station.generalInfo?.url)"
            @keydown.enter="setScenery(station.name)"
            @keydown.space="openForumSite($event, station.generalInfo?.url)"
            tabindex="0"
          >
            <td class="station_name" :class="station.generalInfo?.availability">
              <b v-if="station.generalInfo?.project" style="color: salmon">{{ station.generalInfo.project }}</b>
              {{ station.name }}
            </td>

            <td>
              <b>
                {{ station.generalInfo?.abbr }}
              </b>
            </td>

            <td class="station_level">
              <span v-if="station.generalInfo">
                <span
                  v-if="
                    station.generalInfo.reqLevel > -1 &&
                    station.generalInfo.availability != 'nonPublic' &&
                    station.generalInfo.availability != 'unavailable'
                  "
                  :style="calculateExpStyle(station.generalInfo.reqLevel)"
                >
                  {{ station.generalInfo.reqLevel >= 2 ? station.generalInfo.reqLevel : 'L' }}
                </span>

                <span v-else-if="station.generalInfo.availability == 'abandoned'">
                  <img :src="getIcon('abandoned')" alt="non-public" :title="$t('desc.abandoned')" />
                </span>

                <span v-else-if="station.generalInfo.availability == 'nonPublic'">
                  <img :src="getIcon('lock')" alt="non-public" :title="$t('desc.non-public')" />
                </span>

                <span v-else>
                  <img :src="getIcon('unavailable')" alt="unavailable" :title="$t('desc.unavailable')" />
                </span>
              </span>

              <span v-else> ? </span>
            </td>

            <td class="station_status">
              <span class="status-badge" :class="station.onlineInfo.statusID" v-if="station.onlineInfo">
                {{ $t(`status.${station.onlineInfo.statusID}`) }}
                {{
                  station.onlineInfo.statusID == 'online' ? timestampToString(station.onlineInfo.statusTimestamp) : ''
                }}
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
                v-if="station.generalInfo && station.generalInfo.routes.twoWayCatenaryRouteNames.length > 0"
                class="track catenary"
                :title="`Liczba zelektryfikowanych szlaków dwutorowych: ${station.generalInfo.routes.twoWayCatenaryRouteNames.length}`"
              >
                {{ station.generalInfo.routes.twoWayCatenaryRouteNames.length }}
              </span>

              <span
                v-if="station.generalInfo && station.generalInfo.routes.twoWayNoCatenaryRouteNames.length > 0"
                class="track no-catenary"
                :title="`Liczba niezelektryfikowanych szlaków dwutorowych: ${station.generalInfo.routes.twoWayNoCatenaryRouteNames.length}`"
              >
                {{ station.generalInfo.routes.twoWayNoCatenaryRouteNames.length }}
              </span>

              <span class="separator"></span>

              <span
                v-if="station.generalInfo && station.generalInfo.routes.oneWayCatenaryRouteNames.length > 0"
                class="track catenary"
                :title="`Liczba zelektryfikowanych szlaków jednotorowych: ${station.generalInfo.routes.oneWayCatenaryRouteNames.length}`"
              >
                {{ station.generalInfo.routes.oneWayCatenaryRouteNames.length }}
              </span>

              <span
                v-if="station.generalInfo && station.generalInfo.routes.oneWayNoCatenaryRouteNames.length > 0"
                class="track no-catenary"
                :title="`Liczba niezelektryfikowanych szlaków jednotorowych: ${station.generalInfo.routes.oneWayNoCatenaryRouteNames.length}`"
              >
                {{ station.generalInfo.routes.oneWayNoCatenaryRouteNames.length }}
              </span>
            </td>

            <td class="station_info" v-if="station.generalInfo">
              <span
                class="scenery-icon icon-info"
                :class="station.generalInfo.controlType.replace('+', '-')"
                :title="$t('desc.control-type') + $t(`controls.${station.generalInfo.controlType}`)"
                v-html="getControlTypeAbbrev(station.generalInfo.controlType)"
              >
              </span>

              <span>
                <img
                  class="icon-info"
                  v-if="station.generalInfo.SUP"
                  :src="getIcon('SUP')"
                  alt="SUP (RASP-UZK)"
                  :title="$t('desc.SUP')"
                />
              </span>

              <span>
                <img
                  class="icon-info"
                  v-if="station.generalInfo.signalType"
                  :src="getIcon(station.generalInfo.signalType)"
                  :alt="station.generalInfo.signalType"
                  :title="$t('desc.signals-type') + $t(`signals.${station.generalInfo.signalType}`)"
                />
              </span>

              <span>
                <img
                  class="icon-info"
                  v-if="station.generalInfo && station.generalInfo.routes.sblRouteNames.length > 0"
                  :src="getIcon('SBL')"
                  alt="SBL"
                  :title="$t('desc.SBL') + `${station.generalInfo.routes.sblRouteNames.join(',')}`"
                />
              </span>
            </td>

            <td class="station_info" v-else>
              <img class="icon-info" :src="getIcon('unknown')" alt="icon-unknown" :title="$t('desc.unknown')" />
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

    <Loading v-if="!isDataLoaded && stations.length == 0" />

    <div class="no-stations" v-else-if="stations.length == 0">
      {{ $t('sceneries.no-stations') }}
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import dateMixin from '../../mixins/dateMixin';
import imageMixin from '../../mixins/imageMixin';
import returnBtnMixin from '../../mixins/returnBtnMixin';
import stationInfoMixin from '../../mixins/stationInfoMixin';
import styleMixin from '../../mixins/styleMixin';
import { DataStatus } from '../../scripts/enums/DataStatus';
import Station from '../../scripts/interfaces/Station';
import { useStationFiltersStore } from '../../store/stationFiltersStore';
import { useStore } from '../../store/store';
import Loading from '../Global/Loading.vue';
import { HeadIdsTypes, headIconsIds, headIds } from '../../scripts/data/stationHeaderNames';

export default defineComponent({
  props: {
    stations: {
      type: Array as () => Station[],
      required: true,
    },
  },

  components: { Loading },
  mixins: [styleMixin, dateMixin, stationInfoMixin, returnBtnMixin, imageMixin],

  data: () => ({
    headIconsIds,
    headIds,
    lastSelectedStationName: '',
  }),

  computed: {
    sorterActive() {
      return this.stationFiltersStore.sorterActive;
    },
  },

  setup() {
    const store = useStore();
    const stationFiltersStore = useStationFiltersStore();

    const isDataLoaded = computed(() => {
      return store.dataStatuses.sceneries != DataStatus.Loading;
    });
    return {
      isDataLoaded,
      stationFiltersStore,
    };
  },

  methods: {
    setScenery(name: string) {
      const station = this.stations.find((station) => station.name === name);
      if (!station) return;

      this.lastSelectedStationName = station.name;
      this.$router.push({
        name: 'SceneryView',
        query: { station: station.name.replaceAll(' ', '_') },
      });
    },

    openForumSite(e: Event, url: string | undefined) {
      if (!url) return;
      e.preventDefault();
      window.open(url, '_blank');
    },

    changeSorter(headerName: HeadIdsTypes) {
      if (headerName == 'general' || headerName == 'routes') return;

      this.stationFiltersStore.changeSorter(headerName);
    },
  },
});
</script>

<style lang="scss" scoped>
@import '../../styles/responsive.scss';
@import '../../styles/variables.scss';
@import '../../styles/icons.scss';

$rowCol: #424242;

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
  overflow-y: hidden;
}

table {
  white-space: nowrap;
  border-collapse: collapse;
  min-width: 1350px;

  @include smallScreen() {
    min-width: auto;
  }

  thead tr {
    background-color: $bgCol;
  }

  thead th {
    position: sticky;
    top: 0;

    min-width: 80px;

    padding: 0.5em;
    background-color: $bgCol;
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

  td {
    padding: 0.25em 1em;
    text-align: center;

    cursor: pointer;

    @include smallScreen() {
      margin: 0;
      padding: 0.3em 0.5em;
      font-size: 1em;
    }
  }
}

td.station {
  &_name {
    font-weight: bold;

    &.default {
      color: $accentCol;
    }

    &.nonPublic {
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

  &_info {
    display: flex;
    align-items: center;
    justify-content: center;

    /* Images */
    .icon-info {
      display: flex;
      justify-content: center;
      align-items: center;

      width: 32px;
      height: 32px;
      font-size: 12px;

      margin: 0 0.2em;

      outline: 2px solid #444;
      border-radius: 0.5em;

      @include smallScreen() {
        width: 24px;
        height: 24px;
        font-size: 10px;
      }
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
