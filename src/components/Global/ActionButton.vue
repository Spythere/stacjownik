<template>
  <button class="action-btn">
    <div class="button_content">
      <slot></slot>
    </div>
  </button>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({});
</script>

<style lang="scss">
@import "../../styles/variables";
@import "../../styles/responsive";

.action-btn {
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

  img {
    width: 1.25em;
    vertical-align: middle;
    margin-right: 0.35em;
  }

  p {
    font-size: 1em;
    overflow: hidden;
  }

  &.open {
    color: $accentCol;
    border: none;
  }

  &:hover,
  &:focus {
    color: $accentCol;
    background: #5c5c5c;
  }
}

.button_content {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>