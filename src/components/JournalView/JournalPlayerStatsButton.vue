<template>
  <router-link
    class="a-button btn--filled btn--image"
    :disabled="playerId == -1"
    :data-disabled="playerId == -1"
    :to="`/player/${playerId}`"
  >
    <img src="/images/icon-user.svg" alt="player icon" />
    {{ $t('player-profile.button') }}
  </router-link>
</template>

<script setup lang="ts">
defineProps({
  playerId: {
    type: Number,
    required: true
  }
});
</script>
