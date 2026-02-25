<template>
  <div class="profile-view">
    <div class="profile-wrapper" v-if="playerInfo && playerInfoStatus == Status.Data.Loaded">
      <ProfileSummary
        :playerInfo="playerInfo"
        :playerTD2Info="playerTD2Info"
        :playerName="playerName"
      />

      <div class="profile-side">
        <ProfileRecentStats :playerInfo="playerInfo" />
        <ProfileHistoryList
          :playerName="playerName"
          :playerJournal="playerJournal"
          :journalStatus="playerJournalStatus"
        />
      </div>
    </div>

    <Loading v-else-if="playerInfoStatus == Status.Data.Loading" />

    <div class="no-data-found" v-else>
      <div>
        <h3>{{ t('profile.no-player-found') }}</h3>
        <router-link to="/" class="btn btn--text"> {{ t('profile.return-to-main') }}</router-link>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onActivated, onDeactivated, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useApiStore } from '../store/apiStore';
import { API, Td2API } from '../typings/api';
import { useI18n } from 'vue-i18n';
import { Status } from '../typings/common';

import Loading from '../components/Global/Loading.vue';
import ProfileSummary from '../components/PlayerProfileView/ProfileSummary.vue';
import ProfileRecentStats from '../components/PlayerProfileView/ProfileRecentStats.vue';
import ProfileHistoryList from '../components/PlayerProfileView/ProfileHistoryList.vue';
import axios from 'axios';

const { t } = useI18n();

const apiStore = useApiStore();
const route = useRoute();

const playerId = ref(-1);
const playerName = ref('');

const playerInfo = ref<API.PlayerInfo.Data | undefined>(undefined);
const playerTD2Info = ref<Td2API.UsersInfoByName.UserInfo | undefined>(undefined);
const playerJournal = ref<API.PlayerJournal.Data | undefined>(undefined);

const playerInfoStatus = ref(Status.Data.Initialized);
const playerJournalStatus = ref(Status.Data.Initialized);

const intervalId = ref(-1);

onActivated(() => {
  fetchPlayerData();
  intervalId.value = setInterval(fetchPlayerData, 32000);
});

onDeactivated(() => {
  clearInterval(intervalId.value);
  intervalId.value = -1;
});

async function fetchPlayerInfo(playerId: number) {
  return apiStore.client!.get<API.PlayerInfo.Data>('api/getPlayerInfo', {
    params: {
      playerId
    }
  });
}

async function fetchPlayerJournal(playerId: number) {
  return apiStore.client!.get<API.PlayerJournal.Data>('api/getPlayerJournal', {
    params: {
      playerId,
      dateScope: '30d'
    }
  });
}

async function fetchPlayerTd2Info(playerName: string) {
  return axios.get<Td2API.UsersInfoByName.Response>('https://api.td2.info.pl', {
    params: {
      method: 'getUsersInfoByName',
      name: playerName
    }
  });
}

async function fetchPlayerData() {
  const queryPlayerId = Number(route.query.playerId) || -1;

  if (!apiStore.client || !queryPlayerId) return;

  if (queryPlayerId != playerId.value) {
    playerInfoStatus.value = Status.Data.Loading;
    playerJournalStatus.value = Status.Data.Loading;

    playerInfo.value = undefined;
    playerJournal.value = undefined;
  }

  playerId.value = queryPlayerId;

  try {
    const playerInfoResp = await fetchPlayerInfo(playerId.value);

    playerName.value =
      playerInfoResp.data.driverStats.driverName ||
      playerInfoResp.data.dispatcherStats.dispatcherName ||
      '';

    playerInfo.value = playerInfoResp.data;
    playerInfoStatus.value = Status.Data.Loaded;

    if (playerName.value) {
      const playerTD2InfoResp = await fetchPlayerTd2Info(playerName.value);

      if (playerTD2InfoResp.data.success && playerTD2InfoResp.data.message.length == 1) {
        playerTD2Info.value = playerTD2InfoResp.data.message[0];
      }
    }
  } catch (error) {
    playerInfo.value = undefined;
    playerTD2Info.value = undefined;
    playerInfoStatus.value = Status.Data.Error;
  }

  try {
    const playerJournalResp = await fetchPlayerJournal(playerId.value);

    playerJournal.value = playerJournalResp.data;
    playerJournalStatus.value = Status.Data.Loaded;
  } catch (error) {
    playerJournal.value = undefined;
    playerJournalStatus.value = Status.Data.Error;
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
