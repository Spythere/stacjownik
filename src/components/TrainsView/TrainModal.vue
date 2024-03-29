<template>
  <div class="train-modal" v-if="chosenTrain" @keydown.esc="closeModal">
    <div class="modal_background" @click="closeModal"></div>
    <div class="modal_content" ref="content" tabindex="0">
      <button class="btn exit" @click="closeModal">
        <img src="/images/icon-exit.svg" alt="close card" />
      </button>

      <TrainInfo :train="chosenTrain" :extended="true" ref="trainInfo" />
      <TrainSchedule :train="chosenTrain" tabindex="0" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import modalTrainMixin from '../../mixins/modalTrainMixin';
import TrainInfo from './TrainInfo.vue';
import TrainSchedule from './TrainSchedule.vue';

export default defineComponent({
  components: { TrainInfo, TrainSchedule },
  mixins: [modalTrainMixin],

  activated() {
    const contentEl = this.$refs['content'] as HTMLElement;

    this.$nextTick(() => {
      contentEl.focus();
    });
  }
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

  z-index: 201;

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

  color: white;
  z-index: 200;

  display: flex;
  justify-content: center;

  text-align: left;
}

.modal_background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;

  cursor: pointer;

  background-color: rgba(0, 0, 0, 0.55);
}

.modal_content {
  position: relative;
  overflow-y: scroll;

  margin-top: 1em;

  width: 95vw;
  max-height: 96vh;

  background-color: #1a1a1a;
  box-shadow: 0 0 15px 10px #0e0e0e;
}

@include midScreen {
  .exit {
    margin: 0.5em;

    img {
      width: 1.75rem;
    }
  }
}

@include smallScreen {
  .modal_content {
    max-height: 85vh;
  }
}
</style>
