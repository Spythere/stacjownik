<template>
  <div class="details-sceneries">
    <div class="g-separator"></div>

    <h4>SCENERIE I SZLAKI:</h4>
    <ul class="sceneries-list" v-if="timetablePathDetails">
      <li
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
      </li>
    </ul>
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
ul.sceneries-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5em 0;
  color: #ccc;
  margin-top: 0.5em;

  font-size: 0.95em;
}

ul.sceneries-list > li {
  & > .name:first-child,
  & > .arrival:nth-child(2) {
    border-radius: 0.5em 0 0 0.5em;
  }

  & > :last-child {
    border-radius: 0 0.5em 0.5em 0;
  }
}

.name {
  padding: 0.25em 0.5em;
  background-color: #303030;
}

.arrival,
.departure {
  padding: 0.25em;
  display: inline-block;
  background-color: #4e4e4e;
  min-width: 25px;
  text-align: center;
}

.arrow {
  padding: 0 0.5em;
}

.sceneries-list > li[data-visited='true'] {
  .arrival,
  .name,
  .arrow {
    color: lightgreen;
  }

  &[data-next-visited='true'] .departure {
    color: lightgreen;
  }
}
</style>
