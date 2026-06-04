<template>
  <div class="details-sceneries">
    <div class="g-separator"></div>

    <h4>SCENERIE I SZLAKI:</h4>
    <div class="path-list" v-if="timetablePathDetails">
      <div
        class="path-element"
        v-for="(pathData, i) in timetablePathDetails"
        :data-visited="pathData.isVisited"
        :data-visited-offline-only="pathData.isVisitedOffline"
      >
        <span class="connection" v-if="i > 0">
          <span>{{ timetablePathDetails[i - 1].departure }}</span>
          <span class="arrow"></span>
          <span>{{ pathData.arrival }}</span>
        </span>

        <span class="scenery-info">
          <span class="name">{{ pathData.sceneryName }}</span>
          <span class="hash">#{{ pathData.sceneryHash }}</span>
          <span
            class="checkmark"
            v-if="pathData.isVisited"
            data-tooltip-type="BaseTooltip"
            :data-tooltip-content="`${pathData.sceneryName}: sceneria odwiedzona`"
          >
            &checkmark;
          </span>
        </span>
      </div>
      <!-- <li
        v-for="(pathData, i) in timetablePathDetails"
        :data-visited="pathData.isVisited"
        :data-next-visited="
          i < timetablePathDetails.length - 1 && timetablePathDetails[i + 1].isVisited
        "
      >
        <span v-if="i > 0" class="arrow">&gt;</span>
        <span class="arrival" v-if="pathData.arrival">{{ pathData.arrival }}</span>
        <b class="name">{{ pathData.sceneryName }}</b>
        <span class="departure" v-if="pathData.departure">{{ pathData.departure }}</span>
      </li> -->
    </div>
  </div>
</template>

<script lang="ts">
import { PropType, defineComponent } from 'vue';
import dateMixin from '../../../../mixins/dateMixin';
import { API } from '../../../../typings/api';

export default defineComponent({
  mixins: [dateMixin],

  props: {
    timetable: {
      type: Object as PropType<API.TimetableHistory.Data>,
      required: true
    }
  },

  computed: {
    timetablePathDetails() {
      if (!this.timetable.path || this.timetable.path == '') return null;

      return this.timetable.path.split(';').map((pathEl, i) => {
        const [arrival, name, departure] = pathEl.split(',');
        const sceneryName = name.split(' ').slice(0, -1).join(' ');
        const sceneryHash = name.split(' ').pop()?.replace('.sc', '') ?? '';
        const isVisited = this.timetable.visitedSceneries.includes(sceneryHash);

        return {
          arrival,
          sceneryName,
          sceneryHash,
          departure,
          isVisited,
          isVisitedOffline:
            !isVisited &&
            this.timetable.visitedSceneries.includes(`${sceneryName} ${sceneryHash}.sc`)
        };
      });
    }
  }
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
  flex-wrap: wrap;
  gap: 0.25em;
}

.scenery-info > .hash {
  color: #aaa;
}

.scenery-info > .checkmark {
  font-size: 1.5em;
  line-height: 0.75em;
  user-select: none;
  -moz-user-select: none;
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
