<template>
  <section class="profile-history-list">
    <div class="list-header">
      <div class="history-menu">
        <button
          v-for="(filterState, filterKey) in activeFilterTypes"
          class="menu-btn btn--option"
          :data-active="filterState"
          @click="toggleFilter(filterKey)"
        >
          {{ t(`profile.filters.${filterKey}`) }}
        </button>
      </div>
    </div>

    <div class="history-list-box">
      <Loading v-if="journalDataStatus == Status.Data.Loading" />

      <div v-else-if="combinedJournal.length == 0" class="no-recent-history">
        {{ t('profile.list.no-recent-history') }}
      </div>

      <router-link
        v-else
        v-for="entry in combinedJournal"
        :to="
          'trainNo' in entry.value
            ? `/journal/timetables?search-train=%23${entry.value.id}`
            : `/journal/dispatchers?search-duty-id=${entry.value.id}`
        "
      >
        <!-- Date -->
        <div class="entry-top-date">
          <img
            v-if="entry.type == 'Dispatcher'"
            src="/images/icon-user.svg"
            width="25"
            alt="user icon"
          />

          <img
            v-else-if="entry.type == 'Timetable'"
            src="/images/icon-train.svg"
            width="25"
            alt="train icon"
          />

          <img v-else src="/images/icon-timetable.svg" width="25" alt="timetable icon" />

          <b
            class="timestamp-indicator"
            :data-online="
              'isOnline' in entry.value
                ? entry.value.isOnline
                : !entry.value.terminated && entry.type != 'IssuedTimetable'
            "
          >
            {{ dateToLocaleString(entry.date, { dateStyle: 'long', timeStyle: 'short' }) }}
            <span v-if="'timestampTo' in entry.value && entry.value.timestampTo">
              -
              <span v-if="new Date(entry.value.timestampTo).getDay() == entry.date.getDay()">{{
                dateToLocaleString(new Date(entry.value.timestampTo), {
                  timeStyle: 'short'
                })
              }}</span>
              <span v-else>{{
                dateToLocaleString(new Date(entry.value.timestampTo), {
                  dateStyle: 'long',
                  timeStyle: 'short'
                })
              }}</span>
            </span>
          </b>
        </div>

        <!-- Timetables -->
        <div v-if="'trainNo' in entry.value">
          <b class="text--primary">
            {{ entry.value.trainCategoryCode }}
          </b>
          {{ ' ' }}
          <b>{{ entry.value.trainNo }}</b>
          <b class="text--grayed" v-if="entry.type == 'IssuedTimetable'">
            {{ ' ' }} {{ t('profile.list.for') }}: {{ entry.value.driverName }}
          </b>
          {{ ' ' }}
          <b>{{ entry.value.route.replace('|', ' > ') }}</b>
          {{ ' ' }}
          <b class="text--primary">{{ entry.value.currentDistance }} km</b>
          <b> / {{ entry.value.routeDistance }} km</b>
        </div>

        <!-- Dispatchers -->
        <div v-else>
          <b class="text--primary">{{ entry.value.stationName }}</b>
          {{ ' - ' }}
          <b class="timestamp-indicator" :data-online="entry.value.isOnline">
            <span v-if="entry.value.isOnline">{{ t('profile.list.online-since') }}: </span>
            <span>{{
              humanizeDuration((entry.value.timestampTo || Date.now()) - entry.value.timestampFrom)
            }}</span>
          </b>
        </div>
      </router-link>
    </div>
  </section>
</template>

<script lang="ts" setup>
import { computed, onActivated, onDeactivated, onMounted, reactive, ref } from 'vue';
import { dateToLocaleString, humanizeDuration } from '../../composables/time';
import { API } from '../../typings/api';
import { useI18n } from 'vue-i18n';
import { useApiStore } from '../../store/apiStore';
import { useRoute } from 'vue-router';
import { Status } from '../../typings/common';
import Loading from '../Global/Loading.vue';

type JournalEntryType = 'Timetable' | 'Dispatcher' | 'IssuedTimetable';

interface JournalEntry {
  type: JournalEntryType;
  date: Date;
  value: API.TimetableHistory.DataShort | API.DispatcherHistory.Data;
}

const props = defineProps({
  playerName: {
    type: String
  }
});

const { t } = useI18n();
const apiStore = useApiStore();
const route = useRoute();

const playerId = ref(-1);
const playerJournal = ref<API.PlayerJournal.Data | null>(null);
const journalDataStatus = ref(Status.Data.Initialized);

const intervalId = ref(-1);

const activeFilterTypes = reactive<Record<JournalEntryType, boolean>>({
  Timetable: true,
  Dispatcher: true,
  IssuedTimetable: true
});

onMounted(() => {
  fetchPlayerJournal();
  intervalId.value = setInterval(fetchPlayerJournal, 30000);
});

onDeactivated(() => {
  clearInterval(intervalId.value);
  intervalId.value = -1;
});

const combinedJournal = computed<JournalEntry[]>(() => {
  if (!playerJournal.value || !props.playerName) return [];

  const list = [
    ...playerJournal.value.timetables,
    ...playerJournal.value.duties,
    ...playerJournal.value.issuedTimetables
  ]
    .reduce<JournalEntry[]>((acc, v) => {
      // Timetable or dispatcher type
      if ('trainNo' in v) {
        const isIssued = v.authorName == props.playerName;

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

async function fetchPlayerJournal() {
  const queryPlayerId = Number(route.query.playerId) || -1;

  if (!apiStore.client || !queryPlayerId) return;

  if (queryPlayerId != playerId.value) {
    journalDataStatus.value = Status.Data.Loading;
  }

  playerId.value = queryPlayerId;

  try {
    const response = await apiStore.client.get<API.PlayerJournal.Data>('api/getPlayerJournal', {
      params: {
        playerId: queryPlayerId,
        dateScope: '30d'
      }
    });

    playerJournal.value = response.data;
    journalDataStatus.value = Status.Data.Loaded;
  } catch (error) {
    console.error(error);
    journalDataStatus.value = Status.Data.Error;
  }

  return null;
}
</script>

<style lang="scss" scoped>
@use '../../styles/responsive';

.profile-history-list {
  overflow-y: scroll;
  height: 100%;
}

.list-header {
  position: sticky;
  top: 0;
  z-index: 100;

  & > h3 {
    padding: 0.5em;
    margin-bottom: 0.5em;
  }
}

.history-menu {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1em;
  background-color: var(--clr-tile);
  padding: 0.5em;
}

.menu-btn {
  padding: 0.5em;
  font-weight: bold;
  color: #aaa;

  &[data-active='true'] {
    color: var(--clr-success);
  }
}

.history-list-box {
  padding: 0 0.5em;
  position: relative;
}

.history-list-box > a {
  display: flex;
  flex-direction: column;
  gap: 0.25em;

  background-color: var(--clr-bg-light);
  padding: 0.5em;

  margin-bottom: 0.5em;
  text-align: initial;

  &:hover {
    background-color: #333;
  }
}

.no-recent-history {
  padding: 1em;
  font-size: 1.25em;
  font-weight: bold;
  color: #aaa;
}

.entry-top-date {
  display: flex;
  align-items: center;
  gap: 0.25em;
}

.timestamp-indicator {
  color: #ccc;

  &[data-online='true'] {
    color: var(--clr-success);
  }
}

@include responsive.midScreen {
  .profile-history-list {
    height: 100vh;
  }
}
</style>
