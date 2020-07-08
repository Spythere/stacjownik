<template>
  <div class="options">
    <div class="option-buttons">
      <button
        class="button-filters"
        :class="{'open': filtersOpen}"
        @click="filtersOpen = !filtersOpen"
      >
        <img :src="require('@/assets/icon-filter2.svg')" alt="icon-filter" /> FILTRY
      </button>
    </div>

    <transition name="slide">
      <keep-alive>
        <ListFilter v-if="filtersOpen" :exit="() => filtersOpen = !filtersOpen" />
      </keep-alive>
    </transition>
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

.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter,
.slide-leave-to {
  transform: translate(-40%, -50%);
  opacity: 0;
}

.options {
  font-size: calc(0.6rem + 0.9vw);

  // display: flex;
}

button {
  font-size: 0.8em;
  padding: 0.3em;

  img {
    width: 1.3em;
    margin: 0.2em;
  }

  &.open {
    color: $accentCol;
    border: none;
    font-weight: bold;
  }
}
</style>