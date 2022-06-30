<template>
  <section class="journal-view">
    <div class="journal-type-options">
      <router-link class="router-link" active-class="route-active" to="/journal/timetables" exact>
        {{ $t('journal.section-timetables') }}
      </router-link>
      &nbsp;&bull;&nbsp;
      <router-link class="router-link" active-class="route-active" to="/journal/dispatchers">
        {{ $t('journal.section-dispatchers') }}
      </router-link>
    </div>

    <div class="journal-section">
      <router-view v-slot="{ Component }">
        <keep-alive>
          <component :is="Component" :key="$route.path" />
        </keep-alive>
      </router-view>
    </div>
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

<style lang="scss" scoped>
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
</style>
