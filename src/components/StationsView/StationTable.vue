<template>
  <section class="station_table">
    <transition name="status-anim" mode="out-in">
      <div class="table_wrapper" :key="apiStore.dataStatuses.connection">
        <table>
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
              v-for="station in stations"
              :class="{ 'last-selected': lastSelectedStationName == station.name }"
              :key="station.name"
              @click.left="setScenery(station.name)"
              @click.right="openForumSite($event, station.generalInfo?.url)"
              @keydown.enter="setScenery(station.name)"
              @keydown.space="openForumSite($event, station.generalInfo?.url)"
              tabindex="0"
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
                    @click.stop="openDonationModal"
                    data-popup-key="DonatorPopUp"
                    :data-popup-content="$t('donations.dispatcher-message')"
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
                  {{
                    station.onlineInfo.dispatcherExp < 2 ? 'L' : station.onlineInfo.dispatcherExp
                  }}
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
                    $t('sceneries.info.signals-type') +
                    $t(`signals.${station.generalInfo.signalType}`)
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

              <td class="station-users" :class="{ inactive: !station.onlineInfo }">
                <span class="text--primary">{{ station.onlineInfo?.currentUsers ?? '-' }}</span>
                /
                <span class="text--primary">{{ station.onlineInfo?.maxUsers ?? '-' }}</span>
              </td>

              <td class="station-likes" :class="{ inactive: !station.onlineInfo }">
                <span>{{ station.onlineInfo?.dispatcherRate ?? '-' }}</span>
              </td>

              <td class="station-spawns" :class="{ inactive: !station.onlineInfo }">
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
            </tr>
          </tbody>
        </table>

        <Loading
          v-if="apiStore.dataStatuses.connection == Status.Loading && stations.length == 0"
        />

        <div class="no-stations" v-else-if="stations.length == 0">
          {{ $t('sceneries.no-stations') }}
        </div>
      </div>
    </transition>
  </section>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import dateMixin from '../../mixins/dateMixin';
import styleMixin from '../../mixins/styleMixin';
import Station from '../../scripts/interfaces/Station';
import { useStationFiltersStore } from '../../store/stationFiltersStore';
import { useMainStore } from '../../store/mainStore';
import Loading from '../Global/Loading.vue';
import { HeadIdsTypes, headIconsIds, headIds } from '../../scripts/data/stationHeaderNames';
import StationStatusBadge from '../Global/StationStatusBadge.vue';
import { Status } from '../../typings/common';
import { useApiStore } from '../../store/apiStore';
import popupMixin from '../../mixins/popupMixin';

export default defineComponent({
  props: {
    stations: {
      type: Array as PropType<Station[]>,
      required: true
    }
  },

  emits: ['toggleDonationModal'],
  components: { Loading, StationStatusBadge },
  mixins: [styleMixin, dateMixin, popupMixin],

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

    return {
      Status: Status.Data,
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
      this.hidePopUp();
    },

    openForumSite(e: Event, url: string | undefined) {
      if (!url) return;
      e.preventDefault();
      window.open(url, '_blank');
    },

    changeSorter(headerName: HeadIdsTypes) {
      if (headerName == 'general') return;

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
  font-weight: 500;
  height: 90vh;
  min-height: 550px;
}

.no-stations {
  text-align: center;
  font-size: 1.5em;

  padding: 1em;
  margin: 1em 0;

  background: #333;
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

tr {
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
