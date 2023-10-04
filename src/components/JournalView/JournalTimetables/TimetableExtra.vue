<template>
  <div class="item-extra" v-if="timetable.stockString && timetable.stockMass && showExtraInfo">
    <hr />

    <div class="stock-specs">
      <span class="badge">
        <span>{{ $t('journal.dispatcher-name') }}</span>
        <span>{{ timetable.authorName }}</span>
      </span>
    </div>

    <div class="stock-specs">
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

    <!-- <StockList :trainStockList="currentHistoryIndex == 0 ? timetable.stockString : stockHistory[currentHistoryIndex].stockString).split(';')" /> -->
    <StockList
      :trainStockList="
        (currentHistoryIndex == 0
          ? timetable.stockString
          : stockHistory[currentHistoryIndex].stockString
        ).split(';')
      "
    />

    <!-- <ul class="stock-list">
      <li
        v-for="(stockName, i) in (currentHistoryIndex == 0 ? timetable.stockString : stockHistory[currentHistoryIndex].stockString).split(';')"
        :key="i"
      >
        <div>{{ stockName.split(':')[0].split('_').splice(0, 2).join(' ') }} {{ stockName.split(':')[1] }}</div>
        <TrainThumbnail :name="stockName" />
      </li>
    </ul> -->
  </div>
</template>

<script lang="ts">
import { PropType, defineComponent } from 'vue';
import { TimetableHistory } from '../../../scripts/interfaces/api/TimetablesAPIData';
import imageMixin from '../../../mixins/imageMixin';
import StockList from '../../Global/StockList.vue';

export default defineComponent({
  mixins: [imageMixin],
  components: { StockList },
  props: {
    showExtraInfo: {
      type: Boolean,
      required: true
    },
    timetable: {
      type: Object as PropType<TimetableHistory>,
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
    }
  },
  methods: {
    onImageError(e: Event) {
      const imageEl = e.target as HTMLImageElement;
      imageEl.src = this.getImage('unknown.png');
    }
  }
});
</script>

<style lang="scss" scoped>
@import '../../../styles/variables.scss';
@import '../../../styles/responsive.scss';
@import '../../../styles/badge.scss';

.item-extra {
  margin-top: 0.5em;
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

  @include smallScreen() {
    justify-content: center;
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
</style>
