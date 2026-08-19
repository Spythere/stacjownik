<template>
  <header class="app_header">
    <div class="header-container">
      <HeaderBrand image-width="100%" />
      <HeaderStatusIndicator />

      <span class="header-info">
        <HeaderClock />
        <HeaderActiveCounters />

        <div class="region-wrapper">
          <HeaderRegionDropdown />
        </div>
      </span>

      <HeaderNav />
    </div>
  </header>
</template>

<script lang="ts" setup>
import HeaderClock from './HeaderClock.vue';
import HeaderRegionDropdown from './HeaderRegionDropdown.vue';
import HeaderBrand from './HeaderBrand.vue';
import HeaderActiveCounters from './HeaderActiveCounters.vue';
import HeaderNav from './HeaderNav.vue';
import HeaderStatusIndicator from './HeaderStatusIndicator.vue';
</script>

<style lang="scss" scoped>
@use '@/styles/responsive';

.app_header {
  display: flex;
  justify-content: center;

  position: relative;
  background-color: #2c2c2c;
}

.header-container {
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
  // display: none;

  position: relative;
  max-width: 20em;
  padding: 0.5em 0;
}

.header-info {
  display: grid;
  grid-template-columns: 4em 1fr auto;
  gap: 0.5em;
  font-size: 1.15em;
  margin-bottom: 0.5em;
  width: 100%;
}

.region-wrapper {
  justify-self: end;
}
</style>
