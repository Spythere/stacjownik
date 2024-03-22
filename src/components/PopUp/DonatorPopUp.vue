<template>
  <div class="popup-content">
    <img src="/images/icon-diamond.svg" alt="" />
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
  gap: 0.5em;

  padding: 0.5em;
  border-radius: 0.25em;

  width: 100%;

  background-color: #333;
  box-shadow: 0 0 10px 2px #aaa;
}

img {
  vertical-align: middle;
  height: 1em;
  margin-right: 0.5em;
}
</style>
