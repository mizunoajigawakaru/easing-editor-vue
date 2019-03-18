<template>
<div class="bezier-presets">
  <div
    class="bezier-preset-category"
    v-for="(preset, index) in presets"
    :key="index"
    @click="$emit('apply-preset', preset.value)"
  >
    <bezier-preset
      :value="preset.value"
    />
  </div>
</div>
</template>

<script>
import BezierPreset from './BezierPreset.vue';

export default {
  name: 'BezierPresets',
  props: ['presets'],
  components: {
    BezierPreset,
  },
}
</script>

<style lang="scss" scoped>
.bezier-presets {
  .bezier-preset-category {
    width: 50px;
    height: 50px;
    margin: 20px 0;
  }
}
</style>

