<template>
  <div class="train-filters">
      <span v-for="category in availableCategories" :key="category">
          {{ category }}
      </span>
  </div>
</template>

<script lang="ts">
import Train from '@/scripts/interfaces/Train';
import { computed, defineComponent, inject, TrainFilter } from 'vue';

const defaultFilters: TrainFilter[] = [
    {
        id: "comments",
        isActive: true
    },
    {
        id: "twr",
        isActive: true
    },
    {
        id: "skr",
        isActive: true
    }
] 

export default defineComponent({
  props: {
      trainList: {
          type: Object as () => Train[],
          required: true
      }
  },
  
  setup(props) {
    const filters = inject('filtersActive') as TrainFilter[];
    const trainList = props.trainList;
    

    // Setup default train filters
    filters.push(...defaultFilters);

    const availableCategories = computed(() => trainList.reduce((acc, train) => {
        if(!train.timetableData) return acc;
        if(acc.includes(train.timetableData.category)) return acc;

        acc.push(train.timetableData.category);
        return acc;
    }, [] as string[]));
    
    
    // Remove unavailable train categories
    for(let filter of filters) {
        if(availableCategories.value.includes(filter.id)) continue;
        
        filters.slice(filters.indexOf(filter), -1);
    }

    return {
        availableCategories
    };
  },
});
</script>

<style lang="scss" scoped></style>
