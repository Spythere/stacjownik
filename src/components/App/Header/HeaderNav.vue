<template>
  <div class="header-nav">
    <router-link class="route-link" active-class="route-link-active" to="/" exact>
      {{ $t('app.sceneries') }}
    </router-link>
    &bull;
    <router-link class="route-link" active-class="route-link-active" to="/trains">{{
      $t('app.trains')
    }}</router-link>
    &bull;
    <router-link
      class="route-link"
      active-class="route-link-active"
      :data-active="$route.path.startsWith('/journal')"
      to="/journal"
    >
      {{ $t('app.journal') }}
    </router-link>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.header-nav {
  display: flex;
  justify-content: center;

  border-radius: 0.7em;

  font-size: 1.25em;
}
</style>
