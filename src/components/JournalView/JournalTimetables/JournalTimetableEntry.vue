<template>
  <li class="timetable-history-entry">
    <!-- General -->
    <EntryGeneral :timetable="timetableEntry" />

    <!-- Route -->
    <div class="entry-route">
      <b>{{ timetableEntry.route.replace('|', ' - ') }}</b>
    </div>

    <hr />

    <div style="cursor: pointer">
      <!-- Status -->
      <EntryStatus :timetable="timetableEntry" />
    </div>

    <!-- Extra -->
    <EntryDetails
      :timetableEntry="timetableEntry"
      :show-extra-info="showExtraInfo"
      @toggle-extra-info="toggleExtraInfo"
    />
  </li>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { API } from '../../../typings/api';
import { useApiStore } from '../../../store/apiStore';

import trainCategoryMixin from '../../../mixins/trainCategoryMixin';
import dateMixin from '../../../mixins/dateMixin';
import styleMixin from '../../../mixins/styleMixin';

import EntryGeneral from './EntryGeneral.vue';
import EntryStatus from './EntryStatus.vue';
import EntryDetails from './EntryDetails.vue';

export default defineComponent({
  props: {
    timetableEntry: {
      type: Object as PropType<API.TimetableHistory.DataShort>,
      required: true
    },
    showExtraInfo: {
      type: Boolean,
      required: true
    }
  },

  components: { EntryDetails, EntryGeneral, EntryStatus },
  mixins: [trainCategoryMixin, dateMixin, styleMixin],
  emits: ['toggleShowExtraInfo'],

  data() {
    return {
      apiStore: useApiStore()
    };
  },

  methods: {
    toggleExtraInfo(data: API.TimetableHistory.Data | null) {
      this.$emit('toggleShowExtraInfo', data);
    }
  }
});
</script>

<style lang="scss" scoped>
@use '../../../styles/responsive';

.timetable-history-entry {
  background-color: #1a1a1a;
  padding: 1em;
}

.entry-route {
  display: flex;
}

@include responsive.smallScreen {
  .entry-route {
    justify-content: center;
    text-align: center;
  }
}
</style>
