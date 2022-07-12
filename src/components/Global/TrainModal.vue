<template>
  <div class="card-dimmer"></div>
  <div class="train-modal" v-click-outside="closeModal" @keydown.esc="closeModal">
    <button class="btn exit" @click="closeModal">
      <img :src="icons.exit" alt="close card" />
    </button>

    <div class="content" tabindex="0" ref="content">
      <TrainInfo :train="chosenTrain" :extended="false" />
      <TrainSchedule :train="chosenTrain" tabindex="0" />
    </div>
  </div>
</template>

<script lang="ts">
import Train from '@/scripts/interfaces/Train';
import { defineComponent, PropType } from 'vue';
import TrainInfo from '../TrainsView/TrainInfo.vue';
import TrainSchedule from '../TrainsView/TrainSchedule.vue';

export default defineComponent({
  components: { TrainInfo, TrainSchedule },

  emits: ['closeModal'],

  data() {
    return {
      icons: {
        exit: require('@/assets/icon-exit.svg'),
      },
    };
  },

  props: {
    chosenTrain: {
      type: Object as PropType<Train>,
      required: true,
    },
  },

  activated() {
    this.$nextTick(() => {
      (this.$refs['content'] as HTMLElement).focus();
    });
  },

  methods: {
    closeModal() {
      this.$emit('closeModal');
    },
  },
});
</script>

<style lang="scss" scoped>
@import '../../styles/responsive.scss';
@import '../../styles/card.scss';

.exit {
  position: absolute;
  top: 0;
  right: 0;

  margin: 1em 2em;

  background-color: #00000077;
  outline: 2px solid white;
  padding: 0.25em;
  border-radius: 50%;

  z-index: 101;

  img {
    width: 1.5rem;
    vertical-align: middle;
  }
}

.train-modal {
  position: fixed;
  top: 1em;
  left: 50%;

  text-align: left;

  transform: translateX(-50%);
  background-color: #202020;

  z-index: 100;

  width: 95vw;

  border: 1px solid gray;
  overflow: hidden;
}

.content {
  overflow: auto;
  max-height: 95vh;
}

@include smallScreen {
  .exit {
    top: auto;
    bottom: 0;

    margin: 1em;

    img {
      width: 1.75rem;
    }
  }
}
</style>
