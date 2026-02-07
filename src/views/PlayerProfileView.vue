<template>
  <div class="profile-view">
    <div class="view-container" v-if="playerInfo">
      <div class="profile-sidebar">
        <div class="player-summary">
          <img
            v-if="playerTD2Info"
            :src="`https://td2.info.pl/index.php?action=dlattach;attach=${playerTD2Info.avatar};type=avatar`"
            alt="player image"
            height="100"
            @error="(e) => ((e.target as any).src = '/images/default-avatar.jpg')"
          />

          <h3>{{ playerName }}</h3>

          <p v-if="playerTD2Info != null">{{ playerTD2Info.levels.driver }} poziom maszynisty</p>
          <p v-if="playerTD2Info != null">{{ playerTD2Info.levels.dispatcher }} poziom dyżurnego</p>

          <div v-if="combinedJournal.length > 0">
            <!-- <p>Ostatnia aktywność:</p> -->
            <div v-if="playerInfo.currentActivity.dispatcher.length > 0">
              <b class="text--primary">ONLINE JAKO DR:</b>
              {{
                playerInfo.currentActivity.dispatcher
                  .map((d) => `${d.stationName} (${d.stationHash})`)
                  .join(', ')
              }}
            </div>

            <div
              v-if="
                playerInfo.currentActivity.driver && playerInfo.currentActivity.driver.length > 0
              "
            >
              <b>ONLINE JAKO MASZYNISTA:</b>
              {{ playerInfo.currentActivity.driver }}
            </div>
          </div>

          <!-- <p>Stacjosponsor od 01.01.2024</p> -->
        </div>

        <div class="player-stats">
          <div class="stats-driver">
            <img src="/images/icon-train.svg" width="35" alt="train icon" />
            <h3>STATYSTYKI MASZYNISTY</h3>
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
                - wypełnione rozkłady jazdy
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
                - zatwierdzony kilometraż w RJ
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
                - potwierdzonych stacji w RJ
              </div>
              <div>
                <b class="text--primary">{{ playerInfo.driverStats.routeDistanceMax || 0 }}km</b> -
                najdłuższy rozkład jazdy
              </div>
              <div>
                <b class="text--primary">
                  {{ playerInfo.driverStats.routeDistanceAvg?.toFixed(2) || 0 }}km
                </b>
                - średnia długość wszystkich rozkładów
              </div>
            </div>

            <div class="text--grayed" v-else>
              Ten użytkownik nie posiada statystyk maszynisty zarejestrowanych przez Stacjownik!
            </div>
          </div>

          <div
            class="stats-dispatcher"
            v-if="playerInfo.dispatcherStats && playerInfo.dispatcherStats.services?.count"
          >
            <img src="/images/icon-user.svg" width="35" alt="user icon" />
            <h3>STATYSTYKI DYŻURNEGO RUCHU</h3>
            <hr />

            <div>
              <b class="text--primary">{{ playerInfo.dispatcherStats.services.count }}</b> - służby
              jako dyżurny ruchu
            </div>
            <div>
              <b class="text--primary">{{
                humanizeDuration(playerInfo.dispatcherStats.services.durationMax)
              }}</b>
              - najdłuższa służba
            </div>

            <div v-if="playerInfo.dispatcherStats.issuedTimetables">
              <div>
                <b class="text--primary">{{ playerInfo.dispatcherStats.issuedTimetables.count }}</b>
                - wystawione RJ jako dyżurny ruchu
              </div>
              <div>
                <b class="text--primary">
                  {{ playerInfo.dispatcherStats.issuedTimetables.distanceMax }}km
                </b>
                - najdłuższy wystawiony RJ
              </div>
              <div>
                <b class="text--primary">
                  {{ playerInfo.dispatcherStats.issuedTimetables.distanceSum.toFixed(2) }}km
                </b>
                - suma długości wystawionych RJ
              </div>
            </div>

            <div class="text--grayed" v-else>
              Ten dyżurny nie wystawił jeszcze żadnego rozkładu jazdy
            </div>
          </div>
        </div>
      </div>

      <div class="profile-main">
        <h3 class="main-header">STATYSTYKI AKTYWNOŚCI (30 OSTATNICH DNI)</h3>

        <div class="main-month-stats">
          <div class="month-stats-box">
            <div class="month-stat">
              <div><img src="/images/icon-train.svg" width="30" alt="train icon" /></div>
              <div>
                <h3 class="text--primary">{{ playerInfo.driverStatsLastMonth.countAll }}</h3>
              </div>
              <div>
                ROZKŁADÓW <br />
                JAZDY
              </div>
            </div>

            <div class="month-stat">
              <div><img src="/images/icon-spawn.svg" width="30" alt="spawn icon" /></div>
              <div>
                <h3 class="text--primary">
                  {{ playerInfo.driverStatsLastMonth.currentDistanceTotal || 0 }}
                </h3>
              </div>
              <div>
                POKONANYCH <br />
                KILOMETRÓW
              </div>
            </div>

            <div class="month-stat">
              <div><img src="/images/icon-user.svg" width="30" alt="user icon" /></div>
              <div>
                <h3 class="text--primary">
                  {{ playerInfo.dispatcherStatsLastMonth.services?.count || 0 }}
                </h3>
              </div>
              <div>
                SŁUŻB <br />
                DYŻURNEGO
              </div>
            </div>

            <div class="month-stat">
              <div><img src="/images/icon-timetable.svg" width="30" alt="timetable icon" /></div>
              <div>
                <h3 class="text--primary">
                  {{ playerInfo.dispatcherStatsLastMonth.issuedTimetables?.count || 0 }}
                </h3>
              </div>
              <div>
                WYSTAWIONYCH <br />
                ROZKŁADÓW
              </div>
            </div>
          </div>
        </div>

        <h3 class="main-header">OSTATNIA AKTYWNOŚĆ GRACZA</h3>

        <div class="history-menu">
          <button
            v-for="(filterState, filterKey) in activeFilterTypes"
            class="menu-btn"
            :data-active="filterState"
            @click="toggleFilter(filterKey)"
          >
            {{ t(`profile.filters.${filterKey}`) }}
          </button>
        </div>

        <div class="history-list-box">
          <ul>
            <li v-for="entry in combinedJournal">
              <img
                v-if="entry.type == 'Dispatcher'"
                src="/images/icon-user.svg"
                width="20"
                alt="user icon"
              />

              <img
                v-else-if="entry.type == 'Timetable'"
                src="/images/icon-train.svg"
                width="20"
                alt="train icon"
              />

              <img v-else src="/images/icon-timetable.svg" width="20" alt="timetable icon" />

              <b class="text--grayed">
                {{ entry.date.toLocaleString('pl-PL', { dateStyle: 'long', timeStyle: 'short' }) }}
              </b>

              <!-- Timetables -->
              <span v-if="'trainNo' in entry.value">
                <b class="text--primary">
                  {{ entry.value.trainCategoryCode }} {{ entry.value.trainNo }}
                </b>
                <b class="text--grayed" v-if="entry.type == 'IssuedTimetable'">
                  dla: {{ entry.value.driverName }}
                </b>
                {{ ' ' }}
                <b>{{ entry.value.route.replace('|', ' > ') }}</b>
                {{ ' ' }}
                <b>({{ entry.value.currentDistance }} / {{ entry.value.routeDistance }}km) </b>
              </span>

              <!-- Dispatchers -->
              <span v-else>
                <b>{{ entry.value.stationName }}</b>
                {{ ' - ' }}
                <b>{{
                  humanizeDuration(
                    (entry.value.timestampTo || Date.now()) - entry.value.timestampFrom
                  )
                }}</b>
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onActivated, onMounted, reactive, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useApiStore } from '../store/apiStore';
import { API, Td2API } from '../typings/api';
import { humanizeDuration } from '../composables/time';
import { useI18n } from 'vue-i18n';
import axios from 'axios';
import { getCountPercentage } from '../utils/calcUtils';

