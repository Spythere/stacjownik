<template>
  <div class="profile-view">
    <div class="view-container">
      <div class="profile-sidebar">
        <div class="player-image-box">
          <img
            src="https://td2.info.pl/index.php?action=dlattach;attach=83477;type=avatar"
            alt="player image"
            width="110"
          />
        </div>

        <div class="player-summary">
          <h3>Spythere</h3>
          <p>12 poziom maszynisty</p>
          <p>12 poziom dyżurnego</p>
          <p>Pierwsza aktywność: 02.02.2022</p>
          <p>Ostatnia aktywność: 02.02.2026 (DR)</p>
          <p>Stacjosponsor od 01.01.2024</p>
        </div>

        <div class="player-stats">
          <div class="stats-showcase">
            <div>
              <div>245 / 250 (95.55%)</div>
              <div>ROZKŁADÓW JAZDY</div>
            </div>

            <div>
              <div>25</div>
              <div>SŁUŻB JAKO DR</div>
            </div>

            <div>
              <div>14</div>
              <div>WYSTAWIONYCH RJ</div>
            </div>
          </div>

          <div class="stats-other">
            <div>
              <img src="/images/icon-train.svg" width="25" alt="train icon" />
              Najdłuższy rozkład o długości <b>237.13km</b> &bull; średnio 60.39km
            </div>

            <div>
              <img src="/images/icon-spawn.svg" width="25" alt="spawn icon" />
              <b>16091</b> zatwierdzonych kilometrów na 17149 razem (93.83%)
            </div>

            <div>
              <img src="/images/icon-clock.svg" width="25" alt="clock icon" />
              <b>2420</b> potwierdzonych odjazdów z 2537 łącznie (95.39%)
            </div>

            <div>
              <img src="/images/icon-user.svg" width="25" alt="clock icon" />
              Najdłuższa służba o długości <b>6 godz. 13 min.</b> &bull; średnio 2 godz. 1 min.
            </div>

            <div>
              <img src="/images/icon-timetable.svg" width="25" alt="timetable icon" />
              Wystawione łącznie <b>670.80km</b> rozkładów &bull; najdłuższy: <b>80.81km</b> &bull;
              średnio: 35.31km
            </div>
          </div>
        </div>
      </div>

      <div class="profile-main">
        <div class="player-stats">
          <!-- <div class="stats-month"></div> -->
        </div>

        <div class="player-history">
          <div class="history-menu">
            <div>ROZKŁADY JAZDY</div>
            <div>DYŻURNY RUCHU</div>
            <div>WYSTAWIONE ROZKŁADY</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const playerId = computed(() => route.params.id);
// const playerName = ref('');
</script>

<style lang="scss" scoped>
@use '../styles/responsive';

.profile-view {
  display: flex;
  justify-content: center;
}

.view-container {
  display: grid;
  grid-template-columns: 3fr 4fr;
  gap: 0 1em;

  position: relative;

  max-width: var(--max-container-width);
  width: 100%;

  padding: 1rem 0;
  text-align: center;
}

.profile-sidebar,
.profile-main {
  position: relative;
  overflow: auto;

  background-color: #181818;
  border-radius: 0.5em;
  padding: 1em 0.5em;

  height: calc(100vh - 0.5em);
  min-height: 500px;
  max-height: 2000px;
}

@include responsive.midScreen {
  .view-container {
    grid-template-columns: 1fr;
    gap: 0;
    max-width: 1000px;
  }

  // .scenery-left {
  //   border-radius: 1em;
  //   margin-bottom: 1em;
  //   height: auto;
  // }

  // .scenery-right {
  //   border-radius: 1em;
  //   height: 100vh;
  // }
}

@include responsive.smallScreen {
  .scenery-left {
    max-height: 100vh;
  }

  .scenery-right {
    height: 100vh;
  }
}
</style>
