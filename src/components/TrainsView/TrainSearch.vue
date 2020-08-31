<template>
  <div class="train-search">
    <span class="search train">
      <div class="search-title title">Szukaj składu</div>
      <div class="search-box">
        <input class="search-input" v-model="searchedTrain" />
        <img class="search-exit" :src="exitIcon" alt="exit-icon" @click="() => searchedTrain = ''" />
      </div>
    </span>

    <span class="search driver">
      <div class="search-title title">Szukaj maszynisty</div>
      <div class="search-box">
        <input class="search-input" v-model="searchedDriver" />
        <img class="search-exit" :src="exitIcon" alt="exit-icon" @click="() => searchedDriver = ''" />
      </div>
    </span>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";

@Component
export default class extends Vue {
  exitIcon = require("@/assets/icon-exit.svg");
  searchedTrain = "";
  searchedDriver = "";

  @Watch("searchedTrain")
  onSearchedTrainChanged(val: string, oldVal: string) {
    this.$emit("changeSearchedTrain", val);
  }

  @Watch("searchedDriver")
  onSearchedDriverChanged(val: string, oldVal: string) {
    this.$emit("changeSearchedDriver", val);
  }
}
</script>

<style lang="scss" scoped>
@import "../../styles/responsive.scss";

.train-search {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;

  margin-bottom: 1rem;
}

.search {
  padding-right: 1rem;

  &-box {
    position: relative;

    background: #333;
    border-radius: 0.5em;
    min-width: 150px;
  }

  &-input {
    border: none;

    padding: 0.5rem 1rem;
    margin: 0;

    font-size: 1em;

    min-width: 85%;
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
</style>