type JournalEntryType = 'Timetable' | 'Dispatcher' | 'IssuedTimetable';

interface JournalEntry {
  type: JournalEntryType;
  date: Date;
  value: API.TimetableHistory.DataShort | API.DispatcherHistory.Data;
}

const { t } = useI18n();
const apiStore = useApiStore();
const route = useRoute();

const playerName = ref('');

const playerInfo = ref<API.PlayerInfo.Data | null>(null);
const playerJournal = ref<API.PlayerJournal.Data | null>(null);
const playerTD2Info = ref<Td2API.UsersInfoByName.UserInfo | null>(null);

const activeFilterTypes = reactive<Record<JournalEntryType, boolean>>({
  Timetable: true,
  Dispatcher: true,
  IssuedTimetable: true
});

watch(
  computed(() => route.query.playerId),
  () => {
    fetchAllData();
  }
);

onMounted(() => {
  fetchAllData();
});

const combinedJournal = computed<JournalEntry[]>(() => {
  if (!playerJournal.value || !playerName.value) return [];

  const list = [
    ...playerJournal.value.timetables,
    ...playerJournal.value.duties,
    ...playerJournal.value.issuedTimetables
  ]
    .reduce<JournalEntry[]>((acc, v) => {
      // Timetable or dispatcher type
      if ('trainNo' in v) {
        const isIssued = v.authorName == playerName.value;

        if (!isIssued && !activeFilterTypes['Timetable']) return acc;
        if (isIssued && !activeFilterTypes['IssuedTimetable']) return acc;

        acc.push({
          date: new Date(v.createdAt),
          type: isIssued ? 'IssuedTimetable' : 'Timetable',
          value: v
        });
      } else {
        if (!activeFilterTypes['Dispatcher']) return acc;

        acc.push({
          date: new Date(v.timestampFrom),
          type: 'Dispatcher',
          value: v
        });
      }

      return acc;
    }, [])
    .sort((a, b) => {
      return a.date.getTime() - b.date.getTime() > 0 ? -1 : 1;
    });

  return list;
});

