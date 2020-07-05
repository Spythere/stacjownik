<template>
  <div class="options">
    <div class="option-buttons">
      <button class="button-filters" @click="filtersOpen = !filtersOpen">FILTRY</button>
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
.options {
  font-size: calc(0.7rem + 0.5vw);
}

button.button-filters {
  color: #e0e0e0;
  font-size: 0.9em;

  border: 2px solid #e0e0e0;
  background: rgba(#e0e0e0, 0.2);
  outline: none;

  border-radius: 0.5em;

  padding: 0.5em;
  margin: 0.4em 0;

  cursor: pointer;

  transition: background 0.4s, color 0.4s;

  &:hover {
    color: #ffffff;
    background: rgba(#e0e0e0, 0.4);
  }

  img {
    width: 45px;
  }
}
</style>