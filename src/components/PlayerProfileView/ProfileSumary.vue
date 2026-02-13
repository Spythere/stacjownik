<template>
  <div class="profile-summary">
    <div class="player-info">
      <div class="info-main">
        <img
          v-if="playerTD2Info"
          :src="`https://td2.info.pl/index.php?action=dlattach;attach=${playerTD2Info.avatar};type=avatar`"
          alt="player image"
          height="120"
          @error="(e) => ((e.target as any).src = '/images/default-avatar.jpg')"
        />

        <img class="img-placeholder" height="100" src="/images/default-avatar.jpg" v-else />

        <div>
          <h2 class="player-name-header">
            <a :href="`https://td2.info.pl/profile/?u=${route.query.playerId}`" target="_blank">
              {{ playerName }}
            </a>
          </h2>

          <div class="player-badges">
            <div class="badge-container" v-if="playerInfo.driverStats.driverLevel != null">
              <span
                class="level-badge driver"
                :style="calculateExpStyles(playerInfo.driverStats.driverLevel)"
              >
                {{
                  playerInfo.driverStats.driverLevel > 1 ? playerInfo.driverStats.driverLevel : 'L'
                }}
              </span>
              MASZYNISTA
            </div>

            <div class="badge-container" v-if="playerInfo.dispatcherStats.dispatcherLevel != null">
              <span
                class="level-badge dispatcher"
                :style="calculateExpStyles(playerInfo.dispatcherStats.dispatcherLevel)"
              >
                {{
                  playerInfo.dispatcherStats.dispatcherLevel > 1
                    ? playerInfo.dispatcherStats.dispatcherLevel
                    : 'L'
                }}
              </span>
              DYŻURNY RUCHU
            </div>
          </div>
        </div>
      </div>

      <div class="info-activity" v-if="playerInfo.currentActivity.dispatcher.length > 0">
        <b class="text--primary">ONLINE JAKO DR:</b>
        {{
          playerInfo.currentActivity.dispatcher
            .map((d) => `${d.stationName} (${d.stationHash})`)
            .join(', ')
        }}
      </div>

      <div
        class="info-activity"
        v-if="playerInfo.currentActivity.driver && playerInfo.currentActivity.driver.length > 0"
      >
        <b>ONLINE JAKO MASZYNISTA:</b>
        {{ playerInfo.currentActivity.driver.trainNo }} na scenerii
        {{ playerInfo.currentActivity.driver.currentStationName }}
      </div>

      <!-- <p v-if="useMainStore"></p> -->
      <!-- <p>Stacjosponsor od 01.01.2024</p> -->
    </div>

    <div class="player-stats">
      <div class="stats-driver">
        <img src="/images/icon-train.svg" width="35" alt="train icon" />
        <h3>STATYSTYKI MASZYNISTY</h3>
        <hr />

        <div v-if="playerInfo.driverStats.countAll > 0">
          <div>
            <b class="text--primary">
              {{ playerInfo.driverStats.countFulfilled }} /
              {{ playerInfo.driverStats.countAll }} ({{
                getCountPercentage(
                  playerInfo.driverStats.countFulfilled,
                  playerInfo.driverStats.countAll,
                  2
                )
              }}%)
            </b>
            - wypełnione rozkłady jazdy
          </div>
          <div>
            <b class="text--primary">
              {{ playerInfo.driverStats.currentDistanceTotal?.toFixed(2) }} /
              {{ playerInfo.driverStats.routeDistanceTotal?.toFixed(2) }} ({{
                getCountPercentage(
                  playerInfo.driverStats.currentDistanceTotal || 0,
                  playerInfo.driverStats.routeDistanceTotal || 0,
                  2
                )
              }}%)
            </b>
            - zatwierdzony kilometraż w RJ
          </div>
          <div>
            <b class="text--primary">
              {{ playerInfo.driverStats.confirmedStopsTotal }} /
              {{ playerInfo.driverStats.allStopsTotal }} ({{
                getCountPercentage(
                  playerInfo.driverStats.confirmedStopsTotal || 0,
                  playerInfo.driverStats.allStopsTotal || 0,
                  2
                )
              }}%)
            </b>
            - potwierdzonych stacji w RJ
          </div>
          <div>
            <b class="text--primary">{{ playerInfo.driverStats.routeDistanceMax || 0 }}km</b> -
            najdłuższy rozkład jazdy
          </div>
          <div>
            <b class="text--primary">
              {{ playerInfo.driverStats.routeDistanceAvg?.toFixed(2) || 0 }}km
            </b>
            - średnia długość wszystkich rozkładów
          </div>
        </div>

        <div class="text--grayed" v-else>
          Ten użytkownik nie posiada statystyk maszynisty zarejestrowanych przez Stacjownik!
        </div>
      </div>

      <div
        class="stats-dispatcher"
        v-if="playerInfo.dispatcherStats && playerInfo.dispatcherStats.services?.count"
      >
        <img src="/images/icon-user.svg" width="35" alt="user icon" />
        <h3>STATYSTYKI DYŻURNEGO RUCHU</h3>
        <hr />

        <div>
          <b class="text--primary">{{ playerInfo.dispatcherStats.services.count }}</b> - służby jako
          dyżurny ruchu
        </div>
        <div>
          <b class="text--primary">{{
            humanizeDuration(playerInfo.dispatcherStats.services.durationMax)
          }}</b>
          - najdłuższa służba
        </div>

        <div v-if="playerInfo.dispatcherStats.issuedTimetables">
          <div>
            <b class="text--primary">{{ playerInfo.dispatcherStats.issuedTimetables.count }}</b>
            - wystawione RJ jako dyżurny ruchu
          </div>
          <div>
            <b class="text--primary">
              {{ playerInfo.dispatcherStats.issuedTimetables.distanceMax }}km
            </b>
            - najdłuższy wystawiony RJ
          </div>
          <div>
            <b class="text--primary">
              {{ playerInfo.dispatcherStats.issuedTimetables.distanceSum.toFixed(2) }}km
            </b>
            - suma długości wystawionych RJ
          </div>
        </div>

        <div class="text--grayed" v-else>
          Ten dyżurny nie wystawił jeszcze żadnego rozkładu jazdy
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { PropType } from 'vue';
import { API, Td2API } from '../../typings/api';
import { calculateExpStyles } from '../../composables/badge';
import { getCountPercentage } from '../../utils/calcUtils';
import { humanizeDuration } from '../../composables/time';
import { useRoute } from 'vue-router';

const route = useRoute();

const props = defineProps({
  playerInfo: {
    type: Object as PropType<API.PlayerInfo.Data>,
    required: true
  },

  playerTD2Info: {
    type: Object as PropType<Td2API.UsersInfoByName.UserInfo | null>
  },

  playerName: {
    type: String
  }
});
</script>

<style lang="scss" scoped>
@use '../../styles/badge';
@use '../../styles/responsive';

.profile-summary {
  display: flex;
  flex-direction: column;
  gap: 1em;
  overflow: auto;
}

.player-stats {
  display: flex;
  flex-direction: column;
  gap: 1em;

  hr {
    margin: 0.5em 0;
  }
}

.player-info,
.player-stats > div {
  background-color: var(--clr-tile);
  border-radius: 0.5em;
  padding: 1em;
}

.player-name-header {
  margin: 0.5em 0;
}

.player-badges {
  display: flex;
  justify-content: center;
  gap: 1em;
}

.badge-container {
  display: flex;
  justify-content: center;
  align-items: center;

  gap: 0.25em;

  & > .level-badge {
    font-size: 1.15em;
  }
}

.info-activity {
  margin-top: 1em;
}

@include responsive.midScreen {
  .player-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
  }
}
</style>
