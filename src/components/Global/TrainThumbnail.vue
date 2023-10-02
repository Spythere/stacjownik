<template>
  <img class="train-thumbnail" :src="placeholderUrl" v-if="!isLoaded || isNotFound" />

  <img
    class="train-thumbnail"
    v-if="!isNotFound"
    v-show="isLoaded"
    :src="`https://rj.td2.info.pl/dist/img/thumbnails/${name.split(':')[0]}${stockType == 'loco-ezt' ? 'rb' : ''}.png`"
    @error="onImageError"
    @load="onImageLoad"
    width="220"
    height="60"
  />

  <!-- Handling członów EZT -->
  <img
    class="train-thumbnail"
    v-if="!onlyFirstSegment && isLoaded && /^EN/.test(name)"
    :src="`https://rj.td2.info.pl/dist/img/thumbnails/${name.split(':')[0]}s.png`"
  />

  <img
    class="train-thumbnail"
    v-if="!onlyFirstSegment && isLoaded && /^EN71/.test(name)"
    :src="`https://rj.td2.info.pl/dist/img/thumbnails/${name.split(':')[0]}s.png`"
  />

  <img
    class="train-thumbnail"
    v-if="!onlyFirstSegment && isLoaded && /^EN/.test(name)"
    :src="`https://rj.td2.info.pl/dist/img/thumbnails/${name.split(':')[0]}ra.png`"
  />

  <img class="train-thumbnail" v-if="!onlyFirstSegment && !isLoaded && /^2EN/.test(name)" :src="placeholderUrl" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import imageMixin from '../../mixins/imageMixin';
import { useStore } from '../../store/store';
import { RollingStockInfo } from '../../scripts/interfaces/github_api/StockInfoGithubData';

export default defineComponent({
  mixins: [imageMixin],

  props: {
    name: {
      type: String,
      required: true,
    },

    onlyFirstSegment: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      store: useStore(),
      isLoaded: false,
      isNotFound: false,
    };
  },

  computed: {
    url() {
      return `https://rj.td2.info.pl/dist/img/thumbnails/${this.name.split(':')[0]}.png`;
    },

    placeholderUrl() {
      return this.getImage(`icon-${this.stockType}.png`);
    },

    stockType() {
      if (!this.store.rollingStockData) return 'vehicle-unknown';

      return (
        Object.keys(this.store.rollingStockData.info).find((type) => {
          return this.store.rollingStockData?.info[type as keyof RollingStockInfo].find((v) => v[0] === this.name.split(':')[0]);
        }) || 'vehicle-unknown'
      );
    },
  },

  methods: {
    onImageError() {
      this.isNotFound = true;
      this.isLoaded = false;
    },

    onImageLoad() {
      this.isNotFound = false;
      this.isLoaded = true;
    },
  },
});
</script>

<style lang="scss" scoped>
.train-thumbnail {
  width: auto;
  height: auto;
  max-height: 60px;
}
</style>
