<template>
  <div class="options">
    <div class="option-buttons">
      <button class="button" :class="{'open': filtersOpen}" @click="filtersOpen = !filtersOpen">
        <img :src="require('@/assets/icon-filter2.svg')" alt="icon-filter" /> FILTRY
      </button>
    </div>

    <keep-alive>
      <ListFilter v-if="filtersOpen" :exit="() => filtersOpen = !filtersOpen" />
    </keep-alive>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import ListFilter from "@/components/utils/ListFilter.vue";

export default Vue.extend({
  components: {
    ListFilter
  },
  data: () => ({
    filtersOpen: false,
    sortingsOpen: false
  })
});
</script>


<style lang="scss" scoped>
@import "../../styles/variables.scss";
@import "../../styles/responsive.scss";

.options {
  font-size: calc(0.6rem + 0.9vw);
}

.button {
  font-size: 0.75em;

  img {
    width: 1.3em;
  }
}
</style>