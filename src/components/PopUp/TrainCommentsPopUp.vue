<template>
  <div class="popup-content">
    <span>{{ popupStore.currentPopupContent }}</span>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { usePopupStore } from '../../store/popupStore';

export default defineComponent({
  data() {
    return {
      popupStore: usePopupStore()
    };
  }
});
</script>

<style lang="scss" scoped>
.popup-content {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5em;

  padding: 0.25em 0.5em;
  border-radius: 0.25em;

  width: 100%;
  background-color: #333;
  box-shadow: 0 0 5px 2px #aaa;
}

img {
  height: 1em;
}
</style>
