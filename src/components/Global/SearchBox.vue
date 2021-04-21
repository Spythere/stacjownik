<template>
  <div class="search-box">
    <input v-model="searchedItem" :placeholder="title" />

    <img
      class="search-exit"
      :src="exitIcon"
      alt="exit-icon"
      @click="() => (searchedItem = '')"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Model } from "vue-property-decorator";

@Component
export default class SearchBox extends Vue {
  @Prop({ required: true }) title!: string;
  @Model("changed") readonly searchedItem!: string;

  //   @Emit("changed")
  //   onItemChanged() {
  //     return this.searchedItem;
  //   }

  exitIcon = require("@/assets/icon-exit.svg");

  //   searchedItem: string = "";

  //   @Watch("searchedItem")
  //   watchSelectedItem(item) {
  //     this.onItemChanged();
  //   }
}
</script>

<style lang="scss" scoped>
.search {
  &-box {
    position: relative;

    background: #333;
    border-radius: 0.5em;
    min-width: 200px;
  }

  &-exit {
    position: absolute;
    cursor: pointer;

    top: 50%;
    right: 10px;
    transform: translateY(-50%);

    width: 1em;
  }
}

input {
  border: none;

  min-width: 85%;
  padding: 0.35em 0.5em;
}
</style>