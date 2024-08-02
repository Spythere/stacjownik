<template>
  <transition name="status-anim" mode="out-in">
    <div :key="dataStatus">
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

      <div v-else class="history-list">
        <div v-for="historyItem in dispatcherHistory" :key="historyItem.id" class="history-item">
          <div class="item-top">
            <span>
              <span>
                <router-link :to="`/journal/dispatchers?search-station=${historyItem.stationName}`">
                  <b>{{ historyItem.stationName }}</b>
                </router-link>

                <b class="text--grayed"> #{{ historyItem.stationHash }}</b>
              </span>
              &bull;
              <b
                v-if="historyItem.dispatcherLevel !== null"
                class="level-badge dispatcher"
                :style="
                  calculateExpStyle(historyItem.dispatcherLevel, historyItem.dispatcherIsSupporter)
                "
              >
                {{ historyItem.dispatcherLevel >= 2 ? historyItem.dispatcherLevel : 'L' }}
              </b>
              <b style="margin-left: 5px">
                <span
                  v-if="apiStore.donatorsData.includes(historyItem.dispatcherName)"
                  data-tooltip-type="DonatorTooltip"
                  :data-tooltip-content="$t('donations.dispatcher-message')"
                >
                  <router-link
                    class="text--donator"
                    :to="`/journal/dispatchers?search-dispatcher=${historyItem.dispatcherName}`"
                  >
                    {{ historyItem.dispatcherName }}
                  </router-link>
                </span>

                <router-link
                  v-else
                  :to="`/journal/dispatchers?search-dispatcher=${historyItem.dispatcherName}`"
                >
                  {{ historyItem.dispatcherName }}
                </router-link>
              </b>

              <div>
                <span v-if="historyItem.timestampTo">
                  <b>{{ $d(historyItem.timestampFrom) }}</b>
                  {{ timestampToString(historyItem.timestampFrom) }}
                  -
                  <b
                    v-if="
                      new Date(historyItem.timestampFrom).getDate() !=
                      new Date(historyItem.timestampTo).getDate()
                    "
                  >
                    {{ $d(historyItem.timestampTo) }}
                  </b>
                  {{ timestampToString(historyItem.timestampTo) }} ({{
                    calculateDuration(historyItem.currentDuration)
                  }})
                </span>

                <router-link
                  :to="`/scenery?station=${historyItem.stationName}`"
                  class="dispatcher-online"
                  v-else
                >
                  {{ $t('journal.online-since') }}
                  <b>
                    {{
                      new Date().getDate() != new Date(historyItem.timestampFrom).getDate()
                        ? $d(historyItem.timestampFrom)
                        : ''
                    }}
                    {{ timestampToString(historyItem.timestampFrom) }}
                  </b>
                  ({{ calculateDuration(historyItem.currentDuration) }})
                </router-link>
              </div>
            </span>

            <span class="item-top-right">
              <div>
                <span>
                  {{ $t('scenery.dispatcher-rate') }}
                  <b class="text--primary"> {{ historyItem.dispatcherRate }}</b>
                </span>
                <button class="btn btn--option" @click="toggleExtraInfo(historyItem.id)">
                  {{ $t('scenery.dispatcher-status-changes') }}
                  <b class="text--primary">{{ historyItem.statusHistory.length }}</b>
                </button>
              </div>

              <b class="region-badge" :aria-describedby="historyItem.region">
                REGION: {{ regions.find((r) => r.id == historyItem.region)?.name }}
              </b>
            </span>
          </div>

          <div class="item-bottom" v-if="openItemIndexes.includes(historyItem.id)">
            <div class="history-statuses">
              <div v-for="statusItem in historyItem.statusHistory">
                <b style="margin-right: 0.5em">{{
                  timestampToString(parseInt(statusItem.split('@')[0]))
                }}</b>
                <StationStatusBadge
                  :dispatcher-status="Number(statusItem.split('@')[1])"
                  :is-online="true"
                />
              </div>
            </div>
          </div>
        </div>

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
  </transition>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { regions } from '../../../data/options.json';
import { useMainStore } from '../../../store/mainStore';
import { API } from '../../../typings/api';
import { Status } from '../../../typings/common';
import Loading from '../../Global/Loading.vue';
import AddDataButton from '../../Global/AddDataButton.vue';
import StationStatusBadge from '../../Global/StationStatusBadge.vue';
import dateMixin from '../../../mixins/dateMixin';
import styleMixin from '../../../mixins/styleMixin';
import { useApiStore } from '../../../store/apiStore';

export default defineComponent({
  components: { Loading, AddDataButton, StationStatusBadge },

  mixins: [dateMixin, styleMixin],

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
      apiStore: useApiStore(),
      regions,

      openItemIndexes: [] as number[]
    };
  },

  methods: {
    toggleExtraInfo(id: number) {
      const existingId = this.openItemIndexes.indexOf(id);

      if (existingId != -1) this.openItemIndexes.splice(existingId, 1);
      else this.openItemIndexes.push(id);
    }
  }
});
</script>

<style lang="scss" scoped>
@import '../../../styles/animations.scss';
@import '../../../styles/responsive.scss';
@import '../../../styles/badge.scss';
@import '../../../styles/variables.scss';
@import '../../../styles/JournalSection.scss';

.history-list {
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  text-align: left;
}

.region-badge {
  padding: 0 0.25em;
}

.level-badge {
  text-align: center;
  display: inline-block;
  line-height: 1.6em;
}

.dispatcher-online {
  color: springgreen;
}

.history-item {
  background-color: #1a1a1a;
  padding: 1em;
}

.item-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  line-height: 1.75em;
  gap: 0.5em;
}

.item-top-right {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  text-align: center;
  gap: 1em;
}

.item-bottom {
  margin-top: 1em;
}

.history-statuses {
  display: flex;
  overflow: auto;
  gap: 0.5em;
}

.history-statuses > div {
  background-color: #313131;
  padding: 0.2rem 0 0.2rem 0.5em;
  margin: 0.5em 0;
  border-radius: 1em;
}

@include smallScreen {
  .item-top {
    flex-direction: column;
    justify-content: center;
    text-align: center;
  }
}
</style>
