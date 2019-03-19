<template>
  <div
    class="easing-editor"
    :class="{ dragging: dragItemType }"
  >
    <div
      id="bezier-preview"
      class="bezier-preview-container"
      @click="triggerPreview"
    >
      <div class="bezier-preview-animation"></div>
    </div>
    <div class="bezier-preview">
      <div class="bezier-preview-onion" v-if="animatonTracePositions">
        <div
          class="bezier-preview-animation"
          v-for="(position, index) in animatonTracePositions"
          :key="index"
          :style="{ transform: `translateX(${getPosition(position)})` }">
        </div>
      </div>
    </div>
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
import { isEqual, range } from 'lodash';
import * as presets from '../constants/presets';
import BezierPresets from './BezierPresets.vue';
import BezierCurve from './BezierCurve.vue';
import BezierHeader from './BezierHeader.vue';

const PREVIEW_DURATION = 1600;
const PREVIEW_TRACE_COUNT = 20;

export default {
  name: 'EasingEditor',
  components: {
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
      frame: {
        width: 136,
        height: 136,
      },
      offset: {
        top: 57,
        left: 7,
      },
      relativeLinearLinePoints: [0, 136, 136, 0],
      dragItemType: null,
      dragStartPosition: null,
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
      previewIsRunning: false,
      previewPositions: null,
      startTime: 0,
      endTime: 0,
    };
  },
  watch: {
    cubicBezierValue() {
      this.$emit('input', [...this.cubicBezierValue]);
    },
  },
  created() {
    this.cubicBezierValue = [...this.value];
    this.setPositions([...this.value]);
    this.setCubicBezierPathData();
  },
  mounted() {
    window.addEventListener('mousemove', this.onDrag);
    window.addEventListener('mouseup', this.dragend);
    this.bezierPreviewElement = document.getElementById('bezier-preview');
    this.setPreview();
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
      return this.getAbsolutePoints(this.relativeLinearLinePoints);
    },

    beginPoints() {
      const { height } = this.frame;
      const { beginX, beginY } = this.positions;
      return this.getAbsolutePoints([0, height, beginX, beginY]);
    },

    endPoints() {
      const { width } = this.frame;
      const { endX, endY } = this.positions;
      return this.getAbsolutePoints([width, 0, endX, endY]);
    },
  },
  methods: {
    getDistance(x1, y1, x2, y2) {
      return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    },

    getBezier(t, currentPositions) {
      const { width, height } = this.frame;
      const start = { x: 0, y: height };
      const end = { x: width, y: 0 };
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

    getPosition(position) {
      return `${this.previewAreaWidth * position}px`;
    },

    triggerPreview() {
      console.log('triggerPreview', { ...this.positions });
      this.previewPositions = { ...this.positions };
      this.previewIsRunning = true;

      requestAnimationFrame(this.runPreview);
    },

    runPreview(timeStamp) {
      this.startTime = timeStamp;
      this.endTime = this.startTime + PREVIEW_DURATION;
      this.bezierPreviewElement.style.opacity = 1;
      this.drawPreview(timeStamp);
    },

    drawPreview(now) {
      if (!this.previewIsRunning) {
        this.bezierPreviewElement.style.transform = `translateX(${0}px)`;
        this.bezierPreviewElement.style.opacity = 0;
        return;
      };

      if (now - this.startTime >= PREVIEW_DURATION) {
        this.previewIsRunning = false;
      }

      const currentTime = (now - this.startTime) / PREVIEW_DURATION;
      const position = this.previewAreaWidth - (this.previewAreaWidth * (this.getBezier(currentTime, this.previewPositions)[1] / this.frame.width));

      this.bezierPreviewElement.style.transform = `translateX(${position}px)`;
      requestAnimationFrame(this.drawPreview);
    },

    applyPreset(name) {
      const appliedPreset = presets.PRESET_LISTS[name][this.selectedPresetIndex[name]];

      this.selectedPresetType = name;
      this.devToolDefinedEasing = appliedPreset.name;
      this.cubicBezierValue = appliedPreset.value;
      this.setPositions(appliedPreset.value);
      this.setCubicBezierPathData();
      this.cssDefinedEasing = name;

      this.setPreview();
      this.triggerPreview();
    },

    setPositions(value) {
      const { width, height } = this.frame;
      const [beginX, beginY, endX, endY] = value;

      this.positions = {
        beginX: width * beginX,
        beginY: height - (height * beginY),
        endX: width * endX,
        endY: height - (height * endY),
      };
    },

    setCubicBezierValue() {
      const { beginX, beginY, endX, endY } = this.positions;
      const { width, height } = this.frame;
      const formatNumber = number => Number(number.toFixed(2));
      const nextCubicBezierValue = [
        beginX / width,
        (height - beginY) / height,
        endX / width,
        (height - endY) / height,
      ].map(number => formatNumber(number));

      this.cubicBezierValue = nextCubicBezierValue;

      // set display value to css defined easing name if cubicBezierValue matches
      this.presetTypes.some(preset => {
        const presetConfig = presets.PRESET_LISTS[preset][0];

        if (isEqual(presetConfig.value, nextCubicBezierValue)) {
          this.cssDefinedEasing = presetConfig.name;
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

    setPreview() {
      const currentPositions = { ...this.positions };
      const keyFrames = range(PREVIEW_TRACE_COUNT + 1).map(index => {
        const currentTime = index / PREVIEW_TRACE_COUNT;
        return this.getBezier(currentTime, currentPositions);
      });
      const formatNumber = number => Number(number.toFixed(4));
      const transformed = keyFrames.map(frame => 1 - formatNumber(frame[1] / 136));

      this.animatonTracePositions = transformed;
    },

    dragstart(e) {
      const [startX, startY] = [e.offsetX - this.offset.left, e.offsetY - this.offset.top];
      const { beginX, beginY, endX, endY } = this.positions;
      const distanceToBegin = this.getDistance(startX, startY, beginX, beginY);
      const distanceToEnd = this.getDistance(startX, startY, endX, endY);

      // set closer controller to move target
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

      if (!isEqual(this.lastMoveAmount, moveAmount)) {
        const [moveX, moveY] = moveAmount;
        const { beginX, beginY, endX, endY } = this.currentPositions;

        if (this.dragItemType === 'begin') {
          this.positions = {
            ...this.currentPositions,
            beginX: beginX + moveX,
            beginY: beginY + moveY,
          };
        } else {
          this.positions = {
            ...this.currentPositions,
            endX: endX + moveX,
            endY: endY + moveY,
          };
        }

        this.lastMoveAmount = moveAmount;
      }

      this.setCubicBezierValue();
      this.setCubicBezierPathData();
    },

    dragend() {
      if (this.dragItemType) {
        this.setPreview();
        this.triggerPreview();
      }

      this.dragItemType = null;
      this.dragStartPosition = null;
    },

    getAbsolutePoints(points) {
      return [...points].map((point, index) => {
        return index % 2 === 0 ? point + this.offset.left : point + this.offset.top;
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

      this.setPreview();
      this.triggerPreview();
    },
  },
}
</script>

<style lang="scss" scoped>
.bezier-preview {
  margin-top: -20px;
}

.bezier-preview-container {
  position: relative;
  width: 200%;
  background-color: #fff;
  overflow: hidden;
  border-radius: 20px;
  height: 20px;
  z-index: 2;
  flex-shrink: 0;
}

.bezier-preview-animation {
  background-color: #9C27B0;
  width: 20px;
  height: 20px;
  border-radius: 20px;
  position: absolute;
  left: auto;
  top: auto;
  bottom: auto;
  right: auto;
}

.bezier-preview-onion {
  position: relative;
  z-index: 1;
}

.bezier-preview-onion > .bezier-preview-animation {
  opacity: 0.1;
}
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
