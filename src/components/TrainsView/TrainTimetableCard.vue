<template>
  <div class="bg-dimmer" @click="close"></div>
  <section class="train-timetable-card card">
    <div class="card-exit" @click="close" @keydown.enter="close" tabindex="0">
      <img :src="icons.exit" alt="icon-exit" />
    </div>

    <train-info :train="train" />
    <train-schedule v-if="train.timetableData" :followingStops="train.timetableData.followingStops" ref="card-inner" tabindex="0" />
  </section>
</template>

<script lang="ts">
import Train from '@/scripts/interfaces/Train';
import { defineComponent } from 'vue';
import TrainInfo from './TrainInfo.vue';
import TrainSchedule from './TrainSchedule.vue';

export default defineComponent({
  components: { TrainInfo, TrainSchedule },
  emits: ['close'],

  data: () => ({
    icons: {
      exit: require('@/assets/icon-exit.svg'),
    },
  }),
  props: {
    train: {
      type: Object as () => Train,
      required: true,
    },
  },
  setup() {
    return {};
  },

  methods: {
    close() {
      this.$emit('close');
    }
  },
});
</script>

<style lang="scss" scoped>
@import '../../styles/card';

.bg-dimmer {
  position: fixed;

  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;

  z-index: 25;

  background: rgba(black, 0.5);
}

.train-timetable-card {
  padding: 0.5em;

  width: 95%;
  max-width: 1300px;


  border: 1px solid white;
}
</style>
