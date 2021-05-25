<template>
  <div class="select-box">
    <div class="select-box_content">
      <label>
        <select
          v-model="selectedItem"
          :style="bgColor ? 'background-color:' + bgColor : ''"
        >
          <option value disabled selected hidden>
            {{ title }}
          </option>
          <option v-for="item in itemList" :key="item.id" :value="item.id">
            {{ item.value }}
          </option>
        </select>
        <span class="arrows"></span>
      </label>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch, Emit } from "vue-property-decorator";

@Component
export default class SelectBox extends Vue {
  @Prop({ required: true }) title!: string;
  @Prop({ required: true }) itemList!: { id: string | number; value: string }[];
  @Prop() bgColor!: string;

  @Emit("selected")
  onItemSelected() {
    return this.selectedItem;
  }

  ascIcon = require("@/assets/icon-arrow-asc.svg");
  descIcon = require("@/assets/icon-arrow-desc.svg");

  selectedItem: string = "";

  @Watch("selectedItem")
  watchSelectedItem(item) {
    this.onItemSelected();
  }
}
</script>

<style lang="scss" scoped>
@import "../../styles/variables.scss";

.select-box {
  &_content {
    // display: inline-block;

    position: relative;
    margin: 0.5em auto;
  }

  select {
    border: none;
    outline: none;

    background: #333;
    padding: 0.35em 0.5em;
    padding-right: 2em;
    border-radius: 0.5em;

    font-size: 1em;
    color: white;

    appearance: none;
    -moz-appearance: none;
    -webkit-appearance: none;

    cursor: pointer;

    transition: all 0.3s;

    &:focus {
      // border: 1px solid red;

      background: #777;

      option {
        background: #333;
      }
    }
  }

  label {
    position: relative;
  }

  .arrows {
    $arrowCol: #d8d8d8;
    $arrowWidth: 0.35em;

    position: absolute;
    top: 20%;
    // right: 0.25em;

    pointer-events: none;

    &::before,
    &::after {
      content: "";
      width: 0;
      height: 0;

      position: absolute;
      right: 0.5em;

      border-left: $arrowWidth solid transparent;
      border-right: $arrowWidth solid transparent;
    }

    &::before {
      border-top: $arrowWidth solid $arrowCol;

      transform: translateY(150%);
    }

    &::after {
      border-bottom: $arrowWidth solid $arrowCol;
    }
  }
}
</style>