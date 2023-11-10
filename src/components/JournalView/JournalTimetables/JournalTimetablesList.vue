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

        <div v-else>
          <TimetableHistoryList :timetableHistory="timetableHistory" />

          <AddDataButton
            :list="timetableHistory"
            :scrollDataLoaded="scrollDataLoaded"
            :scrollNoMoreData="scrollNoMoreData"
            @addHistoryData="addHistoryData"
          />
        </div>
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
import TimetableHistoryList from './TimetableHistoryList.vue';
import { useStore } from '../../../store/mainStore';
import { Status } from '../../../typings/common';
import { API } from '../../../typings/api';

export default defineComponent({
  components: { Loading, AddDataButton, TimetableHistoryList },

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
      store: useStore()
    };
  }
});
</script>

<style lang="scss" scoped>
@import '../../../styles/JournalSection.scss';
@import '../../../styles/animations.scss';
</style>
