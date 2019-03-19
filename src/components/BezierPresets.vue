<template>
<div class="bezier-presets">
  <div
    class="bezier-preset-category"
    v-for="(preset, index) in presetTypes"
    :key="index"
    @click="$emit('apply-preset', preset)"
  >
    <bezier-preset
      :value="getPresetValue(preset)"
      :class="{ selected: preset === selectedPresetType }"
    />
  </div>
</div>
</template>

<script>
import BezierPreset from './BezierPreset.vue';
import * as presets from '../constants/presets';

export default {
  name: 'BezierPresets',
  props: ['presetTypes', 'selectedPresetIndex', 'selectedPresetType'],
  components: {
    BezierPreset,
  },
  methods: {
    getPresetValue(presetType) {
      return presets.PRESET_LISTS[presetType][this.selectedPresetIndex[presetType]].value;
    },
  },
}
</script>

<style lang="scss" scoped>
.bezier-presets {
  .bezier-preset-category {
    width: 50px;
    height: 50px;
    margin: 20px 0;
    cursor: pointer;
    transition: transform 100ms cubic-bezier(0.4, 0, 0.2, 1);

    &:active {
      transform: scale(1.05);
    }
  }
}
</style>

