<template>
  <div class="scenery-timetable-header">
    <h3>
      <img src="/images/icon-timetable.svg" alt="icon-timetable" />
      <span>{{ $t('scenery.timetables') }}</span>

      <span>
        <span class="text--primary">{{ onlineScenery?.scheduledTrainCount.all ?? 0 }}</span>
        <span> / </span>
        <span class="text--grayed">
          {{ onlineScenery?.scheduledTrainCount.confirmed ?? 0 }}
        </span>
      </span>

      <span class="header-links" v-if="station && onlineScenery">
        <a
          :href="generatorHref"
          target="_blank"
          data-tooltip-type="HtmlTooltip"
          :data-tooltip-content="`<b>${$t('scenery.gnr-link')}</b>`"
        >
          <img src="/images/icon-gnr.svg" alt="GeneraTOR app icon" />
        </a>

        <a
          :href="pragotronHref"
          target="_blank"
          data-tooltip-type="HtmlTooltip"
          :data-tooltip-content="`<b>${$t('scenery.pragotron-link')}</b>`"
        >
          <img src="/images/icon-pragotron.svg" alt="icon-pragotron" />
        </a>

        <a
          :href="tabliceZbiorczeHref"
          target="_blank"
          data-tooltip-type="HtmlTooltip"
          :data-tooltip-content="`<b>${$t('scenery.tablice-link')}</b>`"
        >
          <img src="/images/icon-tablice.ico" alt="icon-tablice" />
        </a>
      </span>
    </h3>
  </div>
</template>

<script lang="ts" setup>
import { computed, PropType } from 'vue';
import { Station, ActiveScenery } from '../../../typings/common';
import { useMainStore } from '../../../store/mainStore';

const props = defineProps({
  station: {
    type: Object as PropType<Station>
  },

  onlineScenery: {
    type: Object as PropType<ActiveScenery>
  },

  chosenCheckpoint: {
    type: String,
    required: true
  }
});

const mainStore = useMainStore();

const tabliceZbiorczeHref = computed(() => {
  let url = `https://tablice-td2.web.app/?station=${props.station!.name}`;
  if (props.chosenCheckpoint) url += `&checkpoint=${props.chosenCheckpoint}`;

  return url;
});

const pragotronHref = computed(() => {
  let url = `https://pragotron-td2.web.app/board?name=${props.station!.name}&region=${mainStore.region.id}`;
  if (props.chosenCheckpoint) url += `&checkpoint=${props.chosenCheckpoint}`;

  return url;
});

const generatorHref = computed(() => {
  return `https://generator-td2.spythere.eu/?sceneryId=${props.onlineScenery!.name}|${props.onlineScenery!.region}`;
});
</script>

<style lang="scss" scoped>
.scenery-timetable-header {
  background-color: #181818;
  padding: 0.5em;
}

h3 {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  align-items: center;

  gap: 0.5em;
  font-size: 1.3em;
}

img {
  width: 25px;
  vertical-align: middle;
}

.header-links {
  display: flex;
  gap: 0.25em;
  margin-left: 0.5em;
}
</style>
