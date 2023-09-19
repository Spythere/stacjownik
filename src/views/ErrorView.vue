<template>
  <div class="error-view">
    <div class="container">
      <img :src="getIcon('error')" alt="error" />
      <div class="desc">Z powodu błędu w zapisywaniu rozkładów jazdy w tej zakładce można do odwołania nacieszyć się animacją sygnału S1a. Jak naprawię to będzie :)</div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import imageMixin from "../mixins/imageMixin";


export default defineComponent({
  mixins: [imageMixin]
});
</script>

<style lang="scss" scoped>
.error-view {
  display: flex;
  justify-content: center;
  align-items: center;

  margin-top: 5em;

  padding: 1em;
}

.container {
  display: flex;
  justify-content: center;
  align-items: center;

  flex-direction: column;
  max-width: 500px;
}

.desc {
  text-align: center;
  font-size: 1.4em;
  margin-top: 1em;
}

img {
  width: 15em;
}
</style>
