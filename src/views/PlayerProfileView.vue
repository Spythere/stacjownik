<template>
  <div>
    <h2>Profil użytkownika {{ playerName }}</h2>
  </div>
</template>

<script setup lang="ts">
import { computed, onActivated, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useApiStore } from '../store/apiStore';
import { API } from '../typings/api';

const apiStore = useApiStore();

// Variables
const route = useRoute();
const playerId = computed(() => route.params.id);

const playerName = computed(() => {
  if (!playerInfo.value) return null;

  return (
    playerInfo.value.driverTimetables[0]?.driverName ??
    playerInfo.value.dispatcherDuties[0]?.dispatcherName ??
    null
  );
});
const playerInfo = ref<API.PlayerInfo.Response | null>(null);

// Lifecycle hooks
onActivated(() => {
  fetchPlayerInfoData();
});

// Methods
async function fetchPlayerInfoData() {
  if (!apiStore.client) return;

  const data = (
    await apiStore.client.get<API.PlayerInfo.Response>('/api/getPlayerInfo', {
      params: { playerId: playerId.value }
    })
  ).data;

  playerInfo.value = data;
}
</script>

<style lang="scss" scoped></style>
