<template>
  <section class="profile-history-list">
    <div class="list-header">
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
    </div>

    <div class="history-list-box">
      <router-link
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
            {{ entry.date.toLocaleString('pl-PL', { dateStyle: 'long', timeStyle: 'short' }) }}
            <span v-if="'timestampTo' in entry.value && entry.value.timestampTo" u>
              -
              {{
                new Date(entry.value.timestampTo).toLocaleString('pl-PL', {
                  dateStyle:
                    new Date(entry.value.timestampTo).getDay() == entry.date.getDay()
                      ? undefined
                      : 'long',
                  timeStyle: 'short'
                })
              }}
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
          <b>({{ entry.value.currentDistance }} km / {{ entry.value.routeDistance }} km) </b>
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
import { computed, onMounted, PropType, reactive, ref } from 'vue';
import { humanizeDuration } from '../../composables/time';
import { API } from '../../typings/api';
import { useI18n } from 'vue-i18n';
import { useApiStore } from '../../store/apiStore';
import { useRoute } from 'vue-router';

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

const playerJournal = ref<API.PlayerJournal.Data | null>(null);

const activeFilterTypes = reactive<Record<JournalEntryType, boolean>>({
  Timetable: true,
  Dispatcher: true,
  IssuedTimetable: true
});

onMounted(() => {
  fetchPlayerJournal();
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
  const playerId = route.query.playerId?.toString();

  if (!apiStore.client || !playerId) return null;

  try {
    const response = await apiStore.client.get<API.PlayerJournal.Data>('api/getPlayerJournal', {
      params: {
        playerId: playerId,
        dateScope: '30d'
      }
    });

    playerJournal.value = response.data;
  } catch (error) {
    console.error(error);
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
  background-color: var(--clr-bg);
  padding-bottom: 0.5em;

  & > h3 {
    padding: 0.5em;
    background-color: var(--clr-tile);
    margin-bottom: 0.5em;
  }
}

.history-menu {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1em;
  padding: 1px;
}

.menu-btn {
  background-color: var(--clr-tile);
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
  padding: 0.25em;
}

.history-list-box > a {
  display: flex;
  flex-direction: column;
  gap: 0.25em;

  background-color: var(--clr-tile);
  padding: 0.5em;

  margin-bottom: 0.5em;
  text-align: initial;
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
