<template>
  <section class="station_table">
    <div class="table_wrapper">
      <table>
        <thead>
          <tr>
            <th
              v-for="headerName in headIds"
              :key="headerName"
              @click="changeSorter(headerName)"
              class="header-text"
            >
              <span class="header_wrapper">
                <div v-html="$t(`sceneries.${headerName}`)"></div>

                <img
                  class="sort-icon"
                  v-if="sorterActive.headerName == headerName"
                  :src="`/images/icon-arrow-${sorterActive.dir == 1 ? 'asc' : 'desc'}.svg`"
                  alt="sort icon"
                />
              </span>
            </th>

            <th
              v-for="headerName in headIconsIds"
              :key="headerName"
              @click="changeSorter(headerName)"
              class="header-image"
            >
              <span class="header_wrapper">
                <img
                  :src="`/images/icon-${headerName}.svg`"
                  :alt="headerName"
                  :title="$t(`sceneries.${headerName}`)"
                />

                <img
                  class="sort-icon"
                  v-if="sorterActive.headerName == headerName"
                  :src="`/images/icon-arrow-${sorterActive.dir == 1 ? 'asc' : 'desc'}.svg`"
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
              <b v-if="station.generalInfo?.project" style="color: salmon">{{
                station.generalInfo.project
              }}</b>
              {{ station.name }}
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
                  <img
                    src="/images/icon-abandoned.svg"
                    alt="non-public"
                    :title="$t('desc.abandoned')"
                  />
                </span>

                <span v-else-if="station.generalInfo.availability == 'nonPublic'">
                  <img
                    src="/images/icon-lock.svg"
                    alt="non-public"
                    :title="$t('desc.non-public')"
                  />
                </span>

                <span v-else>
                  <img
                    src="/images/icon-unavailable.svg"
                    alt="unavailable"
                    :title="$t('desc.unavailable')"
                  />
                </span>
              </span>

              <span v-else> ? </span>
            </td>

            <td class="station_status">
              <StationStatusBadge
                :isOnline="station.onlineInfo ? true : false"
                :dispatcherStatus="station.onlineInfo?.dispatcherStatus"
              />
            </td>

            <td class="station_dispatcher-name">
              <span v-if="station.onlineInfo?.dispatcherName">
                <b
                  v-if="apiStore.donatorsData.includes(station.onlineInfo.dispatcherName)"
                  :title="$t('donations.dispatcher-message')"
                  @click.stop="openDonationModal"
                >
                  <img src="/images/icon-diamond.svg" alt="" />
                  {{ station.onlineInfo.dispatcherName }}
                </b>

                <div v-else>
                  {{ station.onlineInfo.dispatcherName }}
                </div>
              </span>
            </td>

            <td class="station_dispatcher-exp">
              <span
                v-if="station.onlineInfo"
                :style="
                  calculateExpStyle(
                    station.onlineInfo.dispatcherExp,
                    station.onlineInfo.dispatcherIsSupporter
                  )
                "
              >
                {{ station.onlineInfo.dispatcherExp < 2 ? 'L' : station.onlineInfo.dispatcherExp }}
              </span>
            </td>

            <td class="station_tracks twoway">
              <span
                v-if="
                  station.generalInfo &&
                  station.generalInfo.routes.twoWayCatenaryRouteNames.length > 0
                "
                class="track catenary"
                :title="`Liczba zelektryfikowanych szlaków dwutorowych: ${station.generalInfo.routes.twoWayCatenaryRouteNames.length}`"
              >
                {{ station.generalInfo.routes.twoWayCatenaryRouteNames.length }}
              </span>

              <span
                v-if="
                  station.generalInfo &&
                  station.generalInfo.routes.twoWayNoCatenaryRouteNames.length > 0
                "
                class="track no-catenary"
                :title="`Liczba niezelektryfikowanych szlaków dwutorowych: ${station.generalInfo.routes.twoWayNoCatenaryRouteNames.length}`"
              >
                {{ station.generalInfo.routes.twoWayNoCatenaryRouteNames.length }}
              </span>

              <span class="separator"></span>

              <span
                v-if="
                  station.generalInfo &&
                  station.generalInfo.routes.oneWayCatenaryRouteNames.length > 0
                "
                class="track catenary"
                :title="`Liczba zelektryfikowanych szlaków jednotorowych: ${station.generalInfo.routes.oneWayCatenaryRouteNames.length}`"
              >
                {{ station.generalInfo.routes.oneWayCatenaryRouteNames.length }}
              </span>

              <span
                v-if="
                  station.generalInfo &&
                  station.generalInfo.routes.oneWayNoCatenaryRouteNames.length > 0
                "
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
                  src="/images/icon-SUP.svg"
                  alt="SUP (RASP-UZK)"
                  :title="$t('desc.SUP')"
                />
              </span>

              <span>
                <img
                  class="icon-info"
                  v-if="station.generalInfo.signalType"
                  :src="`/images/icon-${station.generalInfo.signalType}.svg`"
                  :alt="station.generalInfo.signalType"
                  :title="$t('desc.signals-type') + $t(`signals.${station.generalInfo.signalType}`)"
                />
              </span>

              <span>
                <img
                  class="icon-info"
                  v-if="station.generalInfo && station.generalInfo.routes.sblRouteNames.length > 0"
                  src="/images/icon-SBL.svg"
                  alt="SBL"
                  :title="$t('desc.SBL') + `${station.generalInfo.routes.sblRouteNames.join(',')}`"
                />
              </span>
            </td>

            <td class="station_info" v-else>
              <img
                class="icon-info"
                src="/images/icon-unknown.svg"
                alt="icon-unknown"
                :title="$t('desc.unknown')"
              />
            </td>

            <td class="station_users" :class="{ inactive: !station.onlineInfo }">
              <span>{{ station.onlineInfo?.currentUsers || 0 }}</span>
              /
              <span>{{ station.onlineInfo?.maxUsers || 0 }}</span>
            </td>

            <td class="station_spawns" :class="{ inactive: !station.onlineInfo }">
              <span>{{ station.onlineInfo?.spawns.length || 0 }}</span>
            </td>

            <td
              class="station_schedules all"
              style="width: 30px"
              :class="{ inactive: !station.onlineInfo }"
            >
              {{ station.onlineInfo?.scheduledTrainCount.all }}
            </td>

            <td
              class="station_schedules unconfirmed"
              style="width: 30px"
              :class="{ inactive: !station.onlineInfo }"
            >
              {{ station.onlineInfo?.scheduledTrainCount.unconfirmed }}
            </td>

            <td
              class="station_schedules confirmed"
              style="width: 30px"
              :class="{ inactive: !station.onlineInfo }"
            >
              {{ station.onlineInfo?.scheduledTrainCount.confirmed }}
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
import { defineComponent, computed, PropType } from 'vue';
import dateMixin from '../../mixins/dateMixin';
import stationInfoMixin from '../../mixins/stationInfoMixin';
import styleMixin from '../../mixins/styleMixin';
import Station from '../../scripts/interfaces/Station';
import { useStationFiltersStore } from '../../store/stationFiltersStore';
import { useMainStore } from '../../store/mainStore';
import Loading from '../Global/Loading.vue';
import { HeadIdsTypes, headIconsIds, headIds } from '../../scripts/data/stationHeaderNames';
import StationStatusBadge from '../Global/StationStatusBadge.vue';
import { Status } from '../../typings/common';
import { useApiStore } from '../../store/apiStore';

