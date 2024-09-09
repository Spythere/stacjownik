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

        <span class="badge" v-if="timetable.maxSpeed">
          <span>{{ $t('journal.stock-max-speed') }}</span>
          <span>{{ timetable.maxSpeed }}km/h</span>
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
      </div>

      <div class="stock-dangers" v-if="timetable.twr || timetable.skr">
        <div class="g-separator"></div>

        <b>{{ $t('journal.stock-dangers') }}:</b>

        <ul>
          <li v-if="timetable.twr">
            <b class="text--primary">{{ $t('general.TWR') }} (TWR)</b>
            <span v-if="timetable.warningNotes">
              | <i>{{ timetable.warningNotes }}</i>
            </span>
          </li>

          <li v-if="timetable.skr">
            <b class="text--primary">{{ $t('general.SKR') }}</b>
            <span v-if="timetable.warningNotes">
              | Komentarze: <i>{{ timetable.warningNotes }}</i>
            </span>
          </li>
        </ul>
      </div>

      <!-- Historia zmian w składzie -->
      <div v-if="timetable.stockString || stockHistory.length != 0">
        <div class="g-separator"></div>
        <b>{{ $t('journal.stock-preview') }}:</b>

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
