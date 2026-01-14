<template>
  <div class="flag-icon">
    <img
      :src="languageFlagSrc"
      alt="language flag"
      :style="{
        width: width
      }"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { getLanguageNameById } from '../../utils/languageUtils';

const props = defineProps({
  languageId: {
    type: Number,
    required: true
  },

  width: {
    type: String
  }
});

const languageFlagSrc = computed(
  () => `/images/flags/${getLanguageNameById(props.languageId)}.svg`
);
</script>

<style scoped>
.flag-icon img {
  vertical-align: middle;
}
</style>
