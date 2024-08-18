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
          <transition-group name="list-anim" tag="ul" class="journal-list">
            <li v-for="timetable in timetableHistory" class="journal_item" :key="timetable.id">
              <div class="journal_item-info">
                <!-- General -->
                <TimetableGeneral :timetable="timetable" />

                <div @click="toggleExtraInfo(timetable.id)" style="cursor: pointer">
                  <!-- Route -->
                  <span class="item-route">
                    <b>{{ timetable.route.replace('|', ' - ') }}</b>
                  </span>

                  <hr />
                  <!-- Stops -->
                  <TimetableStops
                    :timetable="timetable"
                    :showExtraInfo="extraInfoIndexes.includes(timetable.id)"
                  />
                  <!-- Status -->
                  <TimetableStatus :timetable="timetable" />
                </div>

                <!-- Extra -->
                <TimetableDetails
                  :timetable="timetable"
                  :showExtraInfo="extraInfoIndexes.includes(timetable.id)"
                  @toggle-extra-info="toggleExtraInfo"
                />
              </div>
            </li>
          </transition-group>

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
import { defineComponent, Prop, PropType, ref } from 'vue';

import Loading from '../../Global/Loading.vue';
import AddDataButton from '../../Global/AddDataButton.vue';

import { useMainStore } from '../../../store/mainStore';
import { Status } from '../../../typings/common';
import { API } from '../../../typings/api';

import TimetableGeneral from './TimetableGeneral.vue';
import TimetableStops from './TimetableStops.vue';
import TimetableStatus from './TimetableStatus.vue';
import TimetableDetails from './TimetableDetails.vue';

export default defineComponent({
  components: {
    Loading,
    AddDataButton,
    TimetableDetails,
    TimetableGeneral,
    TimetableStatus,
    TimetableStops
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

  watch: {
    timetableHistory: {
      deep: true,
      handler() {
        console.log(this.$refs['list']);

        // ?.scrollTo({ behavior: 'smooth', top: 0 });

        // (this.$refs['list'] as HTMLUListElement).scrollTo({})
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
