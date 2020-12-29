<template>
  <div class="select-box">
    <div class="title">Sortuj według</div>

    <div class="option-selected" @click="toggleOptionList">
      <span>{{ selectedOption }}</span>
      <img :src="require('@/assets/icon-select.svg')" alt="icon-select" />
    </div>

    <div class="option-container">
      <ul class="option-list" :class="{ open: listOpen }">
        <li
          class="option-item"
          v-for="(option, i) in sortOptionList"
          :key="i"
          @click="() => chooseOption(option)"
        >
          <input type="option-radio" name="sort" :id="option.id" />
          <label :for="option.id">{{ option.content }}</label>
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";

@Component
export default class SelectBox extends Vue {
  @Prop() title!: string;
  @Prop() optionList!: string[];

  selectedOption: string = "";
}
</script>

<style lang="scss" scoped>
.option {
  &-container {
    position: relative;

    input {
      display: none;
    }

    label {
      padding: 0.5rem 1rem;
      width: 100%;
      cursor: pointer;
    }
  }

  &-item {
    display: flex;

    &:hover {
      background-color: rgba(#868686, 0.85);
    }

    transition: background 150ms ease-in;
  }

  &-selected,
  &-list {
    background: #333;
    border-radius: 0.5em;
  }

  &-selected {
    display: flex;
    justify-content: space-between;
    align-items: center;

    padding: 0.5rem 1rem;
    min-width: 150px;
    cursor: pointer;

    span {
      margin-right: 2rem;
    }

    img {
      max-width: 0.75em;
    }
  }

  &-list {
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
}
</style>