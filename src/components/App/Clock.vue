<template>
  <div class="clock">{{ computedDate }}</div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue';
export default defineComponent({
  name: 'VueClock',
  data: () => ({ timestamp: Date.now() }),
  setup() {
    let timestamp = ref(Date.now());

    const computedDate = computed(() =>
      new Date(timestamp.value).toLocaleString('pl-PL', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    );

    setInterval(() => (timestamp.value = Date.now()), 1000);

    return { computedDate };
  }
});
</script>

<style lang="scss" scoped>
.clock {
  display: flex;
  align-items: center;
}
</style>
