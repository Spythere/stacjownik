<template>
  <div class="tooltip-content">
    <span v-if="trainInfo">
      <b v-if="trainInfo.timetableData" style="text-transform: uppercase">
        {{ getCategoryExplanation(trainInfo.timetableData.category) }}
      </b>

      <div class="text--primary">
        <b>{{ trainInfo.stockList[0] }}</b> &bull; {{ trainInfo.length }}m &bull;
        {{ (trainInfo.mass / 1000).toFixed(2) }}t
      </div>

      <div class="text--grayed">
        {{ displayTrainPosition(trainInfo) }} - {{ trainInfo.speed }}km/h
      </div>
    </span>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useTooltipStore } from '../../store/tooltipStore';
import trainCategoryMixin from '../../mixins/trainCategoryMixin';
import trainInfoMixin from '../../mixins/trainInfoMixin';
import { useMainStore } from '../../store/mainStore';

export default defineComponent({
  mixins: [trainCategoryMixin, trainInfoMixin],

  data: () => ({
    tooltipStore: useTooltipStore(),
    mainStore: useMainStore()
  }),

  computed: {
    trainInfo() {
      if (this.tooltipStore.content == '') return null;

      // Passed "content" string should be the desired train's ID
      return this.mainStore.trainList.find((t) => t.id === this.tooltipStore.content);
    }
  }
});
</script>

<style lang="scss" scoped>
.tooltip-content {
  padding: 0.25em 0.5em;
  border-radius: 0.25em;

  width: 100%;
  background-color: #1f1f1f;
  box-shadow: 0 0 5px 2px #aaa;
}

img {
  height: 1em;
}
</style>
