<template>
  <div class="update-modal">
    <AnimatedModal :is-open="true">Test</AnimatedModal>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import AnimatedModal from '../Global/AnimatedModal.vue';

export default defineComponent({
  components: { AnimatedModal },
  data() {
    return {};
  }
});
</script>

<style scoped></style>
