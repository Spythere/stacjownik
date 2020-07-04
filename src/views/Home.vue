<template>
  <div class="home">
    <List />
  </div>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";

import List from "@/components/ui/List.vue";

@Component({
  components: { List }
})
export default class Home extends Vue {
  mounted() {}
}
</script>

<style lang="scss" scoped>
.home {
  overflow: auto;
  padding: 1rem;
}
</style>
