<template>
  <div class="train-modal" @keydown.esc="closeModal">
    <div class="modal_background" @click="closeModal"></div>
    <div class="modal_content" ref="content" tabindex="0">
      <!-- <transition name="top-info-bar-anim">
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
      </transition> -->

      <button class="btn exit" @click="closeModal">
        <img :src="icons.exit" alt="close card" />
      </button>

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

    document.body.style.overflowY = 'hidden';
    // document.body.blur();

    // contentEl.addEventListener('scroll', this.handleContentScroll);
  },

  deactivated() {
    document.body.style.overflowY = 'scroll';

    // (this.$refs['content'] as HTMLElement).removeEventListener('scroll', this.handleContentScroll);
    // this.isTopBarVisible = false;
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

  margin: 0.5em 1em;

  padding: 0.25em;

  z-index: 101;

  img {
    width: 1.5rem;
    vertical-align: middle;
  }
}

.train-modal {
  position: fixed;
  top: 0;
  left: 0;

  width: 100%;
  height: 100%;

  color: white;
  z-index: 100;

  display: flex;
  justify-content: center;

  text-align: left;
}

.modal_background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;

  cursor: pointer;

  background-color: rgba(0, 0, 0, 0.55);
}

.modal_content {
  position: relative;
  overflow-y: scroll;

  margin-top: 1em;

  width: 95vw;
  height: 95vh;

  background-color: #1a1a1a;
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

@include midScreen {
  .exit {
    margin: 0.5em;

    img {
      width: 1.75rem;
    }
  }

  .top-info-bar {
    padding: 0.5em 1em;
  }
}

@include smallScreen {
  .train-modal {
    font-size: 1.05em;
  }

  .modal_content {
    max-height: 75vh;
  }
}
</style>
