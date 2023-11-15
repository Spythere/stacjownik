<template>
  <img class="train-thumbnail" :src="placeholderUrl" v-if="isNotFound" />

  <img
    class="train-thumbnail"
    v-else
    :src="`https://rj.td2.info.pl/dist/img/thumbnails/${name.split(':')[0]}${
      stockType == 'loco-ezt' ? 'rb' : ''
    }.png`"
    @error="onImageError"
    @load="onImageLoad"
    width="220"
    height="60"
  />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useStore } from '../../store/mainStore';
import { API } from '../../typings/api';

export default defineComponent({
  props: {
    name: {
      type: String,
      required: true
    },

    onlyFirstSegment: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      store: useStore(),
      isNotFound: false,
      isLoaded: false
    };
  },

  computed: {
    url() {
      return `https://rj.td2.info.pl/dist/img/thumbnails/${this.name.split(':')[0]}.png`;
    },

    placeholderUrl() {
      return `/images/icon-${this.stockType}.png`;
    },

    stockType() {
      if (!this.store.rollingStockData) return 'vehicle-unknown';

      return (
        Object.keys(this.store.rollingStockData.info).find((type) => {
          return this.store.rollingStockData?.info[type as keyof API.RollingStock.Info].find(
            (v) => v[0] === this.name.split(':')[0]
          );
        }) || 'vehicle-unknown'
      );
    }
  },

  methods: {
    onImageError() {
      this.isNotFound = true;
      this.isLoaded = false;
    },

    onImageLoad() {
      this.isNotFound = false;
      this.isLoaded = true;
    }
  }
});
</script>

<style lang="scss" scoped>
.train-thumbnail {
  width: auto;
  height: auto;
  max-height: 60px;
}
</style>
