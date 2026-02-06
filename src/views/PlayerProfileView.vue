<template>
  <div class="profile-view">
    <div class="view-container">
      <div class="profile-sidebar">
        <div class="player-summary">
          <img
            src="https://td2.info.pl/index.php?action=dlattach;attach=83477;type=avatar"
            alt="player image"
            width="110"
          />

          <h3>Spythere</h3>
          <p>12 poziom maszynisty</p>
          <p>12 poziom dyżurnego</p>
          <p>Ostatnia aktywność: 02.02.2026 (DR)</p>
          <p>Stacjosponsor od 01.01.2024</p>
        </div>

        <div class="player-stats">
          <div class="stats-driver">
            <img src="/images/icon-train.svg" width="35" alt="train icon" />
            <h3>STATYSTYKI MASZYNISTY</h3>
            <hr />

            <div><b class="text--primary">522 / 619 (95.39%)</b> - wypełnione rozkłady jazdy</div>
            <div>
              <b class="text--primary">16091 / 17149 (95.39%)</b> - zatwierdzony kilometraż w RJ
            </div>
            <div>
              <b class="text--primary">2420 / 2537 (95.39%)</b> - potwierdzonych stacji w RJ
            </div>
            <div><b class="text--primary">237.13km</b> - najdłuższy rozkład jazdy</div>
            <div><b class="text--primary">60.39km</b> - średnia długość wszystkich rozkładów</div>
          </div>

          <div class="stats-dispatcher">
            <img src="/images/icon-user.svg" width="35" alt="clock icon" />
            <h3>STATYSTYKI DYŻURNEGO RUCHU</h3>
            <hr />

            <div><b class="text--primary">25</b> - służby jako dyżurny ruchu</div>
            <div><b class="text--primary">6 godz. 13 min.</b> - najdłuższa służba</div>
            <div><b class="text--primary">14</b> - wystawione RJ jako dyżurny ruchu</div>
            <div><b class="text--primary">80.81km</b> - najdłuższy wystawiony RJ</div>
            <div><b class="text--primary">670.80km</b> - suma długości wystawionych RJ</div>
          </div>
        </div>
      </div>

      <div class="profile-main">
        <h3 class="main-header">STATYSTYKI AKTYWNOŚCI (30 OSTATNICH DNI)</h3>

        <div class="main-month-stats">
          <div class="month-stats-box">
            <div class="month-stat">
              <div><img src="/images/icon-train.svg" width="30" alt="train icon" /></div>
              <div><h3 class="text--primary">55</h3></div>
              <div>
                ROZKŁADÓW <br />
                JAZDY
              </div>
            </div>

            <div class="month-stat">
              <div><img src="/images/icon-spawn.svg" width="30" alt="train icon" /></div>
              <div><h3 class="text--primary">5500</h3></div>
              <div>
                POKONANYCH <br />
                KILOMETRÓW
              </div>
            </div>

            <div class="month-stat">
              <div><img src="/images/icon-user.svg" width="30" alt="train icon" /></div>
              <div><h3 class="text--primary">15</h3></div>
              <div>
                SŁUŻB <br />
                DYŻURNEGO
              </div>
            </div>

            <div class="month-stat">
              <div><img src="/images/icon-timetable.svg" width="30" alt="train icon" /></div>
              <div><h3 class="text--primary">12</h3></div>
              <div>
                WYSTAWIONYCH <br />
                ROZKŁADÓW
              </div>
            </div>
          </div>
        </div>

        <h3 class="main-header">OSTATNIA AKTYWNOŚĆ GRACZA</h3>

        <div class="history-menu">
          <button class="history-menu-button">ROZKŁADY JAZDY</button>
          <button class="history-menu-button">SŁUŻBY DR</button>
          <button class="history-menu-button">WYSTAWIONE RJ</button>
        </div>

        <div class="history-list-box">
          <ul>
            <li></li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useApiStore } from '../store/apiStore';
import { API } from '../typings/api';

const apiStore = useApiStore();
const route = useRoute();

const playerInfo = ref<API.PlayerInfo.Data | null>(null);
const playerJournal = ref<API.PlayerJournal.Data | null>(null);

onMounted(() => {
  fetchPlayerInfoData();
  fetchPlayerJournal();
});

async function fetchPlayerInfoData() {
  const playerId = route.params.id.toString();

  if (!apiStore.client || !playerId) return;

  try {
    const response = await apiStore.client.get<API.PlayerInfo.Data>('api/getPlayerInfo', {
      params: {
        playerId: playerId
      }
    });

    playerInfo.value = response.data;
  } catch (error) {
    console.error(error);
  }
}

async function fetchPlayerJournal() {
  const playerId = route.params.id.toString();

  if (!apiStore.client || !playerId) return;

  try {
    const response = await apiStore.client.get<API.PlayerJournal.Data>('api/getPlayerJournal', {
      params: {
        playerId: playerId
      }
    });

    playerJournal.value = response.data;
  } catch (error) {
    console.error(error);
  }
}
</script>

<style lang="scss" scoped>
@use '../styles/responsive';

$tileColor: #181818;

.profile-view {
  display: flex;
  justify-content: center;
}

.view-container {
  display: grid;
  grid-template-columns: 500px 1fr;

  gap: 1em;

  position: relative;

  max-width: var(--max-container-width);
  width: 100%;
  height: calc(100vh - 0.5em);
  min-height: 900px;

  padding: 1rem 0;
  text-align: center;
}

.view-container > div {
  position: relative;
  overflow: auto;

  // border-radius: 0.5em;
}

.profile-sidebar {
  display: flex;
  flex-direction: column;
  gap: 1em;
}

.player-stats {
  display: flex;
  flex-direction: column;
  gap: 1em;

  hr {
    margin: 0.5em 0;
  }
}

.player-summary,
.player-stats > div {
  background-color: $tileColor;
  border-radius: 0.5em;
  padding: 1em;
}

.profile-main {
  max-height: 2000px;
}

.main-header {
  padding: 0.5em;
  background-color: $tileColor;
  margin-bottom: 0.5em;
  border-radius: 0.5em;
}

.month-stats-box {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5em;
  margin-bottom: 1em;
}

.month-stat {
  background-color: $tileColor;
  border-radius: 0.5em;
  padding: 0.5em;
}

.history-menu {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1em;
  padding: 0 1px;

  & > button {
    background-color: $tileColor;
    padding: 0.5em;
  }
}

@include responsive.midScreen {
  .view-container {
    grid-template-columns: 1fr;
    gap: 0;
    max-width: 1000px;
  }
}

@include responsive.smallScreen {
}
</style>
