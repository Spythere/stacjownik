<template>
  <transition-group class="journal-list" tag="ul" name="list-anim">
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
        <span>
          <b
            v-if="item.dispatcherLevel !== null"
            class="dispatcher-level"
            :style="calculateExpStyle(item.dispatcherLevel, item.dispatcherIsSupporter)"
          >
            {{ item.dispatcherLevel >= 2 ? item.dispatcherLevel : 'L' }}
          </b>

          <b class="text--primary">{{ item.dispatcherName }}</b> &bull; <b>{{ item.stationName }}</b>
          <span class="text--grayed">&nbsp;#{{ item.stationHash }}&nbsp;</span>
          <span class="region-badge" :class="item.region">PL1</span>
        </span>

        <span>
          <span :data-status="item.isOnline"> {{ item.isOnline ? $t('journal.online-since') : 'OFFLINE' }}&nbsp; </span>
          <span>
            {{ new Date(item.timestampFrom).toLocaleTimeString('pl-PL', { timeStyle: 'short' }) }}
          </span>

          <span v-if="item.currentDuration && item.isOnline"> ({{ calculateDuration(item.currentDuration) }}) </span>

          <span v-if="item.timestampTo">
            &gt;
            {{ new Date(item.timestampTo).toLocaleTimeString('pl-PL', { timeStyle: 'short' }) }}
            ({{ $t('journal.duty-lasted') }} {{ calculateDuration(item.currentDuration!) }})
          </span>
        </span>
      </div>
    </li>
  </transition-group>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import dateMixin from '../../mixins/dateMixin';
import { DispatcherHistory } from '../../scripts/interfaces/api/DispatchersAPIData';
import styleMixin from '../../mixins/styleMixin';

export default defineComponent({
  props: {
    dispatcherHistory: {
      type: Array as PropType<DispatcherHistory[]>,
      required: true,
    },
  },

  mixins: [dateMixin, styleMixin],

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
@import '../../styles/JournalSection.scss';

.region-badge {
  padding: 0.1em 0.5em;
  border-radius: 0.5em;
  font-weight: bold;

  &.eu {
    background-color: forestgreen;
  }
}

li.sticky {
  position: sticky;
  top: 0;
}

.journal_item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  text-align: left;

  gap: 0.25em;

  line-height: 1.7em;
  padding: 0.75em;

  &.online {
    cursor: pointer;
  }

  span[data-status='true'] {
    color: springgreen;
  }

  span[data-status='false'] {
    color: salmon;
  }
}

.journal_day {
  margin-bottom: 1em;
  padding: 0.5em;
  font-weight: bold;

  background-color: #333;

  span {
    position: relative;
    background-color: inherit;
    z-index: 10;
    padding-right: 1em;

    font-weight: bold;
  }
}

.dispatcher-level {
  display: inline-block;
  text-align: center;

  line-height: 1.45em;
  width: 1.45em;
  height: 1.45em;

  margin-right: 0.45em;
  border-radius: 0.25em;
}
</style>
