<template>
  <section class="journal-view">
    <div class="journal-type-options">
      <button
        class="btn btn--text"
        :class="{ checked: journalTypeChosen == 'timetables' }"
        @click="changeJournalType('timetables')"
      >
        ROZKŁADY JAZDY
      </button>
      &nbsp;&bull;&nbsp;
      <button
        class="btn btn--text"
        :class="{ checked: journalTypeChosen == 'dispatchers' }"
        @click="changeJournalType('dispatchers')"
      >
        DYŻURNI
      </button>
    </div>

    <JournalTimetables v-if="journalTypeChosen == 'timetables'" />
  </section>
</template>

<script lang="ts">
import JournalTimetables from '@/components/JournalView/JournalTimetables.vue';
import { defineComponent } from 'vue';

export default defineComponent({
  components: { JournalTimetables },

  data() {
    return {
      journalTypeChosen: 'timetables',
    };
  },

  methods: {
    changeJournalType(type: string) {
      this.journalTypeChosen = type;
    },
  },
});
</script>

<style lang="scss" scoped>
.journal-type-options {
  display: flex;
  justify-content: center;

  background-color: #2c2c2c;
  width: 350px;

  font-size: 1.2em;
  margin: 0 auto;

  border-radius: 0 0 0.5em 0.5em;
  padding: 0.1em 0;
}
</style>
