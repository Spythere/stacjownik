<template>
  <section class="info-header">
    <button
      class="btn btn-return"
      :title="$t('scenery.return-btn')"
      @click="onReturnButtonClick"
    >
      <img src="/images/icon-back.svg" alt="return button" />
    </button>

    <a class="scenery-name" :href="station?.generalInfo?.url" target="_blank">
      {{ stationName.replace(/_/g, ' ') }}
    </a>

    <div class="scenery-abbrev" v-if="station?.generalInfo?.abbr">
      {{ $t('scenery.abbrev') }} <b>{{ station.generalInfo.abbr }}</b>
    </div>

    <div class="scenery-hash" v-if="onlineScenery?.hash">#{{ onlineScenery.hash }}</div>
  </section>
</template>

<script lang="ts" setup>
import { onMounted, PropType, ref } from 'vue';
import { ActiveScenery, Station } from '../../typings/common';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const prevPath = ref('/');

onMounted(() => {
  prevPath.value = (route.meta['prevPath'] as string) ?? '/';
});

defineProps({
  station: {
    type: Object as PropType<Station>
  },

  stationName: {
    type: String,
    required: true
  },

  onlineScenery: {
    type: Object as PropType<ActiveScenery>
  }
});

function onReturnButtonClick() {
  router.push(prevPath.value);
}
</script>

<style lang="scss" scoped>
@use '../../styles/responsive';
@use 'sass:color';

.btn-return {
  $bgColor: #2b2b2b;
  background-color: $bgColor;
  margin-bottom: 0.5em;

  img {
    width: 2em;
  }

  &:hover {
    background-color: color.adjust($color: $bgColor, $lightness: 15%);
  }
}

.scenery-name {
  font-weight: bold;
  font-size: 3em;

  text-align: center;

  text-transform: uppercase;
}

.scenery-abbrev {
  font-size: 1.3em;
  color: #aaa;
}

.scenery-hash {
  margin-top: 0.5em;
  color: #aaa;
  font-size: 1.2em;
}

@include responsive.smallScreen {
  .scenery-name {
    font-size: 2.5em;
  }
}
</style>
