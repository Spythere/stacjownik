<template>
  <div class="details-sceneries">
    <div class="g-separator"></div>

    <h4>{{ $t('journal.timetable-sceneries-title') }}</h4>

    <div class="path-list" v-if="timetablePathDetails">
      <div
        class="path-element"
        v-for="(pathData, i) in timetablePathDetails"
        :data-visited="pathData.isVisited"
        :data-visited-offline-only="pathData.isVisitedOffline"
      >
        <span class="connection" v-if="i > 0">
          <span>{{ timetablePathDetails[i - 1].departure }}</span>
          &gt;
          <span>{{ pathData.arrival }}</span>
        </span>

        <span class="scenery-info">
          <span class="name">{{ pathData.sceneryName }}</span>
          <span class="hash">#{{ pathData.sceneryHash }}</span>
          <i
            class="fa fa-check"
            v-if="pathData.isVisited"
            data-tooltip-type="BaseTooltip"
            :data-tooltip-content="`${pathData.sceneryName}: ${$t('journal.timetable-scenery-visited')}`"
            aria-hidden="true"
          >
          </i>
        </span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { PropType, computed } from 'vue';
import { API } from '../../../../typings/api';

const props = defineProps({
  timetable: {
    type: Object as PropType<API.TimetableHistory.Data>,
    required: true
  }
});

const timetablePathDetails = computed(() => {
  if (!props.timetable.path || props.timetable.path == '') return null;

  return props.timetable.path.split(';').map((pathEl) => {
    const [arrival, name, departure] = pathEl.split(',');
    const sceneryName = name.split(' ').slice(0, -1).join(' ');
    const sceneryHash = name.split(' ').pop()?.replace('.sc', '') ?? '';
    const isVisited = props.timetable.visitedSceneries.includes(sceneryHash);

    return {
      arrival,
      sceneryName,
      sceneryHash,
      departure,
      isVisited,
      isVisitedOffline:
        !isVisited && props.timetable.visitedSceneries.includes(`${sceneryName} ${sceneryHash}.sc`)
    };
  });
});
</script>

<style lang="scss" scoped>
.path-list {
  display: flex;
  flex-wrap: wrap;
  align-items: center;

  gap: 0.5em;
  margin-top: 0.5em;

  font-size: 0.95em;
}

.path-list > .path-element {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5em;
}

.path-element > .connection {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5em;
  color: var(--clr-primary);
  font-size: 0.9em;

  & > .arrow::after {
    content: '\027F6';
    display: block;
    font-size: 1.2em;
  }
}

.scenery-info {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.25em;
}

.scenery-info > .hash {
  color: #aaa;
}

.scenery-info > i {
  color: lightgreen;
}

.path-element[data-visited='true'] > .scenery-info {
  .name,
  .checkmark {
    color: lightgreen;
  }
}

.path-element[data-visited-offline-only='true'] > .scenery-info > .name {
  color: lightgreen;
}
</style>
