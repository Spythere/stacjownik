<template>
  <div class="train-options">
    <div class="options_wrapper">
      <div class="train-sorter option">
        <div class="train-sorter_wrapper">
          <div class="train-sorter_selected" @click="toggleSorterOptions">
            <span>{{ currentSorterOption }}</span>
            <img :src="descIcon" alt="icon-select" />
          </div>

          <div class="train-sorter_options">
            <ul :class="{ open: sorterOptionsOpen }">
              <li
                v-for="(option, i) in sorterOptions"
                :key="i"
                @click="() => chooseOption(option)"
              >
                <input type="radio" name="sort" :id="option.id" />
                <label :for="option.id">{{ option.content }}</label>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div class="train-search_train option">
        <div class="search-box">
          <input
            class="search-input"
            placeholder="Szukaj nr pociągu..."
            v-model="searchedTrain"
          />
          <img
            class="search-exit"
            :src="exitIcon"
            alt="exit-icon"
            @click="() => (searchedTrain = '')"
          />
        </div>
      </div>

      <div class="train-search_driver option">
        <div class="search-box">
          <input
            class="search-input"
            placeholder="Szukaj maszynisty..."
            v-model="searchedDriver"
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
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch, Prop } from "vue-property-decorator";

@Component
export default class TrainOptions extends Vue {
  ascIcon = require("@/assets/icon-arrow-asc.svg");
  descIcon = require("@/assets/icon-arrow-desc.svg");
  exitIcon = require("@/assets/icon-exit.svg");

  clickEventListener!: EventListener;

  sorterOptionsOpen = false;
  currentSorterOption = "kilometraż";

  searchedTrain = "";
  searchedDriver = "";

  // Passed as component parameters
  @Prop() readonly queryTrain!: string;
  @Prop() readonly focusedTrain!: string;

  sorterOptions: { id: string; content: string }[] = [
    {
      id: "mass",
      content: "masa",
    },
    {
      id: "speed",
      content: "prędkość",
    },
    {
      id: "length",
      content: "długość",
    },
    {
      id: "distance",
      content: "kilometraż",
    },
    {
      id: "timetable",
      content: "numer pociągu",
    },
  ];

  toggleSorterOptions() {
    this.sorterOptionsOpen = !this.sorterOptionsOpen;
  }

  closeSorterOptions() {
    this.sorterOptionsOpen = false;
  }

  chooseOption(option: { id: string; content: string }) {
    this.$emit("changeSorter", { id: option.id, dir: -1 });
    this.currentSorterOption = option.content;

    this.closeSorterOptions();
  }

  @Watch("searchedTrain")
  onSearchedTrainChanged(train: string) {
    this.$emit("changeSearchedTrain", train);
  }

  @Watch("searchedDriver")
  onSearchedDriverChanged(driver: string) {
    this.$emit("changeSearchedDriver", driver);
  }

  @Watch("queryTrain")
  onQueryTrainChanged(train: string) {
    if (train && train != "") {
      this.searchedTrain = train;
      this.searchedDriver = "";
    }
  }

  @Watch("focusedTrain")
  onFocusedTrainChanged(train: string) {
    this.searchedTrain = train;
    this.searchedDriver = "";
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
  flex-wrap: wrap;

  margin-bottom: 0.5em;
}

.option {
  background: #333;
  border-radius: 0.5em 0.5em 0 0;

  margin-right: 0.5rem;

  @include smallScreen() {
    width: 100%;
    margin: 0.5rem 0;

    font-size: 1.15em;
  }
}

.train-sorter {
  user-select: none;
  -moz-user-select: none;
  -webkit-user-select: none;

  &_options {
    position: relative;

    ul {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;

      transition: all 150ms ease-in;

      z-index: 9;
      overflow: hidden;

      max-height: 0;

      &.open {
        max-height: 250px;
        opacity: 1;
      }

      li {
        display: flex;
        transition: background 150ms ease-in;

        background-color: rgba(#222, 0.95);

        &:last-child {
          border-radius: 0 0 0.5em 0.5em;
        }

        &:hover {
          background-color: rgba(#868686, 0.85);
        }

        input {
          display: none;
        }

        label {
          padding: 0.5rem 1rem;
          width: 100%;
          cursor: pointer;
        }
      }
    }
  }

  &_selected {
    display: flex;
    justify-content: space-between;
    align-items: center;

    padding: 0.5rem 0.5rem;
    min-width: 200px;

    cursor: pointer;

    span {
      margin-right: 1em;
    }

    img {
      max-width: 2em;
    }
  }
}

.search {
  &-box {
    position: relative;

    background: #333;
    border-radius: 0.5em;
    min-width: 200px;
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