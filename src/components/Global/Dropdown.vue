<template>
  <div class="dropdown">
    <div class="dropdown_wrapper">
      <div class="dropdown_selected" @click="toggleList">
        {{selectedItem}}
        <img :src="isListOpen ? arrowAsc : arrowDesc" alt="arrow" />
      </div>
      <ul class="dropdown_list" v-if="isListOpen">
        <li v-for="(item, i) in itemList" @click="selectItem(item)" :key="i">{{item}}</li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";

@Component
export default class Dropdown extends Vue {
  arrowDesc = require("@/assets/icon-arrow-desc.svg");
  arrowAsc = require("@/assets/icon-arrow-asc.svg");

  selectedItem: string = "---";
  isListOpen: boolean = false;

  @Prop() itemList!: string[];

  mounted() {
    // this.selectedItem = this.itemList[0];
  }

  toggleList() {
    this.isListOpen = !this.isListOpen;
  }

  selectItem(itemName: string) {
    this.selectedItem = itemName;
    this.isListOpen = false;

    this.$emit("itemSelected", this.selectedItem);
  }
}
</script>

<style lang="scss" scoped>
.dropdown {
  &_wrapper {
    font-size: 1.15em;
    min-width: 13em;

    position: relative;
  }

  &_selected {
    background-color: #333;
    padding: 0.2em 0.5em;

    cursor: pointer;

    display: flex;
    justify-content: space-between;
    align-items: center;

    img {
      width: 1.35em;
      vertical-align: middle;

      margin-left: 0.5em;
    }
  }

  &_list {
    position: absolute;
    width: 100%;

    max-height: 250px;
    overflow-y: scroll;
  }

  &_list > li {
    padding: 0.3em 0.5em;
    background-color: #666;

    font-size: 0.8em;

    cursor: pointer;

    &:hover {
      background-color: #555;
    }
  }
}
</style>