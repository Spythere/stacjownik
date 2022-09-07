<template>
  <ul class="journal-list">
    <transition-group name="journal-list-anim">
      <li v-for="(doc, i) in dispatcherHistory" :key="doc.id">
        <div class="journal_day" v-if="isAnotherDay(i - 1, i)">
          <span>{{ new Date(doc.timestampFrom).toLocaleDateString('pl-PL') }}</span>
        </div>

        <div
          class="journal_item"
          :class="{ online: doc.isOnline }"
          @click="navigateToScenery(doc.stationName, doc.isOnline)"
          @keydown.enter="navigateToScenery(doc.stationName, doc.isOnline)"
          tabindex="0"
        >
          <span>
            <b class="text--primary">{{ doc.dispatcherName }}</b> &bull; <b>{{ doc.stationName }}</b>
            <span class="text--grayed">&nbsp;#{{ doc.stationHash }}&nbsp;</span>
            <span class="region-badge" :class="doc.region">PL1</span>
          </span>

          <span>
            <span :data-status="doc.isOnline"> {{ doc.isOnline ? $t('journal.online-since') : 'OFFLINE' }}&nbsp; </span>
            <span>
              {{ new Date(doc.timestampFrom).toLocaleTimeString('pl-PL', { timeStyle: 'short' }) }}
            </span>

            <span v-if="doc.currentDuration && doc.isOnline"> ({{ calculateDuration(doc.currentDuration) }}) </span>

            <span v-if="doc.timestampTo">
              &gt;
              {{ new Date(doc.timestampTo).toLocaleTimeString('pl-PL', { timeStyle: 'short' }) }}
              ({{ $t('journal.duty-lasted') }} {{ calculateDuration(doc.currentDuration!) }})
            </span>
          </span>
        </div>
      </li>
    </transition-group>
  </ul>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import dateMixin from '../../mixins/dateMixin';
import { DispatcherHistory } from '../../scripts/interfaces/api/DispatchersAPIData';

export default defineComponent({
  props: {
    dispatcherHistory: {
      type: Array as PropType<DispatcherHistory[]>,
      required: true,
    },
  },

  mixins: [dateMixin],

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

.journal_item {
  display: flex;
  justify-content: space-between;
  align-items: center;

  flex-wrap: wrap;

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
  position: relative;
  text-align: center;
  background-color: #4d4d4d;

  margin: 1em 0;

  span {
    position: relative;
    background-color: #4d4d4d;
    z-index: 10;

    padding: 0 0.5em;
  }

  &::after {
    position: absolute;
    content: '';

    z-index: 0;

    left: 50%;
    top: 50%;

    transform: translate(-50%, -50%);

    height: 3px;
    width: 60%;
    min-width: 200px;

    background-color: white;
  }
}

@include smallScreen() {
  .journal_item {
    flex-direction: column;

    span {
      margin-top: 0.25em;
      text-align: center;
    }
  }
}
</style>
