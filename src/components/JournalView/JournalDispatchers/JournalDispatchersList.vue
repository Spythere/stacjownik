<template>
  <div>
    <div class="journal_warning" v-if="store.isOffline">
      {{ $t('app.offline') }}
    </div>

    <Loading v-else-if="dataStatus == Status.Data.Loading" />

    <div v-else-if="dataStatus == Status.Data.Error" class="journal_warning error">
      {{ $t('app.error') }}
    </div>

    <div class="journal_warning" v-else-if="dispatcherHistory.length == 0">
      {{ $t('app.no-result') }}
    </div>

    <div v-else>
      <transition-group name="list-anim" class="journal-list" tag="ul">
        <JournalDispatcherEntry
          v-for="entry in dispatcherHistory"
          :key="entry.id"
          :entry="entry"
          :onToggleShowExtraInfo="toggleExtraInfo"
          :showExtraInfo="extraInfoIndexes.includes(entry.id)"
        />
      </transition-group>

      <AddDataButton
        :list="dispatcherHistory"
        :scrollDataLoaded="scrollDataLoaded"
        :scrollNoMoreData="scrollNoMoreData"
        @addHistoryData="addHistoryData"
      />
    </div>

    <div class="journal_warning" v-if="scrollNoMoreData">
      {{ $t('journal.no-further-data') }}
    </div>

    <div class="journal_warning" v-else-if="!scrollDataLoaded">
      {{ $t('journal.loading-further-data') }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { useMainStore } from '../../../store/mainStore';
import { API } from '../../../typings/api';
import { Status } from '../../../typings/common';
import Loading from '../../Global/Loading.vue';
import AddDataButton from '../../Global/AddDataButton.vue';
import JournalDispatcherEntry from './JournalDispatcherEntry.vue';

export default defineComponent({
  components: { Loading, AddDataButton, JournalDispatcherEntry },

  props: {
    dispatcherHistory: {
      type: Array as PropType<API.DispatcherHistory.Response>,
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

  watch: {
    '$route.query': {
      deep: true,
      handler() {
        this.extraInfoIndexes.length = 0;
      }
    }
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
@use '../../../styles/journal-section';
</style>
