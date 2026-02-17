<template>
  <div class="profile-view">
    <div class="profile-wrapper" v-if="playerInfo && playerDataStatus == Status.Data.Loaded">
      <ProfileSummary
        :playerInfo="playerInfo"
        :playerTD2Info="playerTD2Info"
        :playerName="playerName"
      />

      <div class="profile-side">
        <ProfileRecentStats :playerInfo="playerInfo" />
        <ProfileHistoryList  :playerName="playerName" />
      </div>
    </div>

    <div v-else-if="playerDataStatus == Status.Data.Loading">
      <Loading />
    </div>

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

import { computed, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
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

const playerName = ref('');

const playerInfo = ref<API.PlayerInfo.Data | null>(null);
const playerTD2Info = ref<Td2API.UsersInfoByName.UserInfo | null>(null);
const playerDataStatus = ref(Status.Data.Initialized);

watch(
  computed(() => route.query.playerId),
  () => {
    fetchAllData();
  }
);

onMounted(() => {
  fetchAllData();
});

async function fetchAllData() {
  const playerId = route.query.playerId?.toString();

  playerTD2Info.value = null;
  playerDataStatus.value = Status.Data.Loading;

  if (!playerId) {
    playerDataStatus.value = Status.Data.Loaded;
    return;
  }

  const playerInfoResponse = await fetchPlayerInfoData(playerId);

  if (!playerInfoResponse) {
    playerDataStatus.value = Status.Data.Loaded;
    return;
  }

  playerName.value =
    playerInfoResponse.driverStats.driverName ||
    playerInfoResponse.dispatcherStats.dispatcherName ||
    '';

  if (!playerName.value) {
    playerDataStatus.value = Status.Data.Loaded;
    return;
  }

  const playerTd2InfoResponse = await fetchPlayerTD2Info(playerName.value);

  playerInfo.value = playerInfoResponse;
  playerTD2Info.value = playerTd2InfoResponse;
  // playerJournal.value = playerJournalResponse;

  playerDataStatus.value = Status.Data.Loaded;
}

async function fetchPlayerInfoData(playerId: string) {
  if (!apiStore.client || !playerId) return null;

  try {
    const response = await apiStore.client.get<API.PlayerInfo.Data>('api/getPlayerInfo', {
      params: {
        playerId: playerId
      }
    });

    return response.data;
  } catch (error) {
    console.error(error);
  }

  return null;
}

async function fetchPlayerTD2Info(playerName: string) {
  if (!apiStore.client || !playerName) return null;

  try {
    const response = await axios.get<Td2API.UsersInfoByName.Response>('https://api.td2.info.pl', {
      params: {
        method: 'getUsersInfoByName',
        name: playerName
      }
    });

    if (response.data.success && response.data.message.length == 1) {
      return response.data.message[0];
    }
  } catch (error) {
    console.error(error);
  }

  return null;
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
