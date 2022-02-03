<template>
  <div class="train-info">
    <div class="wrapper">
      <train-info-simple :train="train" v-if="simpleView" />
      <train-info-extended :train="train" v-else />
    </div>
  </div>
</template>

<script lang="ts">
import Train from '@/scripts/interfaces/Train';
import { defineComponent } from 'vue';
import TrainInfoExtended from './TrainInfoExtended.vue';
import TrainInfoSimple from './TrainInfoSimple.vue';

export default defineComponent({
  components: { TrainInfoSimple, TrainInfoExtended },

  props: {
    train: {
      type: Object as () => Train,
      required: true,
    },

    simpleView: {
      type: Boolean,
      default: false,
    },
  },
});
</script>

<style lang="scss" scoped>
@import '../../styles/responsive.scss';

.wrapper {
  @include smallScreen() {
    font-size: 1.2em;
  }

}
</style>
