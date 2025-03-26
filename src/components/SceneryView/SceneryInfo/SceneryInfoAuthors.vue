<template>
  <section
    class="scenery-authors"
    v-if="station?.generalInfo?.authors && station.generalInfo.authors.length > 0"
  >
    <b>
      {{
        $t(
          'scenery.authors-title',
          { authors: station.generalInfo.authors.length },
          station.generalInfo.authors.length
        )
      }}:
    </b>
    {{ station.generalInfo.authors.join(', ') }}
  </section>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { Station } from '../../../typings/common';

export default defineComponent({
  props: {
    station: {
      type: Object as PropType<Station>
    }
  }
});
</script>