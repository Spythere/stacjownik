<template>
  <div class="home">
    <Options />
    <List />
  </div>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";

import Options from "@/components/ui/Options.vue";
import List from "@/components/ui/List.vue";

@Component({
  components: { Options, List }
})
export default class Home extends Vue {
  mounted() {}
}
</script>

<style lang="scss" scoped>
.home {
  padding: 1rem;
}
</style>
