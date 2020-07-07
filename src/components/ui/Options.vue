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
        <ListFilter v-if="filtersOpen" />
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
  transform: translateX(10px);
  opacity: 0;
}

.options {
  position: relative;
  font-size: calc(0.6rem + 0.9vw);

  display: flex;
}

button {
  color: #e0e0e0;
  font-size: 0.8em;

  display: flex;
  align-items: center;

  background: #333;
  border: none;

  outline: none;
  padding: 0.2em;

  cursor: pointer;

  transition: all 0.3s;

  img {
    width: 1.3em;
    margin: 0.2em;
  }

  &.open {
    color: $accentCol;
    border: none;
    font-weight: bold;
  }

  &:hover,
  &:focus {
    background: rgba(#e0e0e0, 0.1);
  }
}
</style>