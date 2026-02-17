<template>
  <div>
    <div class="details-actions">
      <button class="btn--action" @click="toggleExtraInfo">
        <b>{{ $t('journal.entry-details') }}</b>
        <img :src="`/images/icon-arrow-${showExtraInfo ? 'asc' : 'desc'}.svg`" alt="Arrow icon" />
      </button>

      <router-link
        v-if="driverRouteLocation !== null"
        class="a-button btn--action btn-timetable"
        :to="driverRouteLocation"
      >
        <img src="/images/icon-train.svg" alt="train icon" />
        <b>{{ $t('journal.timetable-online-button') }}</b>
      </router-link>
    </div>

    <div class="details-body" v-if="showExtraInfo">
      <div class="g-separator"></div>

      <div v-if="timetableDetails">
        <EntryStops :timetable="timetableDetails" />

        <div class="g-separator"></div>

        <div class="timetable-specs">
          <span class="badge specs-badge" v-if="timetableDetails.authorName">
            <span>{{ $t('journal.dispatcher-name') }}</span>
            <span>{{ timetableDetails.authorName }}</span>
          </span>

          <span class="badge specs-badge" v-if="timetableDetails.trainMaxSpeed">
            <span>{{ $t('journal.stock-timetable-speed') }}</span>
            <span> {{ timetableDetails.trainMaxSpeed }}km/h </span>
          </span>

          <span class="badge specs-badge" v-if="timetableDetails.maxSpeed">
            <span>{{ $t('journal.stock-max-speed') }}</span>
            <span>{{ timetableDetails.maxSpeed }}km/h</span>
          </span>
        </div>

        <div class="stock-dangers" v-if="timetableDetails.warningNotes">
          <div class="g-separator"></div>

          <b>{{ $t('journal.stock-dangers') }}:</b>

          <ul>
            <li v-if="timetableDetails.twr">
              <b class="text--primary">{{ $t('warnings.TWR') }} (TWR)</b>
            </li>

            <li v-if="timetableDetails.skr">
              <b class="text--primary">{{ $t('warnings.SKR') }}</b>
            </li>

            <li v-if="timetableDetails.hasDangerousCargo">
              <b class="text--primary">{{ $t('warnings.TN') }}</b>
            </li>

            <li v-if="timetableDetails.hasExtraDeliveries">
              <b class="text--primary">{{ $t('warnings.PN') }}</b>
            </li>
          </ul>

          <div class="dangers-notes" v-if="timetableDetails.warningNotes">
            <h4>{{ $t('warnings.header-title') }}</h4>
            <p>
              <i>{{ timetableDetails.warningNotes }}</i>
            </p>
          </div>
        </div>

        <!-- Historia zmian w składzie -->
        <div v-if="timetableDetails.stockString || stockHistory.length != 0">
          <div class="g-separator"></div>

          <b>{{ $t('journal.stock-preview') }}:</b>

          <div class="stock-specs" style="margin-top: 0.5em">
            <span class="badge specs-badge" v-if="timetableDetails.stockLength">
              <span>{{ $t('journal.stock-length') }}</span>
              <span>
                {{
                  currentHistoryIndex == 0
                    ? timetableDetails.stockLength
                    : stockHistory[currentHistoryIndex].stockLength || timetableDetails.stockLength
                }}m
              </span>
            </span>

            <span class="badge specs-badge" v-if="timetableDetails.stockMass">
              <span>{{ $t('journal.stock-mass') }}</span>
              <span>
                {{
                  Math.floor(
                    (currentHistoryIndex == 0
                      ? timetableDetails.stockMass
                      : stockHistory[currentHistoryIndex].stockMass || timetableDetails.stockMass) /
                      1000
                  )
                }}t
              </span>
            </span>
          </div>

          <div class="stock-history">
            <button class="btn btn--action" @click="copyStockToClipboard()">
              <i class="fa-regular fa-copy"></i> {{ $t('journal.stock-copy') }}
            </button>

            <button
              v-for="(sh, i) in stockHistory"
              :key="i"
              class="btn--action"
              :data-checked="i == currentHistoryIndex"
              @click.stop="currentHistoryIndex = i"
            >
              {{ sh.updatedAt }}
            </button>
          </div>

          <div v-if="timetableDetails.stockString" style="margin-top: 1em">
            <StockList
              :trainStockList="
                (currentHistoryIndex == 0
                  ? timetableDetails.stockString
                  : stockHistory[currentHistoryIndex].stockString
                ).split(';')
              "
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, PropType, ref } from 'vue';
import { RouteLocationRaw } from 'vue-router';
import { useI18n } from 'vue-i18n';

