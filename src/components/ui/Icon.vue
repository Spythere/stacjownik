<template>
  <img class="icon" :src="require(`@/assets/icon-${name}.svg`)" alt />
</template>

<script lang="ts">
import Vue from "vue";
export default Vue.extend({
  props: ["name"]
});
</script>