<template>
  <div class="stations-view">
    <List />
  </div>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";

// import Options from "@/components/ui/Options.vue";
import List from "@/components/ui/List.vue";

@Component({
  components: { List },
})
export default class Home extends Vue {
  mounted() {}
}
</script>

<style lang="scss" scoped>
.stations-view {
  padding: 1rem 0;

  max-height: 100%;
}
</style>
