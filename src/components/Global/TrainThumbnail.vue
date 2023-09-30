<template>
  <img :src="url" loading="lazy" alt="Loco image not found" @error="onImageError" />
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
  },

  data() {
    return {
      store: useStore(),
    };
  },

  computed: {
    url() {
      return `https://rj.td2.info.pl/dist/img/thumbnails/${this.name.split(':')[0]}.png`;
    },

    stockType() {
      if (!this.store.rollingStockData) return 'unknown';

      return (
        Object.keys(this.store.rollingStockData.info).find((type) => {
          return this.store.rollingStockData?.info[type as keyof RollingStockInfo].find((v) => v[0] === this.name.split(':')[0]);
        }) || 'unknown'
      );
    },
  },

  methods: {
    onImageError(e: Event) {
      const imageEl = e.target as HTMLImageElement;
      imageEl.src = this.getImage(`icon-${this.stockType}.png`);
    },
  },
});
</script>

<style lang="scss" scoped>
.wrapper {
  display: flex;
  justify-content: center;
}

img {
  display: inline-block;
}
</style>
