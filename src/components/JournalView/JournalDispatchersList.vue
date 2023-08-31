<template>
  <div>
    <transition name="status-anim" mode="out-in">
      <div :key="dataStatus">
        <div class="journal_warning" v-if="store.isOffline">
          {{ $t('app.offline') }}
        </div>

        <Loading v-else-if="dataStatus == DataStatus.Loading" />

        <div v-else-if="dataStatus == DataStatus.Error" class="journal_warning error">
          {{ $t('app.error') }}
        </div>

        <div class="journal_warning" v-else-if="dispatcherHistory.length == 0">
          {{ $t('app.no-result') }}
        </div>

        <div v-else>
          <table class="scenery-history-table">
            <thead>
              <th>Sceneria</th>
              <th>{{ $t('scenery.dispatchers-history-hash') }}</th>
              <th>{{ $t('scenery.dispatchers-history-dispatcher') }}</th>
              <th>{{ $t('scenery.dispatchers-history-level') }}</th>
              <th>{{ $t('scenery.dispatchers-history-rate') }}</th>
              <th>{{ $t('scenery.dispatchers-history-date') }}</th>
            </thead>

            <tbody>
              <tr v-for="historyItem in dispatcherHistory">
                <td>
                  <router-link :to="`/journal/dispatchers?sceneryName=${historyItem.stationName}`">
                    <b>{{ historyItem.stationName }}</b>
                  </router-link>
                </td>
                <td>#{{ historyItem.stationHash }}</td>
                <td>
                  <router-link :to="`/journal/dispatchers?dispatcherName=${historyItem.dispatcherName}`">
                    <b>{{ historyItem.dispatcherName }}</b>
                  </router-link>
                </td>
                <td>
                  <b
                    v-if="historyItem.dispatcherLevel !== null"
                    class="level-badge dispatcher"
                    :style="calculateExpStyle(historyItem.dispatcherLevel, historyItem.dispatcherIsSupporter)"
                  >
                    {{ historyItem.dispatcherLevel >= 2 ? historyItem.dispatcherLevel : 'L' }}
                  </b>
                </td>

                <td class="text--primary">
                  <b>{{ historyItem.dispatcherRate }}</b>
                </td>

                <td style="min-width: 250px" class="time">
                  <span v-if="historyItem.timestampTo">
                    <b>{{ $d(historyItem.timestampFrom) }}</b>

                    {{ timestampToString(historyItem.timestampFrom) }}
                    - {{ timestampToString(historyItem.timestampTo) }} ({{
                      calculateDuration(historyItem.currentDuration)
                    }})
                  </span>

                  <span class="dispatcher-online" v-else>
                    <b class="text--online">
                      {{ $t('journal.online-since') }} {{ timestampToString(historyItem.timestampFrom) }}
                    </b>
                    ({{ calculateDuration(historyItem.currentDuration) }})
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
          <!-- <transition-group class="journal-list" tag="ul" name="list-anim">
            <li
              v-for="item in computedDispatcherHistory"
              :key="typeof item === 'string' ? item : item.timestampFrom + item.dispatcherId"
              :class="{ sticky: typeof item == 'string' }"
            >
              <div v-if="typeof item == 'string'" class="journal_day">
                {{ item }}
              </div>

              <div
                v-else
                class="journal_item"
                :class="{ online: item.isOnline }"
                @click="navigateToScenery(item.stationName, item.isOnline)"
                @keydown.enter="navigateToScenery(item.stationName, item.isOnline)"
                tabindex="0"
              >
                <span class="item-general">
                  <b
                    v-if="item.dispatcherLevel !== null"
                    class="level-badge dispatcher"
                    :style="calculateExpStyle(item.dispatcherLevel, item.dispatcherIsSupporter)"
                  >
                    {{ item.dispatcherLevel >= 2 ? item.dispatcherLevel : 'L' }}
                  </b>

                  <b class="text--primary">{{ item.dispatcherName }}</b> &bull; <b>{{ item.stationName }}</b>
                  <span class="text--grayed">&nbsp;#{{ item.stationHash }}&nbsp;</span>
                  <span class="region-badge" :class="item.region">PL1</span>
                  <span class="like-count" v-if="item.dispatcherRate">
                    <img :src="getIcon('like')" alt="like icon" />
                    {{ item.dispatcherRate }}
                  </span>
                </span>

                <span class="item-time">
                  <span :data-status="item.isOnline">
                    {{ item.isOnline ? $t('journal.online-since') : 'OFFLINE' }}&nbsp;
                  </span>
                  <span>
                    {{ new Date(item.timestampFrom).toLocaleTimeString('pl-PL', { timeStyle: 'short' }) }}
                  </span>

                  <span v-if="item.currentDuration && item.isOnline">
                    ({{ calculateDuration(item.currentDuration) }})
                  </span>

                  <span v-if="item.timestampTo">
                    &gt;
                    {{ new Date(item.timestampTo).toLocaleTimeString('pl-PL', { timeStyle: 'short' }) }}
                    ({{ $t('journal.duty-lasted') }} {{ calculateDuration(item.currentDuration!) }})
                  </span>
                </span>
              </div>
            </li>
          </transition-group> -->

          <button
            class="btn btn--option btn--load-data"
            v-if="!scrollNoMoreData && scrollDataLoaded && dispatcherHistory.length > 15"
            @click="addHistoryData"
          >
            {{ $t('journal.load-data') }}
          </button>
        </div>
      </div>
    </transition>

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
import dateMixin from '../../mixins/dateMixin';
import { DispatcherHistory } from '../../scripts/interfaces/api/DispatchersAPIData';
import styleMixin from '../../mixins/styleMixin';
import imageMixin from '../../mixins/imageMixin';
import { DataStatus } from '../../scripts/enums/DataStatus';
import { useStore } from '../../store/store';

