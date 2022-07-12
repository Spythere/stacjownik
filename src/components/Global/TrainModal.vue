<template>
  <div class="card-dimmer"></div>
  <div class="train-modal" v-click-outside="closeModal" @keydown.esc="closeModal">
    <transition name="top-info-bar-anim">
      <div class="top-info-bar" v-if="isTopBarVisible">
        <span v-if="chosenTrain.timetableData">
          <b class="text--primary">{{ chosenTrain.timetableData.category }} {{ chosenTrain.trainNo }}</b>
          {{ chosenTrain.driverName }} &bull;
          <b>{{ chosenTrain.timetableData.route.replace('|', ' > ') }}</b>
          &bull;
          {{ currentDistance(chosenTrain.timetableData.followingStops) }} km /
          <span class="text--primary">{{ chosenTrain.timetableData.routeDistance }} km</span>
          &bull;
          <span class="text--grayed">{{ displayTrainPosition(chosenTrain) }}</span>
          &bull;
          {{ chosenTrain.speed }}km/h
        </span>
      </div>
    </transition>

    <button class="btn exit" @click="closeModal">
      <img :src="icons.exit" alt="close card" />
    </button>

    <div class="content" tabindex="0" ref="content">
      <TrainInfo :train="chosenTrain" :extended="false" ref="trainInfo" />
      <TrainSchedule :train="chosenTrain" tabindex="0" />
    </div>
  </div>
</template>

<script lang="ts">
import trainInfoMixin from '@/mixins/trainInfoMixin';
import Train from '@/scripts/interfaces/Train';
import { defineComponent, PropType } from 'vue';
import TrainInfo from '../TrainsView/TrainInfo.vue';
import TrainSchedule from '../TrainsView/TrainSchedule.vue';

export default defineComponent({
  components: { TrainInfo, TrainSchedule },
  mixins: [trainInfoMixin],

  emits: ['closeModal'],

  data() {
    return {
      isTopBarVisible: false,

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
    const contentEl = this.$refs['content'] as HTMLElement;

    this.$nextTick(() => {
      contentEl.focus();
    });


    contentEl.addEventListener('scroll', this.handleContentScroll);
  },

  deactivated() {
    (this.$refs['content'] as HTMLElement).removeEventListener('scroll', this.handleContentScroll);
    this.isTopBarVisible = false;
  },

  methods: {
    closeModal() {
      this.$emit('closeModal');
    },

    handleContentScroll(e: Event) {
      const trainInfoCompHeight: number = (this.$refs['trainInfo'] as any).$el.getBoundingClientRect().height;

      const posTop = (e.target as HTMLElement).scrollTop;
      this.isTopBarVisible = posTop > trainInfoCompHeight;
    },
  },
});
</script>

<style lang="scss" scoped>
@import '../../styles/responsive.scss';
@import '../../styles/card.scss';

.top-info-bar-anim {
  &-enter-active,
  &-leave-active {
    transition: all 150ms ease-in-out;
  }

  &-enter-from,
  &-leave-to {
    transform: translate(-50%, -50%) scale(0.8);
    opacity: 0;
  }
}

.exit {
  position: absolute;
  top: 0;
  right: 0;

  margin: 1em 2em;

  background-color: #000000;
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

.top-info-bar {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;

  padding: 0.5em 1em;
  padding-right: 4em;
  text-align: center;

  overflow: hidden;

  z-index: 101;

  background-color: #000000dd;
}

.content {
  overflow: auto;
  max-height: 95vh;
}

@include midScreen {
  .exit {
    top: auto;
    bottom: 0;

    margin: 1em;

    img {
      width: 1.75rem;
    }
  }

  .content {
    padding-bottom: 3em;
  }

  .top-info-bar {
    padding: 0.5em 1em;
  }
}
</style>
