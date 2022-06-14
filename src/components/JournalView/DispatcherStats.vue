<template>
  <div class="card-dimmer"></div>

  <div class="dispatcher-stats-card card">
    <h2 class="card-title">STATYSTYKI DYŻURNEGO <span class="text--primary">SPYTHERE</span></h2>

    <h3>Rozkłady jazdy dyżurnego</h3>
    <div class="info-stats">
      <span class="stat-badge">
        <span>SUMA</span>
        <span>15</span>
      </span>
      <span class="stat-badge">
        <span>REKORD</span>
        <span>322km</span>
      </span>
      <span class="stat-badge">
        <span>ŚREDNIO</span>
        <span>72km</span>
      </span>
      <span class="stat-badge">
        <span>NAJKRÓTSZY</span>
        <span>8.5km</span>
      </span>
    </div>

    <h3>Historia wystawionych rozkładów</h3>
    <div class="last-timetables">
      <div class="timetable-row">
        <span>213000&nbsp;<b>lolz12345</b></span>
        <span>#333331</span>
        <span>Grabów Miasto - Aleksandrów Kujawski</span>
        <span>14/06 23:09</span>
      </div>

      <div class="timetable-row">
        <span>213000&nbsp;<b>Waffel</b></span>
        <span>#333327</span>
        <span>STARE LIPOWO - Testowo</span>
        <span>14/06 22:57</span>
      </div>

      <div class="timetable-row">
        <span>213000&nbsp;<b>Waffel</b></span>
        <span>#333327</span>
        <span>STARE LIPOWO - Testowo</span>
        <span>14/06 22:57</span>
      </div>

      <div class="timetable-row">
        <span>213000&nbsp;<b>Waffel</b></span>
        <span>#333327</span>
        <span>STARE LIPOWO - Testowo</span>
        <span>14/06 22:57</span>
      </div>

      <div class="timetable-row">
        <span>213000&nbsp;<b>Waffel</b></span>
        <span>#333327</span>
        <span>STARE LIPOWO - Testowo</span>
        <span>14/06 22:57</span>
      </div>

      <div class="timetable-row">
        <span>213000&nbsp;<b>Waffel</b></span>
        <span>#333327</span>
        <span>STARE LIPOWO - Testowo</span>
        <span>14/06 22:57</span>
      </div>

      <!-- <div class="timetable-row">
        <span>21370</span>
        <span>nwm12345t6</span>
        <span>Grabów Miasto - Aleksandrów Kujawski</span>
        <span>23:09</span>
      </div> -->
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  setup() {
    return {};
  },
});
</script>

<style lang="scss" scoped>
@import '../../styles/card.scss';
@import '../../styles/variables.scss';
@import '../../styles/responsive.scss';

.dispatcher-stats-card {
  padding: 1em;
  max-width: 800px;
  width: 100vw;
}

h2.card-title {
  text-align: center;
  font-size: 1.8em;
}

h3 {
  margin: 0.5em 0;
}

.info-stats {
  display: flex;
  flex-wrap: wrap;
  margin-top: 1em;
}

.stat-badge {
  margin-right: 0.5em;
  padding-bottom: 1em;

  span {
    padding: 0.25em 0.3em;
  }

  span:first-child {
    background-color: #4d4d4d;
  }

  span:last-child {
    background-color: $accentCol;
    color: black;
    font-weight: bold;
  }
}

.timetable-row {
  display: grid;
  grid-template-columns: 2fr 1fr 3fr 1fr;
  gap: 0.2em;
  margin: 0.5em 0;
  text-align: center;

  span {
    display: flex;
    justify-content: center;
    align-items: center;

    background-color: #4d4d4d;
    padding: 0.5em 0.2em;
  }
}

@include smallScreen() {
  .dispatcher-stats-card {
    text-align: center;
  }
  .info-stats {
    justify-content: center;
  }

  .timetable-row {
    grid-template-columns: 2fr 1fr;
    grid-template-rows: 1fr 1fr;
    gap: 0;
  }
}
</style>
