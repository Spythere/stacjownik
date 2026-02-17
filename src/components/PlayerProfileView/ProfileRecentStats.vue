<template>
  <section class="profile-recent-stats">
    <h3 class="stats-header">{{ t('profile.recent-stats.header') }}</h3>

    <div class="month-stats-box">
      <div class="month-stat">
        <div><img src="/images/icon-train.svg" width="30" alt="train icon" /></div>
        <div>
          <h3 class="text--primary">{{ playerInfo.driverStatsLastMonth.countAll }}</h3>
        </div>
        <div>{{ t('profile.recent-stats.timetables') }}</div>
      </div>

      <div class="month-stat">
        <div><img src="/images/icon-spawn.svg" width="30" alt="spawn icon" /></div>
        <div>
          <h3 class="text--primary">
            {{ playerInfo.driverStatsLastMonth.currentDistanceTotal?.toFixed(2) || 0 }}
          </h3>
        </div>
        <div>{{ t('profile.recent-stats.distance') }}</div>
      </div>

      <div class="month-stat">
        <div><img src="/images/icon-user.svg" width="30" alt="user icon" /></div>
        <div>
          <h3 class="text--primary">
            {{ playerInfo.dispatcherStatsLastMonth.services?.count || 0 }}
          </h3>
        </div>
        <div>{{ t('profile.recent-stats.duties') }}</div>
      </div>

      <div class="month-stat">
        <div><img src="/images/icon-timetable.svg" width="30" alt="timetable icon" /></div>
        <div>
          <h3 class="text--primary">
            {{ playerInfo.dispatcherStatsLastMonth.issuedTimetables?.count || 0 }}
          </h3>
        </div>
        <div>{{ t('profile.recent-stats.created-timetables') }}</div>
      </div>
    </div>
  </section>
</template>

<script lang="ts" setup>
import { PropType } from 'vue';
import { API } from '../../typings/api';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

defineProps({
  playerInfo: {
    type: Object as PropType<API.PlayerInfo.Data>,
    required: true
  }
});
</script>

<style lang="scss" scoped>
@use '../../styles/responsive';

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

@include responsive.smallScreen {
  .month-stats-box {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
