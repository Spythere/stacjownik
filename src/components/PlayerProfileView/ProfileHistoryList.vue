<template>
  <div class="list-header">
    <div class="history-menu">
      <button
        v-for="filter in filterTypes"
        class="menu-btn btn--option"
        :data-active="filter == activeFilterType"
        @click="toggleFilter(filter)"
      >
        <img v-if="filter == 'Dispatcher'" src="/images/icon-user.svg" width="25" alt="user icon" />

        <img
          v-else-if="filter == 'Timetable'"
          src="/images/icon-train.svg"
          width="25"
          alt="train icon"
        />

        <img
          v-else-if="filter == 'IssuedTimetable'"
          src="/images/icon-timetable.svg"
          width="25"
          alt="timetable icon"
        />

        <span>
          {{ t(`profile.filters.${filter}`) }} &bull;

          <span v-if="filter == 'Timetable'">
            {{ props.playerJournal?.timetables.length || 0 }}
          </span>

          <span v-else-if="filter == 'IssuedTimetable'">
            {{ props.playerJournal?.issuedTimetables.length || 0 }}
          </span>

          <span v-else-if="filter == 'Dispatcher'">
            {{ props.playerJournal?.duties.length || 0 }}
          </span>

          <span v-else>
            {{
              (props.playerJournal?.timetables.length || 0) +
              (props.playerJournal?.duties.length || 0) +
              (props.playerJournal?.issuedTimetables.length || 0)
            }}
          </span>
        </span>
      </button>
    </div>
  </div>

  <section class="profile-history-list" ref="historyListEl">
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
          {{ dateToLocaleString(journalObj.dateKey, { dateStyle: 'full' }) }}
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
          <div v-if="'trainNo' in entry.value" class="entry-info">
            <b class="text--primary">{{ entry.value.trainCategoryCode }}</b>
            <b>{{ entry.value.trainNo }}</b>
            <span>{{ entry.value.route.replace('|', ' - ') }}</span>
            <span>
              (<span class="text--primary">{{ entry.value.currentDistance }} km</span> /
              {{ entry.value.routeDistance }} km)
            </span>
            <b v-if="entry.type == 'IssuedTimetable'">
              {{ t('profile.list.for') }}: {{ entry.value.driverName }}
            </b>
          </div>

          <!-- Dispatchers -->
          <div v-else class="entry-info">
            <b class="timestamp-indicator" :data-online="entry.value.isOnline">
              ({{
                humanizeDuration(
                  (entry.value.timestampTo || Date.now()) - entry.value.timestampFrom
                )
              }})
            </b>
            <b class="text--primary">{{ entry.value.stationName }}</b>
          </div>
        </router-link>
      </div>
    </div>
  </section>
</template>

<script lang="ts" setup>
import { computed, PropType, ref, useTemplateRef, watch } from 'vue';
import {
  dateToLocaleString,
  humanizeDuration,
  timestampToTimeString
} from '../../composables/time';
import { API } from '../../typings/api';
import { useI18n } from 'vue-i18n';
import { PlayerHistoryEntryType, Status } from '../../typings/common';
import Loading from '../Global/Loading.vue';

interface PlayerHistoryDate {
  dateKey: Date;
  entries: PlayerHistoryEntry[];
}

interface PlayerHistoryEntry {
  type: PlayerHistoryEntryType;
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

  activeFilterType: {
    type: String as PropType<PlayerHistoryEntryType>,
    required: true
  },

  chosenDayKey: {
    type: String,
    required: true
  }
});

const emits = defineEmits(['toggleFilter']);
const { t } = useI18n();

const filterTypes: PlayerHistoryEntryType[] = ['All', 'Timetable', 'Dispatcher', 'IssuedTimetable'];
const journalElements = useTemplateRef('journalElements');
const historyListEl = useTemplateRef('historyListEl');

watch(
  computed(() => props.chosenDayKey),
  () => {
    const elementToScroll = journalElements.value?.find(
      (el) => el.dataset['key'] == props.chosenDayKey
    );

    if (elementToScroll) {
      elementToScroll.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
);

const combinedJournal = computed<PlayerHistoryDate[]>(() => {
  if (!props.playerJournal || !props.playerName) return [];

  const list = [
    ...props.playerJournal.timetables,
    ...props.playerJournal.duties,
    ...props.playerJournal.issuedTimetables
  ]
    .reduce<PlayerHistoryDate[]>((acc, v) => {
      let date = new Date();
      let type: PlayerHistoryEntryType = 'All';
      let value: API.TimetableHistory.DataShort | API.DispatcherHistory.Data | null = null;

      // Timetable or dispatcher type
      if ('trainNo' in v) {
        const isIssued = v.authorName == props.playerName;

        if (!isIssued && props.activeFilterType != 'Timetable' && props.activeFilterType != 'All')
          return acc;
        if (
          isIssued &&
          props.activeFilterType != 'IssuedTimetable' &&
          props.activeFilterType != 'All'
        )
          return acc;

        date = new Date(v.createdAt);
        type = isIssued ? 'IssuedTimetable' : 'Timetable';
        value = v;
      } else {
        if (props.activeFilterType != 'Dispatcher' && props.activeFilterType != 'All') return acc;

        date = new Date(v.timestampFrom);
        type = 'Dispatcher';
        value = v;
      }

      const journalObj = acc.find(
        (k) => k.dateKey.toLocaleDateString('pl-PL') == date.toLocaleDateString('pl-PL')
      );

      const entry: PlayerHistoryEntry = {
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

function toggleFilter(filterType: PlayerHistoryEntryType) {
  emits('toggleFilter', filterType);

  if (historyListEl.value) {
    historyListEl.value.scrollTo(0, 0);
  }
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
  grid-template-columns: repeat(auto-fit, minmax(9em, 1fr));
  gap: 1em;
  background-color: var(--clr-tile);
  padding: 0.5em;
}

.menu-btn {
  padding: 0.25em;
  font-weight: bold;
  color: #ccc;

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

.entry-top-date {
  display: flex;
  align-items: center;
  gap: 0.25em;
}

.entry-info {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.25em;
}

.date-box {
  padding: 0.5em;
  margin: 0.5em 0;
  font-weight: bold;
  text-align: left;

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

  .date-box {
    text-align: center;
  }
}

@media only screen and (max-width: 1800px) {
  .history-menu {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
