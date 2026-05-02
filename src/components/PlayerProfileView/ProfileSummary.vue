<template>
  <section class="profile-summary">
    <div class="player-info">
      <div class="info-main">
        <ProfilePlayerAvatar :playerTD2Info="playerTD2Info" />

        <div>
          <h2
            class="player-name-header"
            :class="{ 'text--donator': isPlayerDonator, 'text--creator': isPlayerCreator }"
          >
            <a :href="`https://td2.info.pl/profile/?u=${route.query.playerId}`" target="_blank">
              <img
                v-if="isPlayerDonator"
                src="/images/icon-diamond.svg"
                width="25"
                alt="diamond icon"
              />
              {{ playerName }}
            </a>
          </h2>

          <div class="player-badges">
            <div class="badge-container" v-if="playerInfo.driverStats.driverLevel != null">
              <span
                class="level-badge driver"
                :style="calculateExpStyles(playerInfo.driverStats.driverLevel)"
              >
                {{
                  playerInfo.driverStats.driverLevel > 1 ? playerInfo.driverStats.driverLevel : 'L'
                }}
              </span>
              {{ t('profile.stats.driver') }}
            </div>

            <div class="badge-container" v-if="playerInfo.dispatcherStats.dispatcherLevel != null">
              <span
                class="level-badge dispatcher"
                :style="calculateExpStyles(playerInfo.dispatcherStats.dispatcherLevel)"
              >
                {{
                  playerInfo.dispatcherStats.dispatcherLevel > 1
                    ? playerInfo.dispatcherStats.dispatcherLevel
                    : 'L'
                }}
              </span>
              {{ t('profile.stats.dispatcher') }}
            </div>
          </div>

          <div class="player-journal-links">
            <router-link
              class="a-button btn--action"
              :to="`/journal/timetables?search-driver=${playerInfo.driverStats.driverName}`"
            >
              {{ t('profile.stats.timetables-journal') }}
            </router-link>

            <router-link
              class="a-button btn--action"
              :to="`/journal/dispatchers?search-dispatcher=${playerInfo.dispatcherStats.dispatcherName}`"
            >
              {{ t('profile.stats.dispatchers-journal') }}
            </router-link>

            <a
              class="a-button btn--action"
              :href="`https://td2.info.pl/profile/?u=${route.query.playerId}`"
              target="_blank"
            >
              {{ t('profile.stats.forum-profile') }}
            </a>
          </div>

          <!-- Current activities -->
          <div
            class="player-activities-box"
            v-if="activeDispatches.length > 0 || activeTrains.length > 0"
          >
            <div class="info-activity" v-if="activeDispatches.length > 0">
              <router-link
                v-for="d in activeDispatches"
                class="dispatcher-badge"
                :to="`/scenery?station=${d.stationName}&region=${d.region}`"
              >
                <img src="/images/icon-user.svg" width="25" alt="user icon" />
                <b>{{ d.stationName }} ({{ getRegionNameById(d.region) }})</b>
                <StationStatusBadge :isOnline="true" :dispatcherStatus="d.dispatcherStatus" />
              </router-link>
            </div>

            <div class="info-activity" v-if="activeTrains.length > 0">
              <router-link
                v-for="t in activeTrains"
                :to="`/driver?trainId=${t.id}`"
                class="driver-badge"
              >
                <img src="/images/icon-train.svg" width="25" alt="train icon" />
                <span v-if="t.timetable" class="text--primary">{{ t.timetable.category }}</span>
                <span>{{ t.trainNo }}</span>
                &bull;
                <span>{{ t.currentStationName }} ({{ getRegionNameById(t.region) }})</span>
                &bull;
                <span class="text--grayed">{{ t.stockString.split(';')[0] }}</span>
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="player-stats">
      <div class="stats-driver">
        <h3 class="stats-header">
          <img src="/images/icon-train.svg" width="30" alt="train icon" />
          {{ t('profile.stats.header-driver') }}
        </h3>
        <hr />

        <div v-if="playerInfo.driverStats.countAll > 0">
          <div>
            <b class="text--primary">
              {{ playerInfo.driverStats.countFulfilled }} /
              {{ playerInfo.driverStats.countAll }} ({{
                getCountPercentage(
                  playerInfo.driverStats.countFulfilled,
                  playerInfo.driverStats.countAll,
                  2
                )
              }}%)
            </b>
            - {{ t('profile.stats.fulfilled-timetables') }}
          </div>
          <div>
            <b class="text--primary">
              {{ playerInfo.driverStats.currentDistanceTotal?.toFixed(2) }} /
              {{ playerInfo.driverStats.routeDistanceTotal?.toFixed(2) }} ({{
                getCountPercentage(
                  playerInfo.driverStats.currentDistanceTotal || 0,
                  playerInfo.driverStats.routeDistanceTotal || 0,
                  2
                )
              }}%)
            </b>
            - {{ t('profile.stats.route-distance') }}
          </div>
          <div>
            <b class="text--primary">
              {{ playerInfo.driverStats.confirmedStopsTotal }} /
              {{ playerInfo.driverStats.allStopsTotal }} ({{
                getCountPercentage(
                  playerInfo.driverStats.confirmedStopsTotal || 0,
                  playerInfo.driverStats.allStopsTotal || 0,
                  2
                )
              }}%)
            </b>
            - {{ t('profile.stats.confirmed-stops') }}
          </div>
          <div>
            <b class="text--primary">{{ playerInfo.driverStats.routeDistanceMax || 0 }}km</b> -
            {{ t('profile.stats.longest-timetable') }}
          </div>
          <div>
            <b class="text--primary">
              {{ playerInfo.driverStats.routeDistanceAvg?.toFixed(2) || 0 }}km
            </b>
            - {{ t('profile.stats.avg-timetable-length') }}
          </div>
        </div>

        <div class="text--grayed" v-else>
          {{ t('profile.stats.no-timetable-stats') }}
        </div>
      </div>

      <div
        class="stats-dispatcher"
        v-if="playerInfo.dispatcherStats && playerInfo.dispatcherStats.services?.count"
      >
        <h3 class="stats-header">
          <img src="/images/icon-user.svg" width="30" alt="user icon" />
          {{ t('profile.stats.header-dispatcher') }}
        </h3>

        <hr />

        <div>
          <b class="text--primary">{{ playerInfo.dispatcherStats.services.count }}</b> -
          {{ t('profile.stats.duties-count') }}
        </div>
        <div>
          <b class="text--primary">{{
            humanizeDuration(playerInfo.dispatcherStats.services.durationMax)
          }}</b>
          - {{ t('profile.stats.longest-duty') }}
        </div>

        <div v-if="playerInfo.dispatcherStats.issuedTimetables">
          <div>
            <b class="text--primary">{{ playerInfo.dispatcherStats.issuedTimetables.count }}</b>
            - {{ t('profile.stats.created-timetables-count') }}
          </div>
          <div>
            <b class="text--primary">
              {{ playerInfo.dispatcherStats.issuedTimetables.distanceMax }}km
            </b>
            - {{ t('profile.stats.longest-created-timetable') }}
          </div>
          <div>
            <b class="text--primary">
              {{ playerInfo.dispatcherStats.issuedTimetables.distanceSum.toFixed(2) }}km
            </b>
            - {{ t('profile.stats.created-timetables-length-sum') }}
          </div>
        </div>

        <div class="text--grayed" v-else>
          {{ t('profile.stats.no-dispatcher-stats') }}
        </div>
      </div>
    </div>
  </section>
