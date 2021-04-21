<template>
  <button class="action-btn">
    <slot></slot>
  </button>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

@Component
export default class ActionButton extends Vue {}
</script>

<style lang="scss" scoped>
@import "../../styles/variables";
@import "../../styles/responsive";

.action-btn {
  display: flex;
  align-items: center;

  background: #333;
  border: none;

  color: #bdbdbd;

  font-size: 1em;
  font-weight: 500;

  outline: none;
  padding: 0.35em 0.65em;
  cursor: pointer;

  transition: all 0.3s;

  &.outlined {
    border: 1px solid white;
  }

  img.button_icon {
    width: 1.25em;
    vertical-align: middle;

    margin-right: 0.2em;
  }

  p {
    font-size: 1em;
    overflow: hidden;

    transition: max-width 0.35s ease-in-out;
  }

  &.open {
    color: $accentCol;
    border: none;
  }

  &:hover {
    color: $accentCol;

    background: #5c5c5c;
  }
}
</style>