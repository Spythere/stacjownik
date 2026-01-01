<template>
  <div class="app-domain-info">
    <div>
      <img src="/images/icon-loading.svg" alt="loading" height="200" />
      <h1><span class="text--primary">Aplikacja</span> została przeniesiona na nową domenę!</h1>
      <h1><span class="text--primary">This app</span> has been moved to a new domain!</h1>

      <div style="margin-top: 1em">
        <a :href="newLink">Nowy link dla obecnego adresu / New link to the current address</a>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';

const newLink = computed(() => {
  return 'https://stacjownik-td2.spythere.eu' + location.pathname + location.search;
});
</script>

<style lang="scss" scoped>
.app-domain-info {
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  min-height: 100vh;
  color: white;
}

a {
  font-size: 1.35em;
  text-decoration: underline;
}
</style>
