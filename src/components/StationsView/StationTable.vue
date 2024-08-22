<template>
  <section class="station_table">
    <Loading
      v-if="apiStore.dataStatuses.connection == Status.Loading && filteredStationList.length == 0"
    />

    <table v-else-if="filteredStationList.length > 0">
      <thead>
        <tr>
          <th
            v-for="headerName in headIds"
            :key="headerName"
            @click="changeSorter(headerName)"
            class="header-text"
            :class="headerName"
          >
            <span class="header_wrapper">
              <div v-html="$t(`sceneries.headers.${headerName}`)"></div>

              <img
                class="sort-icon"
                v-if="activeSorter.headerName == headerName"
                :src="`/images/icon-arrow-${activeSorter.dir == 1 ? 'asc' : 'desc'}.svg`"
                alt="sort icon"
              />
            </span>
          </th>

          <th
            v-for="headerName in headIconsIds"
            :key="headerName"
            @click="changeSorter(headerName)"
            class="header-image"
            :class="headerName"
          >
            <span class="header_wrapper">
              <img
                :src="`/images/icon-${headerName}.svg`"
                :alt="headerName"
                :title="$t(`sceneries.headers.${headerName}`)"
              />

              <img
                class="sort-icon"
                v-if="activeSorter.headerName == headerName"
                :src="`/images/icon-arrow-${activeSorter.dir == 1 ? 'asc' : 'desc'}.svg`"
                alt="sort icon"
              />
            </span>
          </th>
        </tr>
      </thead>

      <tbody>
        <router-link
          v-for="station in filteredStationList"
          class="a-row"
          role="row"
          :key="station.name"
          @click.right.prevent="openForumSite($event, station.generalInfo?.url)"
          @keydown.space.prevent="openForumSite($event, station.generalInfo?.url)"
          tabindex="0"
          :to="getSceneryRoute(station.name)"
        >
          <td class="station-name" :class="station.generalInfo?.availability">
            <b v-if="station.generalInfo?.project" style="color: salmon">{{
              station.generalInfo.project
            }}</b>
            {{ station.name }}
          </td>

          <td class="station-level">
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
                  :title="$t('sceneries.info.abandoned')"
                />
              </span>

              <span v-else-if="station.generalInfo.availability == 'nonPublic'">
                <img
                  src="/images/icon-lock.svg"
                  alt="non-public"
                  :title="$t('sceneries.info.non-public')"
                />
              </span>

              <span v-else>
                <img
                  src="/images/icon-unavailable.svg"
                  alt="unavailable"
                  :title="$t('sceneries.info.unavailable')"
                />
              </span>
            </span>

            <span v-else> ? </span>
          </td>

          <td class="station-status">
            <StationStatusBadge
              :isOnline="station.onlineInfo ? true : false"
              :dispatcherStatus="station.onlineInfo?.dispatcherStatus"
            />
          </td>

          <td class="station-dispatcher-name">
            <span v-if="station.onlineInfo?.dispatcherName">
              <b
                v-if="apiStore.donatorsData.includes(station.onlineInfo.dispatcherName)"
                @click.stop="openDonationCard"
                data-tooltip-type="DonatorTooltip"
                :data-tooltip-content="$t('donations.dispatcher-message')"
              >
                <img src="/images/icon-diamond.svg" alt="" />
                {{ station.onlineInfo.dispatcherName }}
              </b>

              <div v-else>
                {{ station.onlineInfo.dispatcherName }}
              </div>
            </span>
          </td>

          <td class="station-dispatcher-exp">
            <span
              v-if="station.onlineInfo && station.onlineInfo?.dispatcherExp != -1"
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

          <td class="station-tracks">
            <div v-if="station.generalInfo">
              <span
                v-if="station.generalInfo.routes.singleElectrifiedNames.length != 0"
                class="track catenary"
                :title="`${$t('sceneries.info.single-track-routes-catenary')}${
                  station.generalInfo.routes.singleElectrifiedNames.length
                }`"
              >
                {{ station.generalInfo.routes.singleElectrifiedNames.length }}
              </span>

              <span
                v-if="station.generalInfo.routes.singleOtherNames.length != 0"
                class="track no-catenary"
                :title="`${$t('sceneries.info.single-track-routes-other')}${
                  station.generalInfo.routes.singleOtherNames.length
                }`"
              >
                {{ station.generalInfo.routes.singleOtherNames.length }}
              </span>
            </div>
          </td>

          <td class="station-tracks">
            <div v-if="station.generalInfo">
              <span
                v-if="station.generalInfo.routes.doubleElectrifiedNames.length != 0"
                class="track catenary"
                :title="`${$t('sceneries.info.double-track-routes-catenary')}${
                  station.generalInfo.routes.doubleElectrifiedNames.length
                }`"
              >
                {{ station.generalInfo.routes.doubleElectrifiedNames.length }}
              </span>

              <span
                v-if="station.generalInfo.routes.doubleOtherNames.length != 0"
                class="track no-catenary"
                :title="`${$t('sceneries.info.double-track-routes-other')}${
                  station.generalInfo.routes.doubleOtherNames.length
                }`"
              >
                {{ station.generalInfo.routes.doubleOtherNames.length }}
              </span>
            </div>
          </td>

          <td class="station-info">
            <span
              v-if="station.generalInfo?.signalType"
              class="scenery-icon icon-info"
              :class="station.generalInfo?.controlType.replace('+', '-')"
              :title="
                $t('sceneries.info.control-type') +
                $t(`controls.${station.generalInfo?.controlType}`)
              "
            >
              {{ $t(`controls.abbrevs.${station.generalInfo.controlType}`) }}
            </span>

            <img
              v-if="station.generalInfo?.signalType"
              class="icon-info"
              :src="`/images/icon-${station.generalInfo.signalType}.svg`"
              :alt="station.generalInfo.signalType"
              :title="
                $t('sceneries.info.signals-type') + $t(`signals.${station.generalInfo.signalType}`)
              "
            />

            <img
              v-if="station.generalInfo?.SUP"
              class="icon-info"
              src="/images/icon-SUP.svg"
              alt="SUP (RASP-UZK)"
              :title="$t('sceneries.info.SUP')"
            />

            <img
              v-if="station.generalInfo?.ASDEK"
              class="icon-info"
              src="/images/icon-ASDEK.svg"
              alt="dSAT ASDEK"
              :title="$t('sceneries.info.ASDEK')"
            />

            <img
              v-if="!station.generalInfo"
              class="icon-info"
              src="/images/icon-unknown.svg"
              alt="icon-unknown"
              :title="$t('sceneries.info.unknown')"
            />
          </td>

          <td
            class="station-users"
            :class="{ inactive: !station.onlineInfo }"
            data-tooltip-type="UsersTooltip"
            :data-tooltip-content="JSON.stringify(station.onlineInfo?.stationTrains ?? [])"
          >
            <span class="text--primary">{{
              station.onlineInfo?.stationTrains?.length ?? '-'
            }}</span>
            /
            <span class="text--primary">{{ station.onlineInfo?.maxUsers ?? '-' }}</span>
          </td>

          <td class="station-likes" :class="{ inactive: !station.onlineInfo }">
            <span>{{ station.onlineInfo?.dispatcherRate ?? '-' }}</span>
          </td>

          <td
            class="station-spawns"
            :class="{ inactive: !station.onlineInfo }"
            data-tooltip-type="SpawnsTooltip"
            :data-tooltip-content="JSON.stringify(station.onlineInfo?.spawns ?? [])"
          >
            <span>{{ station.onlineInfo?.spawns.length ?? '-' }}</span>
          </td>

          <td
            class="station-schedules all"
            style="width: 30px"
            :class="{ inactive: !station.onlineInfo }"
          >
            {{ station.onlineInfo?.scheduledTrainCount.all ?? '-' }}
          </td>

          <td
            class="station-schedules unconfirmed"
            style="width: 30px"
            :class="{ inactive: !station.onlineInfo }"
          >
            {{ station.onlineInfo?.scheduledTrainCount.unconfirmed ?? '-' }}
          </td>

          <td
            class="station-schedules confirmed"
            style="width: 30px"
            :class="{ inactive: !station.onlineInfo }"
          >
            {{ station.onlineInfo?.scheduledTrainCount.confirmed ?? '-' }}
          </td>
        </router-link>
      </tbody>
    </table>

    <div class="no-stations" v-else>
      <div>
        {{ $t('sceneries.no-stations') }} (region: <b>{{ mainStore.region.name }}</b
        >)
      </div>

      <div class="text--primary" v-if="getChangedFilters(filters).length != 0">
        ⚠ {{ $t('sceneries.active-filters') }}
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent, inject, computed } from 'vue';
import StationStatusBadge from '../Global/StationStatusBadge.vue';
import Loading from '../Global/Loading.vue';
import dateMixin from '../../mixins/dateMixin';
import styleMixin from '../../mixins/styleMixin';
import { useApiStore } from '../../store/apiStore';
import { useMainStore } from '../../store/mainStore';
import { Status } from '../../typings/common';
import { useTooltipStore } from '../../store/tooltipStore';
import { getChangedFilters } from '../../managers/stationFilterManager';
import { ActiveSorter, HeadIdsType, headIconsIds, headIds } from './typings';
import { filterStations, sortStations } from './utils';

export default defineComponent({
  emits: ['toggleDonationCard'],

  components: { Loading, StationStatusBadge },
  mixins: [styleMixin, dateMixin],

  data: () => ({
    headIconsIds,
    headIds,
    getChangedFilters
  }),

  setup() {
    const mainStore = useMainStore();
    const apiStore = useApiStore();
    const tooltipStore = useTooltipStore();

    const filters = inject('StationsView_filters') as Record<string, any>;
    const activeSorter = inject('StationsView_activeSorter') as ActiveSorter;

    const filteredStationList = computed(() =>
      mainStore.allStationInfo
        .filter((station) => filterStations(station, filters))
        .sort((a, b) => sortStations(a, b, activeSorter))
    );

    return {
      Status: Status.Data,
      mainStore,
      apiStore,
      tooltipStore,
      filters,
      filteredStationList,
      activeSorter
    };
  },

  methods: {
    getSceneryRoute(name: string) {
      const station = this.filteredStationList.find((station) => station.name === name);

      // TODO: Hide tooltips when navigating away

      return {
        name: 'SceneryView',
        query: {
          station: station.name,
          region: this.$route.query.region || undefined
        }
      };
    },

    openDonationCard(e: Event) {
      this.$emit('toggleDonationCard', true);
      this.mainStore.modalLastClickedTarget = e.target;
      this.tooltipStore.hide();
    },

    openForumSite(e: Event, url: string | undefined) {
      if (!url) return;
      e.preventDefault();
      window.open(url, '_blank');
    },

    changeSorter(headerName: HeadIdsType) {
      if (headerName == 'general') return;

      if (headerName == this.activeSorter.headerName)
        this.activeSorter.dir = -1 * this.activeSorter.dir;
      else this.activeSorter.dir = 1;

      this.activeSorter.headerName = headerName;
    }
  }
});
</script>

<style lang="scss" scoped>
@import '../../styles/responsive.scss';
@import '../../styles/variables.scss';
@import '../../styles/icons.scss';

$rowCol: #424242;

.station_table {
  height: 90vh;
  max-height: 2000px;
  min-height: 700px;
  overflow: auto;
  font-weight: 500;
}

.no-stations {
  text-align: center;
  font-size: 1.25em;
  padding: 1em;
  background: #1a1a1a;
  line-height: 1.5em;
}

table {
  border-collapse: collapse;
  table-layout: fixed;
  width: 100%;
  min-width: 1250px;
  white-space: wrap;

  thead tr {
    background-color: $bgCol;
  }

  thead th {
    position: sticky;
    top: 0;

    &.station {
      width: 12em;
    }

    &.min-lvl {
      width: 4em;
    }

    &.status {
      width: 10em;
    }

    &.dispatcher {
      width: 12em;
    }

    &.dispatcher-lvl {
      width: 6em;
    }

    &.routes-double,
    &.routes-single {
      width: 7em;
    }

    &.general {
      width: 11em;
    }

    &.header-image {
      width: 3.5em;

      &.user {
        width: 5em;
      }
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

tr, .a-row {
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
    padding: 0.15em 0;
    text-align: center;
    cursor: pointer;
    overflow: hidden;
    text-overflow: ellipsis;

    &.inactive {
      opacity: 0.2;
    }

    @include smallScreen() {
      margin: 0;
      padding: 0.3em 0.5em;
      font-size: 1em;
    }
  }
}

.station-name {
  font-weight: bold;
  max-width: 200px;

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

.station-level,
.station-dispatcher-exp {
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

.station-dispatcher-name {
  img {
    max-width: 1.35em;
    vertical-align: text-bottom;
  }
}

.station-level {
  span {
    background-color: #888;
    border-radius: 50%;
  }
}

.station-info {
  .icon-info {
    vertical-align: middle;
    line-height: 2.5em;

    width: 2.5em;
    height: 2.5em;
    font-size: 0.8em;
    margin: 0 3px;

    outline: 2px solid #2b2b2b;
    border-radius: 5px;
  }
}

.station-tracks {
  .no-catenary {
    background-color: #939393;
  }

  .catenary {
    background-color: #009dce;
  }

  .separator {
    background-color: #b3b3b3;
    padding: 2px;
  }

  .track {
    display: inline-block;
    text-align: center;
    width: 1.3em;
    padding: 0.35em 0;
    font-size: 1.1em;
    margin: 0 0.2em;
  }
}

.station-schedules {
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
</style>