import StockList from '../../Global/StockList.vue';
import EntryStops from './EntryStops.vue';
import { API } from '../../../typings/api';
import { useApiStore } from '../../../store/apiStore';

const i18n = useI18n();
const apiStore = useApiStore();

const props = defineProps({
  showExtraInfo: {
    type: Boolean,
    required: true
  },

  timetableEntry: {
    type: Object as PropType<API.TimetableHistory.DataShort>,
    required: true
  }
});

const emits = defineEmits(['toggleExtraInfo']);
const currentHistoryIndex = ref(0);

const timetableDetails = ref<API.TimetableHistory.Data | null>(null);

const stockHistory = computed(() => {
  return (
    timetableDetails.value?.stockHistory
      .slice()
      .reverse()
      .map((h) => {
        const historyData = h.split('@');
        return {
          updatedAt: new Date(Number(historyData[0])).toLocaleTimeString(i18n.locale.value, {
            hour: '2-digit',
            minute: '2-digit'
          }),
          stockString: historyData[1],
          stockMass: Number(historyData[2]) || undefined,
          stockLength: Number(historyData[3]) || undefined
        };
      }) ?? []
  );
});

const driverRouteLocation = computed<RouteLocationRaw | null>(() => {
  if (props.timetableEntry.terminated) return null;

  return {
    name: 'DriverView',
    query: {
      trainId: `${props.timetableEntry.driverId}|${props.timetableEntry.trainNo}|eu`
    }
  };
});

async function fetchTimetableDetails() {
  try {
    const responseData = await apiStore.client!.get<API.TimetableHistory.Response>(
      'api/getTimetables',
      {
        params: {
          timetableId: props.timetableEntry.id,
          returnType: 'detailed'
        }
      }
    );

    if (!responseData || responseData.data.length != 1) {
      timetableDetails.value = null;
      return;
    }

    timetableDetails.value = responseData.data[0];
  } catch (error) {
    // this.dataStatus = Status.Data.Error;
    console.error(error);
  }
}

async function toggleExtraInfo() {
  if (props.showExtraInfo == false) {
    await fetchTimetableDetails();
  }

  emits('toggleExtraInfo', timetableDetails.value);
}

function copyStockToClipboard() {
  if (!timetableDetails.value) return;

  const currentStockString =
    stockHistory.value[currentHistoryIndex.value]?.stockString ??
    timetableDetails.value.stockString;

  if (!currentStockString) {
    alert(i18n.t('journal.stock-clipboard-failure'));
    return;
  }

  navigator.clipboard
    .writeText(currentStockString)
    .then(() => {
      prompt(i18n.t('journal.stock-clipboard-success'), currentStockString);
    })
    .catch(() => {
      alert(i18n.t('journal.stock-clipboard-failure'));
    });
}
</script>

<style lang="scss" scoped>
@use '../../../styles/responsive';
@use '../../../styles/badge';

.details-body {
  margin-top: 0.5em;
}

.details-actions {
  display: flex;
  gap: 0.5em;
  margin-top: 1em;

  button img {
    height: 1.25em;
  }
}

.stock-history {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5em;
  margin-top: 1em;

  button[data-checked='true'] {
    color: var(--clr-primary);
  }
}

.timetable-specs,
.stock-specs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5em;
}

.specs-badge {
  margin: 0;

  span:first-child {
    color: white;
    background-color: #666;
    border-radius: 0.25em 0 0 0.25em;
  }

  span:last-child {
    color: black;
    background-color: var(--clr-primary);
    border-radius: 0 0.25em 0.25em 0;
  }
}

hr {
  margin: 0.5em 0;
}

.stock-dangers ul {
  list-style: disc;
  padding-left: 1em;
  padding-top: 0.5em;
  white-space: pre-wrap;
}

.dangers-notes {
  margin-top: 0.5em;
  white-space: pre-wrap;

  p {
    margin-top: 0.25em;
    max-height: 200px;
    max-width: 500px;
    overflow: auto;
  }
}

@include responsive.smallScreen {
  .timetable-specs {
    justify-content: center;
  }

  .details-actions {
    justify-content: center;
  }
}
</style>
