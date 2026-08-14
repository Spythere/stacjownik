<template>
  <div class="header-brand">
    <router-link to="/" v-if="!isChristmas">
      <img
        src="/images/stacjownik-header-logo.svg"
        alt="Stacjownik logo (christmas)"
        :width="imageWidth"
      />
    </router-link>

    <router-link to="/" v-else>
      <img
        src="/images/stacjownik-header-logo-christmas.svg"
        alt="Stacjownik logo"
        :width="imageWidth"
      />
    </router-link>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

defineProps({
  imageWidth: {
    type: String
  }
});

const isChristmas = computed(() => {
  const date = new Date();

  return date.getUTCMonth() == 11 && date.getUTCDate() >= 6 && date.getUTCDate() <= 31;
});
</script>

<style lang="scss" scoped>
.header-brand {
  display: flex;
  align-items: center;
}

a {
  padding: 0;
  margin: 0;
}

img {
  vertical-align: middle;
}
</style>
