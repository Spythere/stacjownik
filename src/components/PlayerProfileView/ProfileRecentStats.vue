<template>
  <div class="profile-recent-stats">
    <h3 class="stats-header">STATYSTYKI AKTYWNOŚCI (30 OSTATNICH DNI)</h3>

    <div class="month-stats-box">
      <div class="month-stat">
        <div><img src="/images/icon-train.svg" width="30" alt="train icon" /></div>
        <div>
          <h3 class="text--primary">{{ playerInfo.driverStatsLastMonth.countAll }}</h3>
        </div>
        <div>ROZKŁADÓW JAZDY</div>
      </div>

      <div class="month-stat">
        <div><img src="/images/icon-spawn.svg" width="30" alt="spawn icon" /></div>
        <div>
          <h3 class="text--primary">
            {{ playerInfo.driverStatsLastMonth.currentDistanceTotal?.toFixed(2) || 0 }}
          </h3>
        </div>
        <div>POKONANYCH KILOMETRÓW</div>
      </div>

      <div class="month-stat">
        <div><img src="/images/icon-user.svg" width="30" alt="user icon" /></div>
        <div>
          <h3 class="text--primary">
            {{ playerInfo.dispatcherStatsLastMonth.services?.count || 0 }}
          </h3>
        </div>
        <div>SŁUŻB DYŻURNEGO</div>
      </div>

      <div class="month-stat">
        <div><img src="/images/icon-timetable.svg" width="30" alt="timetable icon" /></div>
        <div>
          <h3 class="text--primary">
            {{ playerInfo.dispatcherStatsLastMonth.issuedTimetables?.count || 0 }}
          </h3>
        </div>
        <div>WYSTAWIONYCH ROZKŁADÓW</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { PropType } from 'vue';
import { API } from '../../typings/api';

const props = defineProps({
  playerInfo: {
    type: Object as PropType<API.PlayerInfo.Data>,
    required: true
  }
});
</script>

<style lang="scss" scoped>
.profile-recent-stats {
  overflow: hidden;
}

.stats-header {
  padding: 0.5em;
  background-color: var(--clr-tile);
  margin-bottom: 0.5em;
}

.month-stats-box {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5em;
}

.month-stat {
  background-color: var(--clr-tile);
  border-radius: 0.5em;
  padding: 0.5em;

  h3 {
    font-size: 1.3em;
  }

  div:nth-child(3) {
    margin-top: 0.5em;
    font-size: 0.9em;
  }
}
</style>
