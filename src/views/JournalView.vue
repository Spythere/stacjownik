<template>
  <section class="journal-view">
    <div class="journal-type-options">
      <router-link
        class="router-link"
        to="/journal?view=timetables"
        :class="{ active: activeJournalComponent == 'journalTimetables' }"
      >
        {{ $t('journal.section-timetables') }}
      </router-link>
      &nbsp;&bull;&nbsp;
      <router-link
        class="router-link"
        to="/journal?view=dispatchers"
        :class="{ active: activeJournalComponent == 'journalDispatchers' }"
      >
        {{ $t('journal.section-dispatchers') }}
      </router-link>
    </div>

    <div class="journal-section">
      <keep-alive>
        <component :is="activeJournalComponent"></component>
      </keep-alive>
    </div>
    <!-- <JournalTimetables v-if="journalTypeChosen == 'timetables'" />
        <JournalDispatchers
          v-else-if="journalTypeChosen == 'dispatchers'"
          :sceneryName="$route.query.sceneryName?.toString()"
        /> -->
  </section>
</template>

<script lang="ts">
import JournalTimetables from '@/components/JournalView/JournalTimetables.vue';
import { defineComponent, ref } from 'vue';
import JournalDispatchers from '@/components/JournalView/JournalDispatchers.vue';

export default defineComponent({
  components: { JournalTimetables, JournalDispatchers },

  setup() {
    const journalTypeChosen = ref('journalTimetables');

    return {
      activeJournalComponent: journalTypeChosen,
    };
  },

  methods: {
    changeJournalType(type: string) {
      this.activeJournalComponent = type;
    },
  },

  activated() {
    const query = this.$route.query;

    if (query.view == 'dispatchers') this.activeJournalComponent = 'journalDispatchers';
  },
});
</script>

<style lang="scss">
@import '../styles/card.scss';
@import '../styles/variables.scss';
@import '../styles/responsive.scss';

.journal-type-options {
  display: flex;
  justify-content: center;

  background-color: #2c2c2c;
  max-width: 18em;

  font-size: 1.2em;
  margin: 0 auto;

  border-radius: 0 0 0.5em 0.5em;
  padding: 0.1em 0;
}

.journal-section > section {
  height: 100%;

  display: flex;
  justify-content: center;
}

.router-link.active {
  color: gold;
}

// Stats cards
.stats-card {
  padding: 1em;
  max-width: 850px;
  width: 100vw;
  max-height: 750px;
  min-height: 600px;
}

.loading {
  font-size: 1.4em;
  padding: 0.6em;
  text-align: center;
  margin: 1em 0 400px 0;

  background-color: #4d4d4d;
}

h2.card-title {
  font-size: 1.8em;
}

h3 {
  margin-top: 1em;
}

h2,
h3 {
  text-align: center;
}

.info-stats {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 1em;
}

.last-timetables {
  overflow-y: auto;
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

@include smallScreen() {
  .stats-card {
    text-align: center;
    font-size: 1.2em;
  }
}
</style>
