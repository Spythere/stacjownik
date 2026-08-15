<template>
  <span v-if="level !== null" :class="`level-badge ${badgeType}`" :style="calculateLevelStyle()">
    {{ level >= 2 ? level : 'L' }}
  </span>
</template>

<script setup lang="ts">
const props = defineProps({
  badgeType: {
    type: String,
    required: true
  },

  level: {
    type: Number,
    required: true
  },

  isSupporter: {
    type: Boolean
  }
});

function calculateLevelStyle() {
  const bgColor =
    props.level >= -1
      ? props.level < 2
        ? '#26B0D9'
        : `hsl(${-props.level * 3.5 + 90},  85%, 50%)`
      : '#666';

  const fontColor = props.level == -1 || props.level > 17 ? 'white' : 'black';
  const boxShadow = props.isSupporter ? `0 0 6px 2px ${bgColor}` : '';

  return { 'background-color': bgColor, color: fontColor, 'box-shadow': boxShadow };
}
</script>

<style lang="scss" scoped>
.level-badge {
  display: inline-block;
  text-align: center;

  &.driver {
    border-radius: 50%;

    width: 1.65em;
    height: 1.65em;
    line-height: 1.65em;
    font-weight: bold;
  }

  &.dispatcher {
    border-radius: 0.25em;

    width: 1.6em;
    height: 1.6em;
    line-height: 1.6em;
    font-weight: bold;
  }

  &.scenery-req {
    border-radius: 50%;

    width: 2em;
    height: 2em;
    line-height: 2em;
  }

  &.scenery-dispatcher {
    border-radius: 0.25em;

    width: 2em;
    height: 2em;
    line-height: 2em;
  }
}
</style>
