<template>
  <div class="select-box">
    <div class="select-box_content">
      <button class="selected" @click="toggleBox">
        {{ selectedItemComp ? selectedItemComp.value : "" }}
      </button>

      <div class="options" v-if="boxVisible">
        <div class="option" v-for="item in itemList" :key="item.id">
          <label :for="item.id">
            <input
              type="button"
              :id="item.id"
              name="select-box"
              @click="selectOption(item)"
            />

            <span :style="selectedItemComp.id == item.id ? 'color: gold;' : ''">
              {{ item.value }}
            </span>
          </label>
        </div>
      </div>
    </div>

    <div class="arrow">
      <img :src="boxVisible ? ascIcon : descIcon" alt="arrow-icon" />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Emit } from "vue-property-decorator";

@Component
export default class SelectBox extends Vue {
  @Prop({ required: true }) title!: string;
  @Prop({ required: true }) itemList!: { id: string | number; value: string }[];
  @Prop({ default: 0 }) defaultItemIndex!: number;
  @Prop() bgColor!: string;

  boxVisible = false;

  test() {
    console.log("test");
  }

  @Emit("selected")
  onItemSelected() {
    return this.selectedItem;
  }

  ascIcon = require("@/assets/icon-arrow-asc.svg");
  descIcon = require("@/assets/icon-arrow-desc.svg");

  selectedItem: { id: string | number; value: string } | null = null;

  get selectedItemComp() {
    if (!this.selectedItem) return this.itemList[this.defaultItemIndex];

    return this.itemList.find((item) => item.id === this.selectedItem?.id);
  }

  toggleBox() {
    this.boxVisible = !this.boxVisible;
  }

  selectOption(item: { id: string | number; value: string }) {
    this.selectedItem = item;
    this.boxVisible = false;
    this.onItemSelected();
  }
}
</script>

<style lang="scss" scoped>
@import "../../styles/variables.scss";

.select-box {
  position: relative;
}

.arrow {
  position: absolute;
  top: 50%;
  right: 0.5em;

  img {
    vertical-align: middle;
    width: 1.35em;
  }

  transform: translateY(-50%);

  pointer-events: none;
}

.select-box_content {
  position: relative;
  margin: 0 auto;

  min-width: 10em;

  background: #333;

  text-align: center;
}

.options {
  position: absolute;
  top: 100%;
  left: 0;

  z-index: 10;

  width: 100%;

  margin-top: 0.25em;
}

button.selected {
  background: #333;
  color: white;

  font-size: 1em;

  padding: 0.35em 0.5em;
  padding-right: 2em;

  width: 100%;
  cursor: pointer;

  border: none;
  outline: none;

  text-align: left;

  &:focus {
    background: #555;
  }
}

input {
  position: absolute;
  top: 0;
  left: 0;

  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  border: none;

  &:focus + span {
    color: $accentCol;
    font-weight: bold;
  }
}

label {
  position: relative;

  display: inline-block;
  background: #333;

  &:hover,
  &:focus {
    background: #555;
  }

  padding: 0.25em 0;

  width: 100%;

  cursor: pointer;
}
</style>