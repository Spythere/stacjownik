<template>
  <ul class="journal-list">
    <transition-group name="list-anim">
      <li
        v-for="{ timetable, showExtraInfo } in computedTimetableHistory"
        class="journal_item"
        :key="timetable.id"
        @click="showExtraInfo.value = !showExtraInfo.value"
      >
        <div class="journal_item-info">
          <!-- General -->
          <TimetableGeneral :timetable="timetable" />
          <!-- Route -->
          <span class="item-route">
            <b>{{ timetable.route.replace('|', ' - ') }}</b>
          </span>

          <hr />
          <!-- Stops -->
          <TimetableStops :timetable="timetable" :showExtraInfo="showExtraInfo.value" />
          <!-- Status -->
          <TimetableStatus :timetable="timetable" />

          <button class="btn--option btn--show">
            {{ $t('journal.stock-info') }}
            <img
              :src="`/images/icon-arrow-${showExtraInfo.value ? 'asc' : 'desc'}.svg`"
              alt="Arrow icon"
            />
          </button>
          <!-- Extra -->
          <TimetableExtra :timetable="timetable" :showExtraInfo="showExtraInfo.value" />
        </div>
      </li>
    </transition-group>
  </ul>
</template>

<script lang="ts">
import { PropType, defineComponent, ref } from 'vue';
import { TimetableHistory } from '../../../scripts/interfaces/api/TimetablesAPIData';

import TimetableGeneral from './TimetableGeneral.vue';
import TimetableStops from './TimetableStops.vue';
import TimetableStatus from './TimetableStatus.vue';
import TimetableExtra from './TimetableExtra.vue';

export default defineComponent({
  props: {
    timetableHistory: {
      type: Array as PropType<TimetableHistory[]>,
      required: true
    }
  },
  computed: {
    computedTimetableHistory() {
      return this.timetableHistory.map((timetable) => ({
        timetable,
        showExtraInfo: ref(false)
      }));
    }
  },
  methods: {},
  components: { TimetableGeneral, TimetableStops, TimetableStatus, TimetableExtra }
});
</script>

<style lang="scss" scoped>
@import '../../../styles/variables.scss';
@import '../../../styles/responsive.scss';
@import '../../../styles/JournalSection.scss';

.btn--show {
  display: flex;
  font-weight: bold;
  padding: 0.2em 0.45em;

  img {
    height: 1.3em;
  }
}

hr {
  margin: 0.25em 0;
}

@include smallScreen {
  .journal_item-info {
    text-align: center;
  }

  .item-route {
    display: flex;
    justify-content: center;
  }

  .btn--show {
    margin: 1em auto 0 auto;
  }
}
</style>
