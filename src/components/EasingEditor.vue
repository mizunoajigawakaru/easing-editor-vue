<template>
  <div
    class="easing-editor"
    :class="{ dragging: dragItemType }"
  >
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

<script>
import { clamp, isEqual, range } from 'lodash';
import * as presets from '../constants/presets';
import BezierPreview from './BezierPreview.vue';
import BezierPresets from './BezierPresets.vue';
import BezierCurve from './BezierCurve.vue';
import BezierHeader from './BezierHeader.vue';

const FRAME_WIDTH = 136;
const FRAME_HEIGHT = 136;
const OFFSET_TOP = 57;
const OFFSET_LEFT = 7;
const PREVIEW_MOVE_DURATION = 1400;
const PREVIEW_FADE_OUT_DURATION = 100;
const PREVIEW_TOTAL_DURATION = PREVIEW_MOVE_DURATION + PREVIEW_FADE_OUT_DURATION;
const PREVIEW_TRACE_COUNT = 20;

export default {
  name: 'EasingEditor',
  components: {
    BezierPreview,
    BezierPresets,
    BezierCurve,
    BezierHeader,
  },
  props: ['value'],
  data() {
    return {
      cubicBezierValue: [0, 0, 1, 1],
      cubicBezierPathData: '',
      positions: {
        beginX: 0,
        beginY: 0,
        endX: 0,
        endY: 0,
      },
      dragItemType: null,
      dragStartPosition: null,
      dragstartX: 0,
      lastMoveAmount: [0, 0],

      // preset
      presetTypes: presets.PRESET_TYPES,
      selectedPresetType: null,
      cssDefinedEasing: null,
      devToolDefinedEasing: null,
      selectedPresetIndex: {
        [presets.PRESET_TYPE_EASE_IN_OUT]: 0,
        [presets.PRESET_TYPE_EASE_IN]: 0,
        [presets.PRESET_TYPE_EASE_OUT]: 0,
      },

      // preview
      previewAreaWidth: 218,
      bezierPreviewElement: null,
      animatonTracePositions: null,
      previewAnimation: null,
      previewIsRunning: false,
      previewPositions: null,
      startTime: 0,
      endTime: 0,
    };
  },
  watch: {
    cubicBezierValue() {
      this.$emit('input', this.cssDefinedEasing ? this.cssDefinedEasing : `cubic-bezier(${this.cubicBezierValue.join(', ')})`);
    },
  },
  created() {
    const formattedValue = this.value.replace(/(cubic-bezier\(|\))/g, '').split(',').map(Number);

    this.cubicBezierValue = [...formattedValue];
    this.setPositions([...formattedValue]);
    this.setCubicBezierPathData();
  },
  mounted() {
    window.addEventListener('mousemove', this.onDrag);
    window.addEventListener('mouseup', this.dragend);
    this.bezierPreviewElement = document.getElementById('bezier-preview');
    this.triggerPreview();
  },
  beforeDestroy() {
    window.removeEventListener('mousemove', this.onDrag);
    window.removeEventListener('mouseup', this.dragend);
  },
  computed: {
    displayValue() {
      if (this.devToolDefinedEasing) {
        return this.devToolDefinedEasing;
      } else if (this.cssDefinedEasing) {
        return this.cssDefinedEasing;
      } else {
        return `cubic-bezier(${this.cubicBezierValue.join(', ')})`;
      }
    },

    linearLinePoints() {
      return this.getAbsolutePoints([0, FRAME_HEIGHT, FRAME_WIDTH, 0]);
    },

    beginPoints() {
      const { beginX, beginY } = this.positions;
      return this.getAbsolutePoints([0, FRAME_HEIGHT, beginX, beginY]);
    },

    endPoints() {
      const { endX, endY } = this.positions;
      return this.getAbsolutePoints([FRAME_WIDTH, 0, endX, endY]);
    },
  },
  methods: {
    getDistance(x1, y1, x2, y2) {
      return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    },

    getBezier(t, currentPositions) {
      const start = { x: 0, y: FRAME_HEIGHT };
      const end = { x: FRAME_WIDTH, y: 0 };
      const {
        beginX,
        beginY,
        endX,
        endY,
      } = currentPositions;

      function getBezierPosition(P, t) {
        if (P.length === 1) return P[0];
        const left = getBezierPosition(P.slice(0, P.length - 1), t);
        const right = getBezierPosition(P.slice(1, P.length), t);
        return [(1 - t) * left[0] + t * right[0], (1 - t) * left[1] + t * right[1]];
      }

      return getBezierPosition([[start.x, start.y], [beginX, beginY], [endX, endY], [end.x, end.y]], t);
    },

    triggerPreview() {
      if (this.previewAnimation) cancelAnimationFrame(this.previewAnimation);

      this.previewPositions = { ...this.positions };
      this.previewIsRunning = true;
      this.setPreviewTraces();

      requestAnimationFrame(this.runPreview);
    },

    runPreview(timeStamp) {
      this.startTime = timeStamp;
      this.endTime = this.startTime + PREVIEW_TOTAL_DURATION;
      this.bezierPreviewElement.style.opacity = 1;
      this.drawPreview(timeStamp);
    },

    drawPreview(now) {
      if (!this.previewIsRunning) {
        this.bezierPreviewElement.style.transform = `translateX(${0}px)`;
        this.bezierPreviewElement.style.opacity = 0;
        return;
      }

      const elapsedTime = now - this.startTime;

      if (elapsedTime >= PREVIEW_TOTAL_DURATION) {
        this.previewIsRunning = false;
      }

      // move preview
      if (elapsedTime <= PREVIEW_MOVE_DURATION) {
        const moveTimeRatio = elapsedTime / PREVIEW_MOVE_DURATION;
        const position = this.previewAreaWidth - (this.previewAreaWidth * (this.getBezier(moveTimeRatio, this.previewPositions)[1] / FRAME_WIDTH));
        this.bezierPreviewElement.style.transform = `translateX(${position}px)`;
      }

      // fade out preview
      if (elapsedTime >= (PREVIEW_TOTAL_DURATION - PREVIEW_FADE_OUT_DURATION)) {
        const fadeOutTimeRatio = (elapsedTime - PREVIEW_MOVE_DURATION) / PREVIEW_FADE_OUT_DURATION;
        this.bezierPreviewElement.style.opacity = 1 - fadeOutTimeRatio;
      }

      this.previewAnimation = requestAnimationFrame(this.drawPreview);
    },

    applyPreset(name) {
      const appliedPreset = presets.PRESET_LISTS[name][this.selectedPresetIndex[name]];

      this.selectedPresetType = name;
      this.devToolDefinedEasing = appliedPreset.name;
      this.cubicBezierValue = appliedPreset.value;
      this.setPositions(appliedPreset.value);
      this.setCubicBezierPathData();
      this.cssDefinedEasing = name;

      this.triggerPreview();
    },

    setPositions(value) {
      const [beginX, beginY, endX, endY] = value;

      this.positions = {
        beginX: FRAME_WIDTH * beginX,
        beginY: FRAME_HEIGHT - (FRAME_HEIGHT * beginY),
        endX: FRAME_WIDTH * endX,
        endY: FRAME_HEIGHT - (FRAME_HEIGHT * endY),
      };
    },

    setCubicBezierValue() {
      const { beginX, beginY, endX, endY } = this.positions;
      const formatNumber = number => Number(number.toFixed(2));
      const nextCubicBezierValue = [
        beginX / FRAME_WIDTH,
        (FRAME_HEIGHT - beginY) / FRAME_HEIGHT,
        endX / FRAME_WIDTH,
        (FRAME_HEIGHT - endY) / FRAME_HEIGHT,
      ].map(formatNumber);

      this.cubicBezierValue = nextCubicBezierValue;

      // set display value to css defined easing name if cubicBezierValue matches
      presets.CSS_DEFINED_EASING_LIST.some(preset => {
        if (isEqual(preset.value, nextCubicBezierValue)) {
          this.cssDefinedEasing = preset.name;
          return true;
        } else {
          this.cssDefinedEasing = null;
        }
      });
    },

    setCubicBezierPathData() {
      const [x1, y1, x2, y2] = this.beginPoints;
      const [x3, y3, x4, y4] = this.endPoints;

      this.cubicBezierPathData = `M${x1} ${y1} C ${x2} ${y2}, ${x4} ${y4}, ${x3} ${y3}`;
    },

    setPreviewTraces() {
      const currentPositions = { ...this.positions };
      const keyFrames = range(PREVIEW_TRACE_COUNT + 1).map(index => {
        const currentTime = index / PREVIEW_TRACE_COUNT;
        return this.getBezier(currentTime, currentPositions);
      });
      const formatNumber = number => Number(number.toFixed(4));
      const transformed = keyFrames.map(frame => 1 - formatNumber(frame[1] / FRAME_WIDTH));

      this.animatonTracePositions = transformed;
    },

    dragstart(e) {
      const [startX, startY] = [e.offsetX - OFFSET_LEFT, e.offsetY - OFFSET_TOP];
      const { beginX, beginY, endX, endY } = this.positions;
      const distanceToBegin = this.getDistance(startX, startY, beginX, beginY);
      const distanceToEnd = this.getDistance(startX, startY, endX, endY);

      // set closer controller to move target
      this.dragstartX = startX;
      this.dragStartPosition = [e.pageX, e.pageY];
      this.dragItemType = distanceToBegin < distanceToEnd ? 'begin' : 'end';

      // move target controller to clicked position
      if (this.dragItemType === 'begin') {
        this.currentPositions = {
          ...this.positions,
          beginX: startX,
          beginY: startY,
        };
      } else {
        this.currentPositions = {
          ...this.positions,
          endX: startX,
          endY: startY,
        };
      }

      this.animatonTracePositions = null;
      this.selectedPresetType = null;
      this.cssDefinedEasing = null;
      this.devToolDefinedEasing = null;
      this.positions = { ...this.currentPositions };
      this.setCubicBezierValue();
      this.setCubicBezierPathData();
    },

    onDrag(e) {
      if (!this.dragStartPosition) return;

      const [startX, startY] = this.dragStartPosition;
      const moveAmount = [startX - e.pageX, startY - e.pageY].map(value => ~value);

      if (isEqual(this.lastMoveAmount, moveAmount)) return;

      const [moveX, moveY] = moveAmount;
      const { beginX, beginY, endX, endY } = this.currentPositions;

      if (this.dragItemType === 'begin') {
        this.positions = {
          ...this.currentPositions,
          beginX: clamp(beginX + moveX, 0, FRAME_WIDTH),
          beginY: beginY + moveY,
        };
      } else {
        this.positions = {
          ...this.currentPositions,
          endX: clamp(endX + moveX, 0, FRAME_WIDTH),
          endY: endY + moveY,
        };
      }

      this.lastMoveAmount = moveAmount;
      this.setCubicBezierValue();
      this.setCubicBezierPathData();
    },

    dragend() {
      if (this.dragItemType) {
        this.triggerPreview();
      }

      this.dragItemType = null;
      this.dragStartPosition = null;
    },

    getAbsolutePoints(points) {
      return points.map((point, index) => {
        return index % 2 === 0 ? point + OFFSET_LEFT : point + OFFSET_TOP;
      });
    },

    changePreset(count) {
      const currentIndex = this.selectedPresetIndex[this.selectedPresetType];
      const selectedPresetList = presets.PRESET_LISTS[this.selectedPresetType];
      const nextIndex = currentIndex + count === selectedPresetList.length
        ? 0 : currentIndex + count === -1
        ? selectedPresetList.length -1 : currentIndex + count;
      const nextSelectedPresetIndex = {
        ...this.selectedPresetIndex,
        [this.selectedPresetType]: nextIndex,
      };
      const selectedPreset = selectedPresetList[nextSelectedPresetIndex[this.selectedPresetType]];

      this.devToolDefinedEasing = selectedPreset.name;
      this.selectedPresetIndex = nextSelectedPresetIndex;
      this.cubicBezierValue = selectedPreset.value;
      this.setPositions(selectedPreset.value);
      this.setCubicBezierPathData();

      this.triggerPreview();
    },
  },
}
</script>

<style lang="scss" scoped>
.easing-editor {
  position: relative;
  width: 270px;
  height: 350px;
  padding: 16px;
  border-radius: 2px;
  overflow: hidden;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.05), 0 2px 4px rgba(0, 0, 0, 0.2), 0 2px 6px rgba(0, 0, 0, 0.1);
}

.bezier-container {
  display: flex;
  margin-top: 38px;
}
</style>
