<template>
  <section class="profile-summary">
    <div class="summary-main">
      <div class="summary-box">
        <div class="main-player-name">
          <img v-if="isPlayerDonator" src="/images/icon-diamond.svg" alt="diamond icon" />

          <h2>
            <a
              class="a-link"
              :class="{ 'text--donator': isPlayerDonator, 'text--creator': isPlayerCreator }"
              :href="`https://td2.info.pl/profile/?u=${route.query.playerId}`"
              target="_blank"
            >
              {{ playerName }}
            </a>
          </h2>

          <img
            v-if="playerInfo.languageId != null"
            class="g-image"
            :src="`/images/flags/${getLanguageNameById(playerInfo.languageId)}.svg`"
            alt="language flag"
          />
        </div>

        <div class="main-last-seen">
          <span v-if="activeDispatches.length > 0 && activeTrains.length > 0" class="active">
            <WifiIcon :size="20" /> {{ t('profile.stats.active-as-both') }}
          </span>

          <span v-else-if="activeTrains.length > 0" class="active">
            <WifiIcon :size="20" /> {{ t('profile.stats.active-as-driver') }}
          </span>

          <span v-else-if="activeDispatches.length > 0" class="active">
            <WifiIcon :size="20" /> {{ t('profile.stats.active-as-dispatcher') }}
          </span>

          <span
            v-else-if="playerInfo.lastSeen && Date.now() - playerInfo.lastSeen < 300000"
            class="active"
          >
            <WifiOffIcon :size="20" />

            {{ t('profile.stats.last-seen-active') }}
          </span>

          <span
            v-else-if="playerInfo.lastSeen && Date.now() - playerInfo.lastSeen < 3600000"
            class="offline-recently"
          >
            <WifiOffIcon :size="20" />

            {{
              t('profile.stats.last-seen-relative', {
                n: humanizeDuration(Date.now() - new Date(playerInfo.lastSeen).getTime())
              })
            }}
          </span>

          <span v-else-if="playerInfo.lastSeen" class="offline">
            <WifiOffIcon :size="20" />

            {{
              t('profile.stats.last-seen-date', {
                date: dateToLocaleString(new Date(playerInfo.lastSeen), { dateStyle: 'short' }),
                time: dateToLocaleString(new Date(playerInfo.lastSeen), { timeStyle: 'short' })
              })
            }}
          </span>
        </div>

        <!-- Current activities -->
        <div
          class="main-current-activities"
          v-if="activeDispatches.length > 0 || activeTrains.length > 0"
        >
          <div class="activity" v-if="activeDispatches.length > 0">
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

          <div class="activity" v-if="activeTrains.length > 0">
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

        <!-- Links -->
        <div class="main-links">
          <router-link
            class="a-button btn--action"
            :to="`/journal/timetables?search-driver=${playerInfo.driverStats.driverName}`"
          >
            <img src="/images/icon-timetable.svg" width="20" alt="timetable icon" />
            {{ t('profile.stats.timetables-journal') }}
          </router-link>

          <router-link
            class="a-button btn--action"
            :to="`/journal/dispatchers?search-dispatcher=${playerInfo.dispatcherStats.dispatcherName}`"
          >
            <img src="/images/icon-user.svg" width="20" alt="user icon" />
            {{ t('profile.stats.dispatchers-journal') }}
          </router-link>

          <a
            class="a-button btn--action"
            :href="`https://td2.info.pl/profile/?u=${route.query.playerId}`"
            target="_blank"
          >
            <TypeOutlineIcon :size="20" />
            {{ t('profile.stats.forum-profile') }}
          </a>
        </div>
      </div>
    </div>

    <div class="summary-stats">
      <!-- Driver stats box -->
      <div class="summary-box stats-driver">
        <h3 class="stats-header">
          <LevelBadge
            v-if="playerInfo.driverStats.driverLevel"
            badge-type="driver"
            :level="playerInfo.driverStats.driverLevel"
          />

          {{ t('profile.stats.header-driver') }}
        </h3>

        <hr />

        <div class="stats-container">
          <!-- Timetable count -->
          <div v-if="playerInfo.driverStats.countAll > 0" class="stat-item">
            <img src="/images/icon-timetable.svg" width="20" alt="timetable icon" />

            <span>
              <b>{{ t('profile.stats.fulfilled-timetables') }}: </b>

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
            </span>
          </div>

          <!-- Timetable distance -->
          <div v-if="playerInfo.driverStats.countAll > 0" class="stat-item">
            <GaugeIcon width="25" />

            <span>
              <b>{{ t('profile.stats.route-distance') }}: </b>

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
            </span>
          </div>

          <!-- Stops count -->
          <div v-if="playerInfo.driverStats.allStopsTotal" class="stat-item">
            <CheckIcon width="25" />

            <span>
              <b>{{ t('profile.stats.confirmed-stops') }}: </b>
              <b class="text--primary">
                {{ playerInfo.driverStats.confirmedStopsTotal || 0 }} /
                {{ playerInfo.driverStats.allStopsTotal || 0 }} ({{
                  getCountPercentage(
                    playerInfo.driverStats.confirmedStopsTotal || 0,
                    playerInfo.driverStats.allStopsTotal || 0,
                    2
                  )
                }}%)
              </b>
            </span>
          </div>

          <!-- Max. distance -->
          <div v-if="playerInfo.driverStats.routeDistanceMax" class="stat-item">
            <StarIcon width="25" />

            <span>
              <b>{{ t('profile.stats.longest-timetable') }}: </b>
              <b class="text--primary">{{ playerInfo.driverStats.routeDistanceMax }}km</b>
            </span>
          </div>

          <!-- Avg. distance -->
          <div v-if="playerInfo.driverStats.routeDistanceAvg" class="stat-item">
            <CircleSlash2 width="25" />

            <span>
              <b>{{ t('profile.stats.avg-timetable-length') }}: </b>
              <b class="text--primary">
                {{ playerInfo.driverStats.routeDistanceAvg.toFixed(2) }}km</b
              >
            </span>
          </div>
        </div>

        <!-- No stats info -->
        <div class="text--grayed" v-if="playerInfo.driverStats.countAll == 0">
          {{ t('profile.stats.no-timetable-stats') }}
        </div>
      </div>

      <!-- Dispatcher stats box -->
      <div class="summary-box stats-dispatcher">
        <h3 class="stats-header">
          <LevelBadge
            v-if="playerInfo.dispatcherStats.dispatcherLevel"
            badge-type="dispatcher"
            :level="playerInfo.dispatcherStats.dispatcherLevel"
          />

          <img src="/images/icon-abandoned.svg" width="30" alt="user icon" v-else />
          {{ t('profile.stats.header-dispatcher') }}
        </h3>

        <hr />

        <div class="stats-container">
          <div v-if="playerInfo.dispatcherStats.services" class="stat-item">
            <UserIcon />

            <span>
              <b>{{ t('profile.stats.duties-count') }}: </b>
              <b class="text--primary">{{ playerInfo.dispatcherStats.services.count }}</b>
            </span>
          </div>

          <div v-if="playerInfo.dispatcherStats.services" class="stat-item">
            <FlameIcon />

            <span>
              <b>{{ t('profile.stats.longest-duty') }}: </b>
              <b class="text--primary">
                {{ humanizeDuration(playerInfo.dispatcherStats.services.durationMax) }}
              </b>
            </span>
          </div>

          <div v-if="playerInfo.dispatcherStats.issuedTimetables" class="stat-item">
            <img src="/images/icon-timetable.svg" width="20" alt="timetable icon" />

            <span>
              <b>{{ t('profile.stats.created-timetables-count') }}: </b>
              <b class="text--primary">{{ playerInfo.dispatcherStats.issuedTimetables.count }}</b>
            </span>
          </div>

          <div v-if="playerInfo.dispatcherStats.issuedTimetables" class="stat-item">
            <StarIcon />

            <span>
              <b>{{ t('profile.stats.longest-created-timetable') }}: </b>
              <b class="text--primary">
                {{ playerInfo.dispatcherStats.issuedTimetables.distanceMax }}km
              </b>
            </span>
          </div>

          <div v-if="playerInfo.dispatcherStats.issuedTimetables" class="stat-item">
            <SigmaIcon />

            <span>
              <b>{{ t('profile.stats.created-timetables-length-sum') }}: </b>
              <b class="text--primary">
                {{ playerInfo.dispatcherStats.issuedTimetables.distanceSum.toFixed(2) }}km
              </b>
            </span>
          </div>
        </div>

        <div class="no-issued-timetables" v-if="!playerInfo.dispatcherStats.services">
          {{ t('profile.stats.no-dispatcher-stats') }}
        </div>

        <div class="no-issued-timetables" v-else-if="!playerInfo.dispatcherStats.issuedTimetables">
          {{ t('profile.stats.no-issued-timetables') }}
        </div>
      </div>
    </div>
  </section>
