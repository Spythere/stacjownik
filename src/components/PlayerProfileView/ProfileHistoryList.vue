<template>
  <div class="list-header">
    <div class="history-menu">
      <button
        v-for="filter in filterTypes"
        class="menu-btn btn--option"
        :data-active="filter == activeFilterType"
        @click="toggleFilter(filter)"
      >
        {{ t(`profile.filters.${filter}`) }}
      </button>
    </div>
  </div>

  <section class="profile-history-list">
    <div class="history-list-box">
      <Loading v-if="journalStatus == Status.Data.Loading" />

      <div v-else-if="combinedJournal.length == 0" class="no-recent-history">
        {{
          t(
            activeFilterType == 'All'
              ? 'profile.list.no-recent-history'
              : 'profile.list.no-filtered-history'
          )
        }}
      </div>

      <div
        v-else
        v-for="journalObj in combinedJournal"
        :key="journalObj.dateKey.getTime()"
        :data-key="
          journalObj.dateKey.toLocaleDateString('pl-PL', { month: '2-digit', day: '2-digit' })
        "
        ref="journalElements"
      >
        <div class="date-box">
          {{ journalObj.dateKey.toLocaleDateString('pl-PL') }}
        </div>

        <router-link
          v-for="entry in journalObj.entries"
          class="list-entry"
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
              {{ timestampToTimeString(entry.date.getTime()) }}

              <span v-if="'timestampTo' in entry.value && entry.value.timestampTo">
                -
                <span v-if="new Date(entry.value.timestampTo).getDay() == entry.date.getDay()">{{
                  timestampToTimeString(entry.value.timestampTo)
                }}</span>
                <span v-else>{{ timestampToTimeString(entry.value.timestampTo) }}</span>
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
                humanizeDuration(
                  (entry.value.timestampTo || Date.now()) - entry.value.timestampFrom
                )
              }}</span>
            </b>
          </div></router-link
        >
      </div>
    </div>
  </section>
</template>

<script lang="ts" setup>
import { computed, onMounted, PropType, ref, useTemplateRef, watch } from 'vue';
import { humanizeDuration, timestampToTimeString } from '../../composables/time';
import { API } from '../../typings/api';
import { useI18n } from 'vue-i18n';
import { Status } from '../../typings/common';
import Loading from '../Global/Loading.vue';

type JournalEntryType = 'All' | 'Timetable' | 'Dispatcher' | 'IssuedTimetable';

interface JournalDateEntries {
  dateKey: Date;
  entries: JournalEntry[];
}

interface JournalEntry {
  type: JournalEntryType;
  date: Date;
  value: API.TimetableHistory.DataShort | API.DispatcherHistory.Data;
}

const props = defineProps({
  playerName: {
    type: String
  },

  playerJournal: {
    type: Object as PropType<API.PlayerJournal.Data>
  },

  journalStatus: {
    type: Number as PropType<Status.Data>,
    required: true
  },

  chosenDayKey: {
    type: String,
    required: true
  }
});

const { t } = useI18n();

const journalElements = useTemplateRef('journalElements');

onMounted(() => {});

const activeFilterType = ref<JournalEntryType>('All');
const filterTypes: JournalEntryType[] = ['All', 'Timetable', 'Dispatcher', 'IssuedTimetable'];

const combinedJournal = computed<JournalDateEntries[]>(() => {
  if (!props.playerJournal || !props.playerName) return [];

  const list = [
    ...props.playerJournal.timetables,
    ...props.playerJournal.duties,
    ...props.playerJournal.issuedTimetables
  ]
    .reduce<JournalDateEntries[]>((acc, v) => {
      let date = new Date();
      let type: JournalEntryType = 'All';
      let value: API.TimetableHistory.DataShort | API.DispatcherHistory.Data | null = null;

      // Timetable or dispatcher type
      if ('trainNo' in v) {
        const isIssued = v.authorName == props.playerName;

        if (!isIssued && activeFilterType.value != 'Timetable' && activeFilterType.value != 'All')
          return acc;
        if (
          isIssued &&
          activeFilterType.value != 'IssuedTimetable' &&
          activeFilterType.value != 'All'
        )
          return acc;

        date = new Date(v.createdAt);
        type = isIssued ? 'IssuedTimetable' : 'Timetable';
        value = v;
      } else {
        if (activeFilterType.value != 'Dispatcher' && activeFilterType.value != 'All') return acc;

        date = new Date(v.timestampFrom);
        type = 'Dispatcher';
        value = v;
      }

      const journalObj = acc.find(
        (k) => k.dateKey.toLocaleDateString('pl-PL') == date.toLocaleDateString('pl-PL')
      );

      const entry: JournalEntry = {
        date,
        type,
        value
      };

      if (!journalObj) {
        acc.push({
          dateKey: date,
          entries: [entry]
        });
      } else {
        journalObj.entries.push(entry);
      }

      return acc;
    }, [])
    .sort((a, b) => b.dateKey.getTime() - a.dateKey.getTime());

  list.forEach((v) => v.entries.sort((a, b) => b.date.getTime() - a.date.getTime()));

  return list;
});

watch(
  computed(() => props.chosenDayKey),
  (v) => {
    const elementToScroll = journalElements.value?.find(
      (el) => el.dataset['key'] == props.chosenDayKey
    );

    if (elementToScroll) {
      elementToScroll.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
);

function toggleFilter(filterType: JournalEntryType) {
  activeFilterType.value = filterType;
}
</script>

<style lang="scss" scoped>
@use '../../styles/responsive';

.profile-history-list {
  height: 100%;
  overflow: auto;
}

.list-header {
  & > h3 {
    padding: 0.5em;
    margin-bottom: 0.5em;
  }
}

.history-menu {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(125px, 1fr));
  gap: 1em;
  background-color: var(--clr-tile);
  padding: 0.5em;
}

.menu-btn {
  padding: 0.5em;
  font-weight: bold;
  color: #aaa;

  &[data-active='true'] {
    color: var(--clr-primary);
  }
}

.history-list-box {
  padding: 0 0.5em;
  position: relative;
}

.list-entry {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.25em;

  background-color: var(--clr-bg-light);
  padding: 0.5em;

  margin-bottom: 0.5em;
  text-align: initial;

  &:hover {
    background-color: #333;
  }
}

.date-box {
  padding: 0.5em;
  margin: 0.5em 0;
  font-weight: bold;

  background-color: var(--clr-tile);

  position: sticky;
  top: 0;
}

.no-recent-history {
  padding: 1em;
  font-size: 1.25em;
  font-weight: bold;
  color: #aaa;
  height: 100%;
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
    height: calc(100vh - 10em);
    min-height: 300px;
  }
}
</style>
