<template>
  <div class="options">
    <div class="option-buttons">
      <button
        class="button-filters"
        :class="{'open': filtersOpen}"
        @click="filtersOpen = !filtersOpen"
      >FILTRY</button>
    </div>

    <div class="option-wrapper">
      <keep-alive>
        <ListFilter v-if="filtersOpen" />
      </keep-alive>
    </div>
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
  font-size: calc(0.7rem + 0.5vw);

  display: flex;
  padding: 1rem;

  @include smallScreen() {
    flex-direction: column;
    padding: 1rem 0;
  }
}

button {
  color: #e0e0e0;
  font-size: 1em;

  background: #333;
  border: none;

  outline: none;

  padding: 0.5em;

  cursor: pointer;

  border-left: 3px solid white;
  transition: all 0.3s;

  @include smallScreen {
    border-left: none;
    border-top: 2px solid white;
  }

  &.open {
    color: $accentCol;
    border-radius: 1em 0 0 1em;
    border: none;

    @include smallScreen() {
      border-radius: 1em 1em 0 0;
    }

    font-weight: bold;
  }

  &:hover {
    color: #ffffff;
    background: rgba(#e0e0e0, 0.1);
  }

  img {
    width: 45px;
  }
}
</style>