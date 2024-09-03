<template>
  <div>
    <transition name="status-anim" mode="out-in">
      <div :key="dataStatus">
        <div class="journal_warning" v-if="store.isOffline">
          {{ $t('app.offline') }}
        </div>

        <Loading v-else-if="dataStatus == Status.Data.Loading" />

        <div v-else-if="dataStatus == Status.Data.Error" class="journal_warning error">
          {{ $t('app.error') }}
        </div>

        <div v-else-if="timetableHistory.length == 0" class="journal_warning">
          {{ $t('app.no-result') }}
        </div>

        <ul v-else class="journal-list">
          <transition-group name="list-anim">
            <JournalTimetableEntry
              v-for="timetableEntry in timetableHistory"
              :key="timetableEntry.id"
              :timetableEntry="timetableEntry"
              :onToggleShowExtraInfo="toggleExtraInfo"
              :showExtraInfo="extraInfoIndexes.includes(timetableEntry.id)"
            />
          </transition-group>

          <AddDataButton
            :list="timetableHistory"
            :scrollDataLoaded="scrollDataLoaded"
            :scrollNoMoreData="scrollNoMoreData"
            @addHistoryData="addHistoryData"
          />
        </ul>
      </div>
    </transition>

    <div class="journal_warning" v-if="scrollNoMoreData">{{ $t('journal.no-further-data') }}</div>

    <div class="journal_warning" v-else-if="!scrollDataLoaded">
      {{ $t('journal.loading-further-data') }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';

import Loading from '../../Global/Loading.vue';
import AddDataButton from '../../Global/AddDataButton.vue';
import JournalTimetableEntry from './JournalTimetableEntry.vue';

import { useMainStore } from '../../../store/mainStore';
import { Status } from '../../../typings/common';
import { API } from '../../../typings/api';

export default defineComponent({
  components: {
    Loading,
    AddDataButton,
    JournalTimetableEntry
  },

  props: {
    timetableHistory: {
      type: Array as PropType<API.TimetableHistory.Response>,
      required: true
    },
    scrollNoMoreData: {
      type: Boolean
    },
    scrollDataLoaded: {
      type: Boolean
    },
    addHistoryData: {
      type: Function as PropType<() => void>
    },
    dataStatus: {
      type: Number as PropType<Status.Data>
    }
  },

  data() {
    return {
      Status,
      store: useMainStore(),
      extraInfoIndexes: [] as number[]
    };
  },

  methods: {
    toggleExtraInfo(id: number) {
      const existingIdx = this.extraInfoIndexes.indexOf(id);

      if (existingIdx != -1) this.extraInfoIndexes.splice(existingIdx, 1);
      else this.extraInfoIndexes.push(id);
    }
  }
});
</script>

<style lang="scss" scoped>
@import '../../../styles/JournalSection.scss';
@import '../../../styles/animations.scss';

@include smallScreen {
  .journal_item-info {
    text-align: center;
  }

  .item-route {
    display: flex;
    justify-content: center;
  }
}
</style>