</template>

<script lang="ts" setup>
import { computed, PropType } from 'vue';
import { API } from '../../typings/api';
import { getCountPercentage } from '../../utils/calcUtils';
import { dateToLocaleString, humanizeDuration } from '../../composables/time';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useApiStore } from '../../store/apiStore';
import StationStatusBadge from '../Global/StationStatusBadge.vue';
import { getRegionNameById } from '../../utils/regionUtils';
import { isCreator } from '../../utils/userUtils';
import { getLanguageNameById } from '@/utils/languageUtils';
import LevelBadge from '../Global/LevelBadge.vue';
import {
  CheckIcon,
  CircleSlash2,
  FlameIcon,
  GaugeIcon,
  SigmaIcon,
  StarIcon,
  TypeOutlineIcon,
  UserIcon,
  WifiIcon,
  WifiOffIcon
} from '@lucide/vue';

const { t } = useI18n();

const route = useRoute();
const apiStore = useApiStore();

const props = defineProps({
  playerInfo: {
    type: Object as PropType<API.PlayerInfo.Data>,
    required: true
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

.main-player-name {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5em;

  img {
    height: 1.2em;
  }
}

.main-badges {
  display: flex;
  justify-content: center;
  gap: 1em;

  margin-top: 1em;
}

.badge-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.25em;

  font-weight: bold;
}

.main-links {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.5em;

  margin-top: 1em;
}

.main-last-seen {
  margin-top: 0.5em;

  span {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5em;
  }

  .active {
    color: var(--clr-success);
  }

  .offline-recently {
    color: var(--clr-primary);
  }

  .offline {
    color: #ccc;
  }
}

.activity {
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

.summary-box {
  background-color: var(--clr-tile);
  border-radius: 0.5em;
  padding: 1em;
}

.summary-stats {
  display: flex;
  flex-direction: column;
  gap: 1em;

  hr {
    margin: 0.5em 0;
  }
}

.stats-container {
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  text-align: left;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.25em;

  svg,
  img {
    width: 20px;
  }
}

.stats-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25em;

  img {
    border-radius: 0.5em;
  }
}

.no-issued-timetables {
  color: var(--clr-grayed);
  margin-top: 0.5em;
}

@include responsive.midScreen {
  .summary-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(430px, 1fr));
  }
}
</style>
