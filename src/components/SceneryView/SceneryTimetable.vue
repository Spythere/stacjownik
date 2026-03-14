<template>
  <section class="scenery-timetable">
    <SceneryTimetableHeader
      :station="station"
      :onlineScenery="onlineScenery"
      :chosenCheckpoint="chosenCheckpoint"
      :showStockThumbnails="showStockThumbnails"
      @toggleThumbnails="toggleThumbnails"
    />

    <SceneryTimetableList
      :station="station"
      :onlineScenery="onlineScenery"
      :chosenCheckpoint="chosenCheckpoint"
      :showStockThumbnails="showStockThumbnails"
    />
  </section>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref } from 'vue';
import { useRoute } from 'vue-router';

import SceneryTimetableHeader from './SceneryTimetable/SceneryTimetableHeader.vue';

import dateMixin from '../../mixins/dateMixin';
import routerMixin from '../../mixins/routerMixin';
import trainCategoryMixin from '../../mixins/trainCategoryMixin';
import { useMainStore } from '../../store/mainStore';
import { useApiStore } from '../../store/apiStore';
import { ActiveScenery, Station } from '../../typings/common';
import SceneryTimetableList from './SceneryTimetable/SceneryTimetableList.vue';

export default defineComponent({
  name: 'SceneryTimetable',

  components: { SceneryTimetableHeader, SceneryTimetableList },

  mixins: [dateMixin, routerMixin, trainCategoryMixin],

  props: {
    station: {
      type: Object as PropType<Station>
    },
    onlineScenery: {
      type: Object as PropType<ActiveScenery>
    }
  },

  data: () => ({
    listOpen: false,
    showStockThumbnails: false
  }),

  activated() {
    this.loadSelectedOption();
  },

  watch: {
    currentURL() {
      this.loadSelectedOption();
    }
  },

  setup(props) {
    const route = useRoute();
    const currentURL = computed(() => `${location.origin}${route.fullPath}`);

    const apiStore = useApiStore();
    const mainStore = useMainStore();

    const chosenCheckpoint = ref(
      props.station?.generalInfo?.checkpoints[0] ??
        props.onlineScenery?.missingCheckpoints[0] ??
        props.station?.name ??
        route.query['station']?.toString() ??
        ''
    );

    return {
      currentURL,
      chosenCheckpoint,
      apiStore,
      mainStore
    };
  },

  methods: {
    toggleThumbnails() {
      this.showStockThumbnails = !this.showStockThumbnails;
    },

    loadSelectedOption() {
      const queryCheckpoint = this.$route.query['checkpoint']?.toString();

      let checkpointsListRef: string[] | null = null;
      let sceneryName = '';

      if (this.station && this.station.generalInfo) {
        checkpointsListRef = this.station.generalInfo.checkpoints;
        sceneryName = this.station.name;
      } else if (this.onlineScenery) {
        checkpointsListRef = this.onlineScenery.missingCheckpoints;
        sceneryName = this.onlineScenery.name;
      } else if (this.station) {
        this.chosenCheckpoint = this.station.name;
        sceneryName = this.station.name;
      }

      if (checkpointsListRef) {
        this.chosenCheckpoint =
          checkpointsListRef.find(
            (ch) => ch.toLocaleLowerCase() === queryCheckpoint?.toLocaleLowerCase()
          ) ??
          checkpointsListRef[0] ??
          sceneryName;
      }
    }
  }
});
</script>

<style lang="scss" scoped>
.scenery-timetable {
  display: grid;
  height: 100%;
  overflow: hidden;
  grid-template-rows: auto 1fr;
}
</style>
