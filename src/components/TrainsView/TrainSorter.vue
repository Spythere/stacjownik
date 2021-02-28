<template>
  <div class="train-sorter">
    <div class="sorter-wrapper">
      <div class="sorter-box">
        <div class="selected" @click="toggleOptionList">
          <span>{{ sorterName }}</span>
          <img :src="require('@/assets/icon-select.svg')" alt="icon-select" />
        </div>

        <div class="options-container">
          <ul class="options-list" :class="{ open: listOpen }">
            <li
              class="option"
              v-for="(option, i) in sortOptionList"
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
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";

const ascSVG = require("@/assets/icon-arrow-asc.svg");
const descSVG = require("@/assets/icon-arrow-desc.svg");

@Component
export default class TrainSorter extends Vue {
  ascSVG = ascSVG;
  descSVG = descSVG;

  @Prop() trainList!: [];

  listOpen: boolean = false;
  sorterName: string = "numer pociągu";

  sortOptionList: { id: string; content: string }[] = [
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

  toggleOptionList() {
    this.listOpen = !this.listOpen;
  }

  closeOptionList() {
    this.listOpen = false;
  }

  chooseOption(option: { id: string; content: string }) {
    this.$emit("changeSorter", { id: option.id, dir: -1 });
    this.sorterName = option.content;

    this.closeOptionList();
  }

  get compTrainList() {
    return this.trainList;
  }
}
</script>

<style lang="scss" scoped>
.sorter-wrapper {
  display: flex;

  user-select: none;
  -moz-user-select: none;
  -webkit-user-select: none;
}

.selected {
  display: flex;
  justify-content: space-between;
  align-items: center;

  span {
    margin-right: 2rem;
  }

  img {
    max-width: 0.75em;
  }
}

.selected,
.options-list {
  background: #333;
  border-radius: 0.5em;
}

.selected {
  padding: 0.5rem 1rem;
  min-width: 150px;
  cursor: pointer;
}

.options-container {
  position: relative;
}

.options-list {
  position: absolute;
  top: 0;
  left: 0;

  z-index: 10;

  width: 100%;
  background-color: rgba(#222, 0.95);
  overflow: hidden;

  max-height: 0;

  &.open {
    max-height: 250px;
    opacity: 1;
  }

  transition: all 150ms ease-in;
}

.option {
  display: flex;

  &:hover {
    background-color: rgba(#868686, 0.85);
  }

  transition: background 150ms ease-in;
}

input {
  display: none;
}

label {
  padding: 0.5rem 1rem;
  width: 100%;
  cursor: pointer;
}
</style>
