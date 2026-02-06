<template>
  <div class="profile-view">
    <div class="view-container">
      <div class="profile-sidebar">
        <div class="player-summary">
          <img
            src="https://td2.info.pl/index.php?action=dlattach;attach=83477;type=avatar"
            alt="player image"
            width="110"
          />

          <h3>Spythere</h3>
          <p>12 poziom maszynisty</p>
          <p>12 poziom dyżurnego</p>
          <p>Ostatnia aktywność: 02.02.2026 (DR)</p>
          <p>Stacjosponsor od 01.01.2024</p>
        </div>

        <div class="player-stats">
          <div class="stats-driver">
            <img src="/images/icon-train.svg" width="35" alt="train icon" />
            <h3>STATYSTYKI MASZYNISTY</h3>
            <hr />

            <div><b class="text--primary">522 / 619 (95.39%)</b> - wypełnione rozkłady jazdy</div>
            <div>
              <b class="text--primary">16091 / 17149 (95.39%)</b> - zatwierdzony kilometraż w RJ
            </div>
            <div>
              <b class="text--primary">2420 / 2537 (95.39%)</b> - potwierdzonych stacji w RJ
            </div>
            <div><b class="text--primary">237.13km</b> - najdłuższy rozkład jazdy</div>
            <div><b class="text--primary">60.39km</b> - średnia długość wszystkich rozkładów</div>
          </div>

          <div class="stats-dispatcher">
            <img src="/images/icon-user.svg" width="35" alt="user icon" />
            <h3>STATYSTYKI DYŻURNEGO RUCHU</h3>
            <hr />

            <div><b class="text--primary">25</b> - służby jako dyżurny ruchu</div>
            <div><b class="text--primary">6 godz. 13 min.</b> - najdłuższa służba</div>
            <div><b class="text--primary">14</b> - wystawione RJ jako dyżurny ruchu</div>
            <div><b class="text--primary">80.81km</b> - najdłuższy wystawiony RJ</div>
            <div><b class="text--primary">670.80km</b> - suma długości wystawionych RJ</div>
          </div>
        </div>
      </div>

      <div class="profile-main">
        <h3 class="main-header">STATYSTYKI AKTYWNOŚCI (30 OSTATNICH DNI)</h3>

        <div class="main-month-stats">
          <div class="month-stats-box">
            <div class="month-stat">
              <div><img src="/images/icon-train.svg" width="30" alt="train icon" /></div>
              <div><h3 class="text--primary">55</h3></div>
              <div>
                ROZKŁADÓW <br />
                JAZDY
              </div>
            </div>

            <div class="month-stat">
              <div><img src="/images/icon-spawn.svg" width="30" alt="spawn icon" /></div>
              <div><h3 class="text--primary">5500</h3></div>
              <div>
                POKONANYCH <br />
                KILOMETRÓW
              </div>
            </div>

            <div class="month-stat">
              <div><img src="/images/icon-user.svg" width="30" alt="user icon" /></div>
              <div><h3 class="text--primary">15</h3></div>
              <div>
                SŁUŻB <br />
                DYŻURNEGO
              </div>
            </div>

            <div class="month-stat">
              <div><img src="/images/icon-timetable.svg" width="30" alt="timetable icon" /></div>
              <div><h3 class="text--primary">12</h3></div>
              <div>
                WYSTAWIONYCH <br />
                ROZKŁADÓW
              </div>
            </div>
          </div>
        </div>

        <h3 class="main-header">OSTATNIA AKTYWNOŚĆ GRACZA</h3>

        <div class="history-menu">
          <button class="history-menu-button" @click="toggleFilter('Timetable')">
            ROZKŁADY JAZDY
          </button>
          <button class="history-menu-button" @click="toggleFilter('Dispatcher')">SŁUŻBY DR</button>
          <button class="history-menu-button" @click="toggleFilter('IssuedTimetable')">
            WYSTAWIONE RJ
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
                {{
                  entry.date.toLocaleString('pl-PL', { dateStyle: 'long', timeStyle: 'short' })
                }}
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
import { computed, onMounted, reactive, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useApiStore } from '../store/apiStore';
import { API } from '../typings/api';
import { useI18n } from 'vue-i18n';
import { humanizeDuration } from '../composables/time';

type JournalEntryType = 'Timetable' | 'Dispatcher' | 'IssuedTimetable';

interface JournalEntry {
  type: JournalEntryType;
  date: Date;
  value: API.TimetableHistory.DataShort | API.DispatcherHistory.Data;
}

const apiStore = useApiStore();
const route = useRoute();
const { t } = useI18n();

const playerName = ref('');
const playerInfo = ref<API.PlayerInfo.Data | null>(null);
const playerJournal = ref<API.PlayerJournal.Data | null>(null);

const activeFilterTypes = reactive<Record<JournalEntryType, boolean>>({
  Timetable: true,
  Dispatcher: true,
  IssuedTimetable: true
});

onMounted(() => {
  fetchPlayerInfoData();
  fetchPlayerJournal();
});

const combinedJournal = computed<JournalEntry[]>(() => {
  if (!playerJournal.value) return [];

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

async function fetchPlayerInfoData() {
  const playerId = route.params.id.toString();

  if (!apiStore.client || !playerId) return;

  try {
    const response = await apiStore.client.get<API.PlayerInfo.Data>('api/getPlayerInfo', {
      params: {
        playerId: playerId
      }
    });

    playerInfo.value = response.data;
  } catch (error) {
    console.error(error);
  }
}

async function fetchPlayerJournal() {
  const playerId = route.params.id.toString();

  if (!apiStore.client || !playerId) return;

  try {
    const response = await apiStore.client.get<API.PlayerJournal.Data>('api/getPlayerJournal', {
      params: {
        playerId: playerId,
        countLimit: 15
      }
    });

    playerJournal.value = response.data;
    playerName.value =
      response.data.timetables.at(0)?.driverName ||
      response.data.duties.at(0)?.dispatcherName ||
      '';
  } catch (error) {
    console.error(error);
  }
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

  & > button {
    background-color: $tileColor;
    padding: 0.5em;
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
    gap: 0;
    max-width: 1000px;
  }
}

@include responsive.smallScreen {
}
</style>
