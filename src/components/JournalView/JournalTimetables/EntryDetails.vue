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
      <hr />
      <EntryStops :timetable="timetable" />

      <div class="stock-specs" v-if="timetable.authorName">
        <span class="badge">
          <span>{{ $t('journal.dispatcher-name') }}</span>
          <span>{{ timetable.authorName }}</span>
        </span>
      </div>

      <div class="stock-specs" v-if="timetable.stockMass && timetable.stockHistory.length > 0">
        <span class="badge">
          <span>{{ $t('journal.stock-max-speed') }}</span>
          <span>{{ timetable.maxSpeed }}km/h</span>
        </span>

        <span class="badge">
          <span>{{ $t('journal.stock-length') }}</span>
          <span>
            {{
              currentHistoryIndex == 0
                ? timetable.stockLength
                : stockHistory[currentHistoryIndex].stockLength || timetable.stockLength
            }}m
          </span>
        </span>

        <span class="badge">
          <span>{{ $t('journal.stock-mass') }}</span>
          <span>
            {{
              Math.floor(
                (currentHistoryIndex == 0
                  ? timetable.stockMass!
                  : stockHistory[currentHistoryIndex].stockMass || timetable.stockMass) / 1000
              )
            }}t
          </span>
        </span>
      </div>

      <!-- Historia zmian w składzie -->
      <div class="stock-history" v-if="stockHistory.length > 1">
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

      <div v-if="timetable.stockString">
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

    <div v-if="timetable.twr">TWR: {{ timetable.warningNotes }}</div>
  </div>
</template>

<script lang="ts">
import { PropType, defineComponent } from 'vue';
import StockList from '../../Global/StockList.vue';
import { API } from '../../../typings/api';
import { RouteLocationRaw } from 'vue-router';
import EntryStops from './EntryStops.vue';

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
      currentHistoryIndex: 0
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
  margin-top: 0.5em;

  .badge {
    margin: 0;

    span:last-child {
      color: black;
      background-color: $accentCol;
    }
  }
}

ul.stock-list {
  display: flex;
  align-items: flex-end;
  overflow: auto;

  padding-bottom: 0.5em;

  li > div {
    margin: 1em 0;

    text-align: center;
    color: #aaa;
    font-size: 0.9em;
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
