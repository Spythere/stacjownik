<template>
  <li
    v-for="{ timetable, showExtraInfo} in computedTimetableHistory"
    class="journal_item"
    :key="timetable.id"
    @click="showExtraInfo.value = !showExtraInfo.value"
  >
    <div class="journal_item-info">
      <!-- Item General -->
      <ItemGeneral :timetable="timetable" />

      <!-- Item Route -->
      <span class="item-route">
        <b>{{ timetable.route.replace('|', ' - ') }}</b>
      </span>

      <hr />

      <!-- Item Stops -->
      <ItemStops :timetable="timetable" :showExtraInfo="showExtraInfo.value" />

      <!-- Item Status -->
      <ItemStatus :timetable="timetable" />

      <button class="btn--option btn--show">
        {{ $t('journal.stock-info') }}
        <img :src="getIcon(`arrow-${showExtraInfo.value ? 'asc' : 'desc'}`)" alt="Arrow" />
      </button>

      <!-- Item Extra -->
      <ItemExtra :timetable="timetable" :showExtraInfo="showExtraInfo.value" />
    </div>
  </li>
</template>

<script lang="ts">
import { PropType, defineComponent, ref } from 'vue';
import { TimetableHistory } from '../../../scripts/interfaces/api/TimetablesAPIData';
import imageMixin from '../../../mixins/imageMixin';

import ItemGeneral from './ItemGeneral.vue';
import ItemStops from './ItemStops.vue';
import ItemStatus from './ItemStatus.vue';
import ItemExtra from './ItemExtra.vue';

export default defineComponent({
  mixins: [imageMixin],
  props: {
    timetableHistory: {
      type: Array as PropType<TimetableHistory[]>,
      required: true,
    },
  },
  computed: {
    computedTimetableHistory() {
      return this.timetableHistory.map((timetable) => ({
        timetable,
        showExtraInfo: ref(false),
      }));
    },
  },
  methods: {},
  components: { ItemGeneral, ItemStops, ItemStatus, ItemExtra },
});
</script>

<style lang="scss" scoped>
@import '../../../styles/variables.scss';
@import '../../../styles/responsive.scss';

.btn--show {
  display: flex;
  font-weight: bold;
  padding: 0.2em 0.45em;

  img {
    height: 1.3em;
  }
}

.journal_item {
  cursor: pointer;
}

.journal_item,
.journal_warning {
  background-color: #1a1a1a;
  padding: 1em;
  margin-bottom: 1em;
}

hr {
  margin: 0.25em 0;
}

// badge.scss
.badges {
  display: flex;
  gap: 0.25em;
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

  .info-general,
  .general-train,
  .stock-specs,
  .stock-history {
    justify-content: center;
  }
}
</style>
