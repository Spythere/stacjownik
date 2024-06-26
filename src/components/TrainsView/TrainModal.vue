<template>
  <div class="train-modal" v-if="chosenTrain" @keydown.esc="closeModal">
    <div class="modal-background" @click="closeModal"></div>
    <div class="modal-content" ref="content" tabindex="0">
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
import { Train } from '../../typings/common';

export default defineComponent({
  components: { TrainInfo, TrainSchedule },
  mixins: [modalTrainMixin],

  computed: {
    chosenTrain() {
      return this.store.trainList.find((train) => train.modalId == this.store.chosenModalTrainId);
    }
  },

  watch: {
    chosenTrain(train: Train | undefined) {
      this.$nextTick(() => {
        if (train) {
          document.body.classList.add('no-scroll');
          const contentEl = this.$refs['content'] as HTMLElement;
          contentEl.focus();
        } else {
          (this.store.modalLastClickedTarget as any)?.focus();

          setTimeout(() => {
            document.body.classList.remove('no-scroll');
          }, 90);
        }
      });
    }
  }
});
</script>

<style lang="scss" scoped>
@import '../../styles/responsive.scss';

.train-modal {
  position: fixed;
  top: 0;
  left: 0;

  width: 100%;
  height: 100%;

  color: white;
  z-index: 200;

  display: flex;
  justify-content: center;
  align-items: flex-start;

  text-align: left;
}

.modal-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;

  cursor: pointer;

  background-color: rgba(0, 0, 0, 0.55);
}

.modal-content {
  position: relative;
  overflow-y: scroll;

  width: 95vw;
  max-height: 95vh;
  max-height: 95dvh;
  margin-top: 1em;

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
</style>
