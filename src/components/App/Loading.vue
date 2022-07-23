<template>
  <div class="loading">{{message}}</div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  props: ["message"],
});
</script>

<style lang="scss" scoped>
.loading {
  display: flex;
  justify-content: center;
  align-items: center;

  min-height: 100%;

  position: absolute;
  top: 50%;
  left: 50%;

  transform: translate(-50%, -50%);

  font-size: calc(0.75rem + 1vw);

  color: #fdc62f;
}
</style>