</template>

<script lang="ts" setup>
import { computed, onActivated, onMounted, PropType, ref, watch } from 'vue';
import { API, Td2API } from '../../typings/api';
import { calculateExpStyles } from '../../composables/badge';
import { getCountPercentage } from '../../utils/calcUtils';
import { humanizeDuration } from '../../composables/time';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useApiStore } from '../../store/apiStore';
import StationStatusBadge from '../Global/StationStatusBadge.vue';
import ProfilePlayerAvatar from './ProfilePlayerAvatar.vue';
import { getRegionNameById } from '../../utils/regionUtils';
import { isCreator } from '../../utils/userUtils';

const { t } = useI18n();

const route = useRoute();
const apiStore = useApiStore();

const props = defineProps({
  playerInfo: {
    type: Object as PropType<API.PlayerInfo.Data>,
    required: true
  },

  playerTD2Info: {
    type: Object as PropType<Td2API.UsersInfoByName.UserInfo>
  },

  playerName: {
    type: String
  }
});

const isPlayerDonator = computed(() =>
  props.playerName ? apiStore.donatorsData.includes(props.playerName) : false
);

const isPlayerCreator = computed(() => (props.playerName ? isCreator(props.playerName) : false));

const activeDispatches = computed(() => {
  if (!props.playerName) return [];
  if (!apiStore.activeData || !apiStore.activeData.activeSceneries) return [];

  return apiStore.activeData.activeSceneries.filter(
    (sc) =>
      sc.dispatcherName == props.playerName && (sc.lastSeen >= Date.now() - 60000 || sc.isOnline)
  );
});

const activeTrains = computed(() => {
  if (!props.playerName) return [];
  if (!apiStore.activeData || !apiStore.activeData.trains) return [];

  return apiStore.activeData.trains.filter(
    (t) => t.driverName == props.playerName && (t.lastSeen >= Date.now() - 60000 || t.online)
  );
});
</script>

<style lang="scss" scoped>
@use '../../styles/badge';
@use '../../styles/responsive';

.profile-summary {
  display: flex;
  flex-direction: column;
  gap: 1em;
  overflow: auto;
}

.player-name-header {
  margin: 0.5em 0;

  a {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.25em;
  }
}

.player-badges {
  display: flex;
  justify-content: center;
  gap: 1em;
}

.badge-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.25em;

  font-weight: bold;

  & > .level-badge {
    font-size: 1.15em;
  }
}

.player-journal-links {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.5em;
  margin-top: 1em;
}

.info-activity {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 1em;
  margin-top: 1em;

  .dispatcher-badge {
    display: flex;
    align-items: center;
    gap: 0.25em;
  }

  .driver-badge {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;

    gap: 0.25em;
    font-weight: bold;
    border-radius: 0.5em;
  }
}

.player-stats {
  display: flex;
  flex-direction: column;
  gap: 1em;

  hr {
    margin: 0.5em 0;
  }
}

.player-info,
.player-stats > div {
  background-color: var(--clr-tile);
  border-radius: 0.5em;
  padding: 1em;
}

.stats-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25em;
}

@include responsive.midScreen {
  .player-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
  }
}

@include responsive.smallScreen {
  .player-stats {
    display: grid;
    grid-template-columns: 1fr;
  }
}
</style>
