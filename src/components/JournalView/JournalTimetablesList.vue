<template>
  <div class="journal-list">
    <transition name="status-anim" mode="out-in">
      <div :key="dataStatus">
        <div class="journal_warning" v-if="store.isOffline">
          {{ $t('app.offline') }}
        </div>

        <Loading v-else-if="dataStatus == DataStatus.Loading" />

        <div v-else-if="dataStatus == DataStatus.Error" class="journal_warning error">
          {{ $t('app.error') }}
        </div>

        <div v-else-if="timetableHistory.length == 0" class="journal_warning">
          {{ $t('app.no-result') }}
        </div>

        <div v-else>
          <ul>
            <ListItem :timetableHistory="timetableHistory" />
          </ul>
          <!-- <transition-group tag="ul" name="list-anim"> -->
          <!-- </transition-group> -->

          <!-- AddDataButton -->
          <AddDataButton
            :list="timetableHistory"
            :scrollDataLoaded="scrollDataLoaded"
            :scrollNoMoreData="scrollNoMoreData"
          />
        </div>
      </div>
    </transition>

    <div class="journal_warning" v-if="scrollNoMoreData">{{ $t('journal.no-further-data') }}</div>
    <div class="journal_warning" v-else-if="!scrollDataLoaded">{{ $t('journal.loading-further-data') }}</div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { DataStatus } from '../../scripts/enums/DataStatus';
import { TimetableHistory } from '../../scripts/interfaces/api/TimetablesAPIData';
import { useStore } from '../../store/store';
import Loading from '../Global/Loading.vue';
import ProgressBar from '../Global/ProgressBar.vue';
import ListItem from './JournalTimetables/ListItem.vue';
import AddDataButton from '../Global/AddDataButton.vue';

export default defineComponent({
  components: { ProgressBar, Loading, ListItem, AddDataButton },

  props: {
    timetableHistory: {
      type: Array as PropType<TimetableHistory[]>,
      required: true,
    },
    scrollNoMoreData: {
      type: Boolean,
    },
    scrollDataLoaded: {
      type: Boolean,
    },
    addHistoryData: {
      type: Function as PropType<() => void>,
    },
    dataStatus: {
      type: Number as PropType<DataStatus>,
    },
  },

  data() {
    return {
      DataStatus,
      store: useStore(),
    };
  },
});
</script>

<style lang="scss" scoped>
@import '../../styles/animations.scss';
</style>
