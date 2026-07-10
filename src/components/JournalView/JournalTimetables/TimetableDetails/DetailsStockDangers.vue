<template>
  <div class="details-dangers">
    <div class="g-separator"></div>

    <b>{{ $t('journal.stock-dangers') }}:</b>

    <ul class="dangers-list">
      <li v-if="timetable.twr">
        <b class="text--primary">{{ $t('warnings.TWR') }}</b>
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

    <div class="dangers-notes">
      <h4>{{ $t('warnings.header-title') }}</h4>
      <p>
        <i>{{ timetable.warningNotes }}</i>
      </p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { PropType } from 'vue';
import { API } from '../../../../typings/api';

const props = defineProps({
  timetable: {
    type: Object as PropType<API.TimetableHistory.Data>,
    required: true
  }
});
</script>

<style lang="scss" scoped>
.dangers-list {
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
</style>
