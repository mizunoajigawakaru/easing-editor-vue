<template>
  <div class="easing-editor">
    <bezier-preview
      :preview-area-width="previewAreaWidth"
      :animatonTracePositions="animatonTracePositions"
      @trigger-preview="triggerPreview"
    />
    <div class="bezier-container">
      <bezier-presets
        :preset-types="presetTypes"
        :selectedPresetIndex="selectedPresetIndex"
        :selectedPresetType="selectedPresetType"
        @apply-preset="applyPreset"
      />
      <bezier-curve
        :linear-line-points="linearLinePoints"
        :cubic-bezier-path-data="cubicBezierPathData"
        :begin-points="beginPoints"
        :end-points="endPoints"
        @drag-start="dragstart($event)"
      />
    </div>
    <bezier-header
      :selected-preset-type="selectedPresetType"
      :display-value="displayValue"
      @change-preset="changePreset"
    />
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, watch, onMounted } from "vue";
import { usePresets } from "../composables/presets";
import { useBezier } from "../composables/bezier";
import { usePreview } from "../composables/preview";
import BezierCurve from "./BezierCurve.vue";
import BezierPresets from "./BezierPresets.vue";
import BezierHeader from "./BezierHeader.vue";
import BezierPreview from "./BezierPreview.vue";

const props = defineProps(["modelValue"]);
const emit = defineEmits(["update:modelValue"]);

const {
  cubicBezierValue,
  initBezier,
  setPositions,
  linearLinePoints,
  beginPoints,
  endPoints,
  cubicBezierPathData,
  dragstart,
  onDrag,
  dragend,
} = useBezier({
  dragstartCallback: () => {
    resetPreset();
  },
  dragendCallback: () => {
    triggerPreview();
  },
});

// preset
const {
  presetTypes,
  selectedPresetType,
  selectedPresetIndex,
  applyPreset,
  changePreset,
  resetPreset,
  displayValue,
} = usePresets((presetValue) => {
  cubicBezierValue.value = presetValue;
  setPositions(presetValue);
  triggerPreview();
}, cubicBezierValue);

const {
  bezierPreviewElement,
  previewAreaWidth,
  animatonTracePositions,
  triggerPreview,
} = usePreview(cubicBezierValue);

const initialValue = props.modelValue
  .replace(/(cubic-bezier\(|\))/g, "")
  .split(",")
  .map(Number);

initBezier(initialValue);

watch(displayValue, () => {
  emit("update:modelValue", displayValue.value);
});

onMounted(() => {
  window.addEventListener("mousemove", onDrag);
  window.addEventListener("mouseup", dragend);
  bezierPreviewElement.value = document.getElementById("bezier-preview");
  triggerPreview();
});
</script>

<style lang="scss" scoped>
.easing-editor {
  position: relative;
  width: 270px;
  height: 350px;
  padding: 16px;
  border-radius: 2px;
  overflow: hidden;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.05), 0 2px 4px rgba(0, 0, 0, 0.2),
    0 2px 6px rgba(0, 0, 0, 0.1);
}

.bezier-container {
  display: flex;
  margin-top: 38px;
}
</style>
