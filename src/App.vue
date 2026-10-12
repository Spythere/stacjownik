<template>
  <div class="app_container"></div>
</template>

<script lang="ts" setup></script>

<style lang="scss">
#app {
  color: white;
  overflow-x: hidden;
  font-size: 1em;
}

// CONTAINER
.app_container {
  display: grid;
  grid-template-rows: auto 1fr auto;
  grid-template-columns: 100%;

  min-height: 100vh;
  overflow: hidden;
  position: relative;
}

.app_main {
  padding: 0 0.5em;
}
</style>
