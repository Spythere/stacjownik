<template>
  <button class="action-btn btn--filled">
    <div class="button_content">
      <slot></slot>
    </div>
  </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({});
</script>

<style lang="scss">
@use '../../styles/responsive';

.button_content {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
