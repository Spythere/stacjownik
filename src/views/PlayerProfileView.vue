<template>
  <div class="profile-view">
    <div class="profile-wrapper" v-if="playerInfo && playerDataStatus == Status.Data.Loaded">
      <ProfileSummary :playerInfo="playerInfo" :playerName="playerName" />

      <div class="profile-side">
        <ProfileRecentStats :playerInfo="playerInfo" />
        <ProfileHistoryList :playerName="playerName" />
      </div>
    </div>

    <Loading v-else-if="playerDataStatus == Status.Data.Loading" />

    <div class="no-data-found" v-else>
      <div>
        <h3>{{ t('profile.no-player-found') }}</h3>
        <router-link to="/" class="btn btn--text"> {{ t('profile.return-to-main') }}</router-link>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import axios from 'axios';

import { computed, onActivated, onMounted, ref, watch } from 'vue';
import { onBeforeRouteUpdate, useRoute } from 'vue-router';
import { useApiStore } from '../store/apiStore';
import { API, Td2API } from '../typings/api';
import { useI18n } from 'vue-i18n';
import { Status } from '../typings/common';

import Loading from '../components/Global/Loading.vue';
import ProfileSummary from '../components/PlayerProfileView/ProfileSummary.vue';
import ProfileRecentStats from '../components/PlayerProfileView/ProfileRecentStats.vue';
import ProfileHistoryList from '../components/PlayerProfileView/ProfileHistoryList.vue';

const { t } = useI18n();

const apiStore = useApiStore();
const route = useRoute();

const playerId = ref(-1);
const playerName = ref('');

const playerInfo = ref<API.PlayerInfo.Data | null>(null);
const playerDataStatus = ref(Status.Data.Initialized);

onActivated(() => {
  fetchPlayerData();
});

async function fetchPlayerData() {
  const queryPlayerId = Number(route.query.playerId) || -1;

  if (!apiStore.client || !queryPlayerId) return;

  if (queryPlayerId != playerId.value) {
    playerDataStatus.value = Status.Data.Loading;
  }

  playerId.value = queryPlayerId;

  try {
    const response = await apiStore.client.get<API.PlayerInfo.Data>('api/getPlayerInfo', {
      params: {
        playerId: queryPlayerId
      }
    });

    playerName.value =
      response.data.driverStats.driverName || response.data.dispatcherStats.dispatcherName || '';

    playerInfo.value = response.data || null;
    playerDataStatus.value = Status.Data.Loaded;
  } catch (error) {
    console.error(error);
    playerDataStatus.value = Status.Data.Error;
  }
}
</script>

<style lang="scss" scoped>
@use '../styles/responsive';

.profile-view {
  display: flex;
  justify-content: center;

  height: 100vh;
  min-height: 500px;
  max-height: 2000px;
}

.no-data-found {
  text-align: center;

  max-width: var(--max-container-width);
  width: 100%;
  background-color: var(--clr-tile);
  padding: 1em;
  margin: 1em;

  a {
    display: inline-block;
    text-decoration: underline;
    margin-top: 0.5em;
  }
}

.profile-wrapper {
  display: grid;
  grid-template-columns: 500px 1fr;

  gap: 1em;
  position: relative;

  max-width: var(--max-container-width);
  width: 100%;

  padding: 1rem 0;
  text-align: center;
}

.profile-side {
  display: grid;
  grid-template-rows: auto 1fr;
  gap: 0.5em;
  overflow: auto;
  background-color: var(--clr-tile);
  border-radius: 0.5em;
}

@include responsive.midScreen {
  .profile-view {
    height: auto;
  }

  .profile-wrapper {
    grid-template-columns: 1fr;
    max-width: 1000px;
  }
}
</style>
