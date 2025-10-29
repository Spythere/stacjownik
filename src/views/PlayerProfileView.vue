<template>
  <div>
    <h2>Profil użytkownika {{ route.params.id }}</h2>
  </div>
</template>

<script setup lang="ts">
import { computed, onActivated, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useApiStore } from '../store/apiStore';

const apiStore = useApiStore();

// Variables
const route = useRoute();
const playerId = computed(() => route.params.id);

const playerInfo = ref({});

// Lifecycle hooks
onActivated(() => {
  fetchPlayerInfoData();
});

// Methods
async function fetchPlayerInfoData() {
  if (!apiStore.client) return;

  const data = (
    await apiStore.client.get('/api/getPlayerInfo', { params: { playerId: playerId.value } })
  ).data;

  playerInfo.value = data;
}
</script>

<style lang="scss" scoped></style>