export default defineComponent({
  props: {
    stations: {
      type: Array as PropType<Station[]>,
      required: true
    }
  },

  emits: ['toggleDonationModal'],
  components: { Loading, StationStatusBadge },
  mixins: [styleMixin, dateMixin, stationInfoMixin],

  data: () => ({
    headIconsIds,
    headIds,
    lastSelectedStationName: ''
  }),

  computed: {
    sorterActive() {
      return this.stationFiltersStore.sorterActive;
    }
  },

  setup() {
    const mainStore = useMainStore();
    const apiStore = useApiStore();
    const stationFiltersStore = useStationFiltersStore();

    const isDataLoaded = computed(() => {
      return apiStore.dataStatuses.sceneries != Status.Data.Loading;
    });

    return {
      isDataLoaded,
      stationFiltersStore,
      mainStore,
      apiStore
    };
  },

  methods: {
    setScenery(name: string) {
      const station = this.stations.find((station) => station.name === name);
      if (!station) return;

      this.lastSelectedStationName = station.name;

      this.$router.push({
        name: 'SceneryView',
        query: {
          station: station.name.replaceAll(' ', '_'),
          region: this.$route.query.region || undefined
        }
      });
    },

    openDonationModal(e: Event) {
      this.$emit('toggleDonationModal', true);
      this.mainStore.modalLastClickedTarget = e.target;
    },

    openForumSite(e: Event, url: string | undefined) {
      if (!url) return;
      e.preventDefault();
      window.open(url, '_blank');
    },

    changeSorter(headerName: HeadIdsTypes) {
      if (headerName == 'general' || headerName == 'routes') return;

      this.stationFiltersStore.changeSorter(headerName);
    }
  }
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

.table_wrapper {
  overflow: auto;
  overflow-y: hidden;
  font-weight: 500;
}

table {
  white-space: nowrap;
  border-collapse: collapse;
  // min-width: 1350px;
  width: 100%;

  @include smallScreen() {
    min-width: auto;
  }

  thead tr {
    background-color: $bgCol;
  }

  thead th {
    position: sticky;
    top: 0;

    &.header-text {
      min-width: 140px;
    }

    &.header-image {
      min-width: 60px;
    }

    padding: 0.5em 0.25em;
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

  // &_dispatcher-name {
  //   position: relative;
  // }

  &_dispatcher-name img {
    max-width: 1.35em;
    vertical-align: text-bottom;
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

.station_users {
  span {
    color: gold;
  }
}

.station_schedules {
  &.all {
    color: gold;
  }

  &.unconfirmed {
    color: #ccc;
  }

  &.confirmed {
    color: lime;
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
