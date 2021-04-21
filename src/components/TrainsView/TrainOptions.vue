<template>
  <div class="train-options">
    <div class="options_wrapper">
      <select-box
        :title="$t('trains.option-distance')"
        :itemList="translatedSorterOptions"
        @selected="changeSorter"
      />

      <div class="search-box">
        <input
          class="search-input"
          v-model="searchedTrain"
          :placeholder="$t('trains.search-no')"
        />

        <img
          class="search-exit"
          :src="exitIcon"
          alt="exit-icon"
          @click="() => (searchedTrain = '')"
        />
      </div>

      <div class="search-box">
        <input
          class="search-input"
          v-model="searchedDriver"
          :placeholder="$t('trains.search-driver')"
        />

        <img
          class="search-exit"
          :src="exitIcon"
          alt="exit-icon"
          @click="() => (searchedDriver = '')"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch, Prop, Emit } from "vue-property-decorator";
import SelectBox from "../Global/SelectBox.vue";

@Component({ components: { SelectBox } })
export default class TrainOptions extends Vue {
  // Passed as component parameters
  @Prop() readonly queryTrain!: string;
  @Prop() readonly focusedTrain!: string;

  exitIcon = require("@/assets/icon-exit.svg");

  searchedTrain = "";
  searchedDriver = "";

  sorterOptions: { id: string; value: string }[] = [
    {
      id: "mass",
      value: "masa",
    },
    {
      id: "speed",
      value: "prędkość",
    },
    {
      id: "length",
      value: "długość",
    },
    {
      id: "distance",
      value: "kilometraż",
    },
    {
      id: "timetable",
      value: "numer pociągu",
    },
  ];

  get translatedSorterOptions() {
    return this.sorterOptions.map((option) => ({
      id: option.id,
      value: this.$t(`trains.option-${option.id}`),
    }));
  }

  mounted() {
    if (this.queryTrain) {
      this.searchedTrain = this.queryTrain;
      this.searchedDriver = "";
    }
  }

  /* Emitters to TrainsView managing variables */

  @Emit("changeSearchedTrain")
  chooseTrain(train: string) {
    return train;
  }

  @Emit("changeSearchedDriver")
  chooseDriver(driverName: string) {
    return driverName;
  }

  @Emit()
  changeSorter(optionID: string) {
    return { id: optionID, dir: -1 };
  }

  /* Watchers for search boxes */

  @Watch("searchedTrain")
  watchSearchedTrain(train: string) {
    this.chooseTrain(train);
  }

  @Watch("searchedDriver")
  watchSearchedDriver(driver: string) {
    this.chooseDriver(driver);
  }

  /* Watcher for train no passed in link params */

  @Watch("queryTrain")
  onQueryTrainChanged(train: string | undefined) {
    if (!train) return;
    if (train == "") return;
    console.log("query train changed", train);

    // this.chooseTrain(train);
  }
}
</script>

<style lang="scss" scoped>
@import "../../styles/responsive";

.train-options {
  @include smallScreen() {
    width: 100%;
  }
}

.options_wrapper {
  display: flex;
  align-items: center;
  flex-wrap: wrap;

  margin-bottom: 0.5em;

  @include smallScreen() {
    justify-content: center;
    flex-direction: column;
  }
}

.search {
  &-box {
    position: relative;

    background: #333;
    border-radius: 0.5em;
    min-width: 200px;

    margin: 0.5em 0 0.5em 0.5em;

    @include smallScreen() {
      width: 85%;
    }
  }

  &-input {
    border: none;

    min-width: 85%;
    padding: 0.35em 0.5em;
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