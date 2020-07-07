<template>
  <div class="loading">Pobieranie danych o sceneriach...</div>
</template>

<script lang="ts">
import Vue from "vue";
export default Vue.extend({});
</script>

<style lang="scss" scoped>
.loading {
  display: flex;
  justify-content: center;
  align-items: center;

  min-height: 100%;

  font-size: calc(0.75rem + 1vw);

  color: #fdc62f;
}
</style>