export default defineComponent({
  mixins: [dateMixin, styleMixin, imageMixin],

  props: {
    dispatcherHistory: {
      type: Array as PropType<DispatcherHistory[]>,
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
      type: Object as PropType<DataStatus>,
    },
  },

  data() {
    return {
      DataStatus,
      store: useStore(),
    };
  },

  computed: {
    computedDispatcherHistory() {
      return this.dispatcherHistory.reduce((acc, historyItem, i) => {
        if (this.isAnotherDay(i - 1, i)) acc.push(new Date(historyItem.timestampFrom).toLocaleDateString('pl-PL'));
        acc.push(historyItem);

        return acc;
      }, [] as (DispatcherHistory | string)[]);
    },
  },

  methods: {
    navigateToScenery(name: string, isOnline: boolean) {
      if (!isOnline) return;

      this.$router.push(`/scenery?station=${name.trim().replace(/ /g, '_')}`);
    },

    isAnotherDay(prevIndex: number, currIndex: number) {
      if (currIndex == 0) return true;

      return (
        new Date(this.dispatcherHistory[prevIndex].timestampFrom).getDate() !=
        new Date(this.dispatcherHistory[currIndex].timestampFrom).getDate()
      );
    },
  },
});
</script>

<style lang="scss" scoped>
@import '../../styles/animations.scss';
@import '../../styles/responsive.scss';
@import '../../styles/badge.scss';
@import '../../styles/variables.scss';
@import '../../styles/JournalSection.scss';

table.scenery-history-table {
  width: 100%;
  background-color: #111;
  border-collapse: collapse;
  /* border-spacing: 0 0.5em; */
  text-align: center;

  thead {
    position: sticky;
    top: 0;
    background-color: #222222;
  }

  th {
    padding: 0.5em;
  }

  tr {
    background-color: #353535;
    border: none;
  }

  td {
    padding: 0.75em;
    border-bottom: solid 5px #1a1a1a;

    .level-badge {
      margin: 0 auto;
    }
  }
}

.text {
  &--online {
    color: springgreen;
  }

  &--offline {
    color: salmon;
  }
}
</style>