async function fetchAllData() {
  const playerId = route.query.playerId?.toString();

  if (!playerId) return;

  const playerInfoResponse = await fetchPlayerInfoData(playerId);

  if (!playerInfoResponse) return;

  playerName.value =
    playerInfoResponse.driverStats.driverName ||
    playerInfoResponse.dispatcherStats.dispatcherName ||
    '';

  if (!playerName.value) return;

  const playerTd2InfoResponse = await fetchPlayerTD2Info(playerName.value);
  const playerJournalResponse = await fetchPlayerJournal(playerId);

  playerInfo.value = playerInfoResponse;
  playerTD2Info.value = playerTd2InfoResponse;
  playerJournal.value = playerJournalResponse;
}

async function fetchPlayerInfoData(playerId: string) {
  if (!apiStore.client || !playerId) return null;

  try {
    const response = await apiStore.client.get<API.PlayerInfo.Data>('api/getPlayerInfo', {
      params: {
        playerId: playerId
      }
    });

    return response.data;
  } catch (error) {
    console.error(error);
  }

  return null;
}

async function fetchPlayerJournal(playerId: string) {
  if (!apiStore.client || !playerId) return null;

  try {
    const response = await apiStore.client.get<API.PlayerJournal.Data>('api/getPlayerJournal', {
      params: {
        playerId: playerId,
        countLimit: 15
      }
    });

    return response.data;
  } catch (error) {
    console.error(error);
  }

  return null;
}

async function fetchPlayerTD2Info(playerName: string) {
  if (!apiStore.client || !playerName) return null;

  try {
    const response = await axios.get<Td2API.UsersInfoByName.Response>('https://api.td2.info.pl', {
      params: {
        method: 'getUsersInfoByName',
        name: playerName
      }
    });

    if (response.data.success && response.data.message.length == 1) {
      return response.data.message[0];
    }
  } catch (error) {
    console.error(error);
  }

  return null;
}

function toggleFilter(filterType: JournalEntryType) {
  const toggledState = !activeFilterTypes[filterType];

  // Prevent switching off all filters at the same time (at least one must be active)
  if (
    toggledState === false &&
    Object.values(activeFilterTypes).filter((v) => v === false).length ==
      Object.values(activeFilterTypes).length - 1
  )
    return;

  activeFilterTypes[filterType] = toggledState;
}
</script>

<style lang="scss" scoped>
@use '../styles/responsive';

$tileColor: #181818;

.profile-view {
  display: flex;
  justify-content: center;
}

.view-container {
  display: grid;
  grid-template-columns: 500px 1fr;

  gap: 1em;

  position: relative;

  max-width: var(--max-container-width);
  width: 100%;
  // height: calc(100vh - 0.5em);
  min-height: 900px;

  padding: 1rem 0;
  text-align: center;
}

.view-container > div {
  position: relative;

  // border-radius: 0.5em;
}

.profile-sidebar {
  display: flex;
  flex-direction: column;
  gap: 1em;
}

.player-stats {
  display: flex;
  flex-direction: column;
  gap: 1em;

  hr {
    margin: 0.5em 0;
  }
}

.player-summary,
.player-stats > div {
  background-color: $tileColor;
  border-radius: 0.5em;
  padding: 1em;
}

.profile-main {
  overflow: hidden;
}

.main-header {
  padding: 0.5em;
  background-color: $tileColor;
  margin-bottom: 0.5em;
  border-radius: 0.5em;
}

.month-stats-box {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5em;
  margin-bottom: 1em;
}

.month-stat {
  background-color: $tileColor;
  border-radius: 0.5em;
  padding: 0.5em;
}

.history-menu {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1em;
  padding: 0 1px;
}

.menu-btn {
  background-color: $tileColor;
  padding: 0.5em;
  font-weight: bold;
  color: #aaa;

  &:hover {
    background-color: #2b2b2b;
  }

  &[data-active='true'] {
    color: var(--clr-success);
  }
}

.history-list-box {
  overflow: auto;
  height: 650px;
  margin-top: 1em;

  & > ul > li {
    display: flex;
    align-items: center;
    gap: 0.25em;

    background-color: $tileColor;
    padding: 0.5em;

    margin-bottom: 0.5em;
    text-align: initial;
  }
}

@include responsive.midScreen {
  .view-container {
    grid-template-columns: 1fr;
    max-width: 1000px;
  }

  .player-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
  }
}
</style>
