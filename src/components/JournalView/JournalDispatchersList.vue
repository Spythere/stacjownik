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

        <div class="journal_warning" v-else-if="dispatcherHistory.length == 0">
          {{ $t('app.no-result') }}
        </div>

        <div v-else>
          <table class="scenery-history-table">
            <thead>
              <th>{{ $t('journal.history-name') }}</th>
              <th>{{ $t('journal.history-hash') }}</th>
              <th>{{ $t('journal.history-dispatcher') }}</th>
              <th>{{ $t('journal.history-level') }}</th>
              <th>{{ $t('journal.history-rate') }}</th>
              <th>{{ $t('journal.history-region') }}</th>
              <th>{{ $t('journal.history-date') }}</th>
            </thead>

            <tbody>
              <transition-group name="list-anim">
                <tr v-for="historyItem in dispatcherHistory" :key="historyItem.id">
                  <td>
                    <router-link
                      :to="`/journal/dispatchers?sceneryName=${historyItem.stationName}`"
                    >
                      <b>{{ historyItem.stationName }}</b>
                    </router-link>
                  </td>
                  <td>#{{ historyItem.stationHash }}</td>
                  <td>
                    <router-link
                      :to="`/journal/dispatchers?dispatcherName=${historyItem.dispatcherName}`"
                    >
                      <b
                        v-if="isDonator(historyItem.dispatcherName)"
                        class="text--donator"
                        :title="$t('donations.dispatcher-message')"
                      >
                        {{ historyItem.dispatcherName }}
                      </b>

                      <b v-else>
                        {{ historyItem.dispatcherName }}
                      </b>
                    </router-link>
                  </td>
                  <td>
                    <b
                      v-if="historyItem.dispatcherLevel !== null"
                      class="level-badge dispatcher"
                      :style="
                        calculateExpStyle(
                          historyItem.dispatcherLevel,
                          historyItem.dispatcherIsSupporter
                        )
                      "
                    >
                      {{ historyItem.dispatcherLevel >= 2 ? historyItem.dispatcherLevel : 'L' }}
                    </b>
                  </td>
                  <td class="text--primary">
                    <b>{{ historyItem.dispatcherRate }}</b>
                  </td>
                  <td>
                    <b class="region-badge" :aria-describedby="historyItem.region">{{
                      regions.find((r) => r.id == historyItem.region)?.value || '???'
                    }}</b>
                  </td>
                  <td style="min-width: 200px" class="time">
                    <span v-if="historyItem.timestampTo" class="text--offline">
                      <b>{{ $d(historyItem.timestampFrom) }}</b>
                      {{ timestampToString(historyItem.timestampFrom) }}
                      - {{ timestampToString(historyItem.timestampTo) }} ({{
                        calculateDuration(historyItem.currentDuration)
                      }})
                    </span>
                    <span class="dispatcher-online" v-else>
                      <b class="text--online">
                        <router-link :to="`/scenery?station=${historyItem.stationName}`">{{
                          $t('journal.online-since')
                        }}</router-link>
                        {{ timestampToString(historyItem.timestampFrom) }}
                      </b>
                      ({{ calculateDuration(historyItem.currentDuration) }})
                    </span>
                  </td>
                </tr>
              </transition-group>
            </tbody>
          </table>

          <AddDataButton
            :list="dispatcherHistory"
            :scrollDataLoaded="scrollDataLoaded"
            :scrollNoMoreData="scrollNoMoreData"
            @addHistoryData="addHistoryData"
          />
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
import styleMixin from '../../mixins/styleMixin';
import { useStore } from '../../store/mainStore';
import Loading from '../Global/Loading.vue';
import { regions } from '../../data/options.json';
import AddDataButton from '../Global/AddDataButton.vue';
import { API } from '../../typings/api';
import { Status } from '../../typings/common';
import donatorMixin from '../../mixins/donatorMixin';

export default defineComponent({
  components: { Loading, AddDataButton },

  mixins: [dateMixin, styleMixin, donatorMixin],

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
      store: useStore(),
      regions
    };
  },

  computed: {
    computedDispatcherHistory() {
      console.log(this.dispatcherHistory.length);

      return this.dispatcherHistory.reduce(
        (acc, historyItem, i) => {
          if (this.isAnotherDay(i - 1, i))
            acc.push(new Date(historyItem.timestampFrom).toLocaleDateString('pl-PL'));
          acc.push(historyItem);

          return acc;
        },
        [] as (API.DispatcherHistory.Data | string)[]
      );
    }
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
    }
  }
});
</script>

<style lang="scss" scoped>
@import '../../styles/animations.scss';
@import '../../styles/responsive.scss';
@import '../../styles/badge.scss';
@import '../../styles/variables.scss';
@import '../../styles/JournalSection.scss';

table.scenery-history-table {
  --_bg-table: #111;
  --_bg-head: #101010;
  --_bg-row: #2f2f2f;

  width: 100%;
  border-collapse: collapse;
  position: relative;
  text-align: center;

  margin-bottom: 1em;

  thead {
    position: sticky;
    top: 0;
    background-color: var(--_bg-head);
  }

  th {
    padding: 0.5em;
  }

  tr {
    background-color: var(--_bg-row);
    border-bottom: 2px solid black;

    &:last-child {
      border: none;
    }
  }

  td {
    padding: 0.75em;

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
    color: #ddd;
  }
}
</style>
