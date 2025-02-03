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

      <EntryStops :timetable="timetable" />

      <div class="g-separator"></div>

      <div class="stock-specs">
        <span class="badge" v-if="timetable.authorName">
          <span>{{ $t('journal.dispatcher-name') }}</span>
          <span>{{ timetable.authorName }}</span>
        </span>

        <span class="badge" v-if="timetable.stockLength">
          <span>{{ $t('journal.stock-length') }}</span>
          <span>
            {{
              currentHistoryIndex == 0
                ? timetable.stockLength
                : stockHistory[currentHistoryIndex].stockLength || timetable.stockLength
            }}m
          </span>
        </span>

        <span class="badge" v-if="timetable.stockMass">
          <span>{{ $t('journal.stock-mass') }}</span>
          <span>
            {{
              Math.floor(
                (currentHistoryIndex == 0
                  ? timetable.stockMass
                  : stockHistory[currentHistoryIndex].stockMass || timetable.stockMass) / 1000
              )
            }}t
          </span>
        </span>

        <span class="badge" v-if="timetable.maxSpeed">
          <span>{{ $t('journal.stock-max-speed') }}</span>
          <span>{{ timetable.maxSpeed }}km/h</span>
        </span>

        <span class="badge" v-if="timetable.trainMaxSpeed">
          <span>{{ $t('journal.stock-timetable-speed') }}</span>
          <span> {{ timetable.trainMaxSpeed }}km/h </span>
        </span>
      </div>

      <div class="stock-dangers" v-if="timetable.warningNotes">
        <div class="g-separator"></div>

        <b>{{ $t('journal.stock-dangers') }}:</b>

        <ul>
          <li v-if="timetable.twr">
            <b class="text--primary">{{ $t('warnings.TWR') }} (TWR)</b>
          </li>

          <li v-if="timetable.skr">
            <b class="text--primary">{{ $t('warnings.SKR') }}</b>
          </li>

          <li v-if="timetable.hasDangerousCargo">
            <b class="text--primary">{{ $t('warnings.TN') }}</b>
          </li>

          <li v-if="timetable.hasExtraDeliveries">
            <b class="text--primary">{{ $t('warnings.PN') }}</b>
          </li>
        </ul>

        <div class="dangers-notes" v-if="timetable.warningNotes">
          <h4>{{ $t('warnings.header-title') }}</h4>
          <p>
            <i>{{ timetable.warningNotes }}</i>
          </p>
        </div>
      </div>

      <!-- Historia zmian w składzie -->
      <div v-if="timetable.stockString || stockHistory.length != 0">
        <div class="g-separator"></div>
        <b>{{ $t('journal.stock-preview') }}:</b>

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

        <div v-if="timetable.stockString" style="margin-top: 1em">
          <StockList
            :trainStockList="
              (currentHistoryIndex == 0
                ? timetable.stockString
                : stockHistory[currentHistoryIndex].stockString
              ).split(';')
            "
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { PropType, defineComponent } from 'vue';
import StockList from '../../Global/StockList.vue';
import { API } from '../../../typings/api';
import { RouteLocationRaw } from 'vue-router';
import EntryStops from './EntryStops.vue';
import { useI18n } from 'vue-i18n';

export default defineComponent({
  components: { StockList, EntryStops },

  emits: ['toggleExtraInfo'],

  props: {
    showExtraInfo: {
      type: Boolean,
      required: true
    },
    timetable: {
      type: Object as PropType<API.TimetableHistory.Data>,
      required: true
    }
  },
  data() {
    return {
      currentHistoryIndex: 0,
      i18n: useI18n()
    };
  },
  computed: {
    stockHistory() {
      return this.timetable.stockHistory
        .slice()
        .reverse()
        .map((h) => {
          const historyData = h.split('@');
          return {
            updatedAt: new Date(Number(historyData[0])).toLocaleTimeString(this.$i18n.locale, {
              hour: '2-digit',
              minute: '2-digit'
            }),
            stockString: historyData[1],
            stockMass: Number(historyData[2]) || undefined,
            stockLength: Number(historyData[3]) || undefined
          };
        });
    },

    driverRouteLocation(): RouteLocationRaw | null {
      if (this.timetable.terminated) return null;
      return {
        name: 'DriverView',
        query: {
          trainId: `${this.timetable.driverId}|${this.timetable.trainNo}|eu`
        }
      };
    }
  },
  methods: {
    onImageError(e: Event) {
      const imageEl = e.target as HTMLImageElement;
      imageEl.src = '/images/icon-unknown.png';
    },

    toggleExtraInfo() {
      this.$emit('toggleExtraInfo', this.timetable.id);
    },

    copyStockToClipboard() {
      const currentStockString =
        this.stockHistory[this.currentHistoryIndex]?.stockString ?? this.timetable.stockString;

      if (!currentStockString) {
        alert(this.i18n.t('journal.stock-clipboard-failure'));
        return;
      }

      navigator.clipboard
        .writeText(currentStockString)
        .then(() => {
          prompt(this.i18n.t('journal.stock-clipboard-success'), currentStockString);
        })
        .catch(() => {
          alert(this.i18n.t('journal.stock-clipboard-failure'));
        });
    }
  }
});
</script>

<style lang="scss" scoped>
@import '../../../styles/variables.scss';
@import '../../../styles/responsive.scss';
@import '../../../styles/badge.scss';

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
    color: $accentCol;
  }
}

.stock-specs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5em;

  .badge {
    margin: 0;

    span:last-child {
      color: black;
      background-color: $accentCol;
    }
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

@include smallScreen() {
  .stock-specs {
    justify-content: center;
  }

  .details-actions {
    justify-content: center;
  }
}
</style>
