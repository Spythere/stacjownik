<template>
  <div>
  </div>
</template>

<script lang="ts">
import Train from '@/scripts/interfaces/Train';
import { defineComponent } from 'vue'

export default defineComponent({
  props: {
    train: {
      type: Object as () => Train,
      required: true
    }
  },
  setup () {
    

    return {}
  },

  mounted() {
    console.log("test");
    
  }
})
</script>

<style scoped>

</style>