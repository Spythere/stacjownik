<template>
  <div class="loading">
    <span class="loading-circle"></span>
    <span class="loading-circle"></span>
    <span class="loading-circle"></span>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  setup() {
    return {};
  },
});
</script>

<style lang="scss" scoped>
.loading {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);

  display: flex;
  justify-content: center;
  align-items: center;

  margin-top: 2em;
}

.loading-circle {
  width: 1.25em;
  padding-top: 1.25em;

  border-radius: 50%;

  background-color: white;
  margin: 0 0.25em;

  animation: anim 0.45s ease-in-out infinite alternate;

  &:nth-child(odd) {
    background-color: salmon;
  }
}

@for $i from 1 through 3 {
  .loading-circle:nth-child(#{$i}n) {
    animation-delay: #{($i - 1) * 0.15}s;
  }
}

@keyframes anim {
  0% {
    transform: scale(1);
  }
  100% {
    transform: scale(0.45);
  }
}
</style>
