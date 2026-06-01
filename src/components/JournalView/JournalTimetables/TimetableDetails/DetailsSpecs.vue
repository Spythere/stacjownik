<template>
  <div class="details-specs">
    <div class="g-separator"></div>

    <div class="specs-list">
      <span class="badge specs-badge" v-if="timetable.authorName">
        <span>{{ $t('journal.dispatcher-name') }}</span>
        <span>{{ timetable.authorName }}</span>
      </span>

      <span class="badge specs-badge" v-if="timetable.trainMaxSpeed">
        <span>{{ $t('journal.stock-timetable-speed') }}</span>
        <span> {{ timetable.trainMaxSpeed }}km/h </span>
      </span>

      <span class="badge specs-badge" v-if="timetable.maxSpeed">
        <span>{{ $t('journal.stock-max-speed') }}</span>
        <span>{{ timetable.maxSpeed }}km/h</span>
      </span>
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
@use '@/styles/badge';
@use '@/styles/responsive';

.specs-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5em;
}

@include responsive.smallScreen {
  .details-specs {
    justify-content: center;
  }
}
</style>
