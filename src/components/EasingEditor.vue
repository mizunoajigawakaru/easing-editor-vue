<template>
  <div class="easing-editor">
    <div class="bezier-container">
      <bezier-presets
        :presets="presets"
        :selectedPresetType="selectedPresetType"
        @apply-preset="applyPreset"
      />
      <svg
        @mousemove="onDrag('bezier-curve', $event)"
        @mousedown="dragstart('begin', $event)"
        @mouseup="dragend('end')"
        class="bezier-curve"
        width="150"
        height="250"
      >
        <g>
          <line
            class="linear-line"
            :x1="linearLinePoints[0]"
            :y1="linearLinePoints[1]"
            :x2="linearLinePoints[2]"
            :y2="linearLinePoints[3]"
          />

          <path class="bezier-path" :d="cubicBezierPathData" />

          <line class="bezier-control-line"
            :x1="beginPoints[0]"
            :y1="beginPoints[1]"
            :x2="beginPoints[2]"
            :y2="beginPoints[3]"
          />
          <circle class="bezier-control-circle"
            :cx="beginPoints[2]"
            :cy="beginPoints[3]"
            r="7"
          />

          <line class="bezier-control-line"
            :x1="endPoints[0]"
            :y1="endPoints[1]"
            :x2="endPoints[2]"
            :y2="endPoints[3]"
          />
          <circle class="bezier-control-circle"
            :cx="endPoints[2]"
            :cy="endPoints[3]"
            r="7"
          />
        </g>
      </svg>
    </div>
    <div class="bezier-header">
      <span class="source-code bezier-display-value">{{ displayValue }}</span>
    </div>
  </div>
</template>

<script>
import { isEqual } from 'lodash';
import * as presets from '../constants/presets';
import BezierPresets from './BezierPresets.vue';

export default {
  name: 'EasingEditor',
  components: {
    BezierPresets,
  },
  data() {
    return {
      // [x1, y1, x2, y2]
      defaultValue: [0.45, 0.05, 0.55, 0.95],
      cubicBezierValue: [0, 0, 0, 0],
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
      dragStartPosition: null,
      lastMoveAmount: [0, 0],

      // preset
      presets: presets.PRESET_VALUES,
      selectedPresetType: null,
      cssDefinedEasing: null,
    };
  },
  created() {
    this.cubicBezierValue = [...this.defaultValue];
    this.setPositions([...this.defaultValue]);
    this.setCubicBezierPathData();
  },
  computed: {
    displayValue() {
      return this.cssDefinedEasing ? this.cssDefinedEasing :`cubic-bezier(${this.cubicBezierValue.join(', ')})`;
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

    applyPreset(name, value) {
      console.log('applyPreset', name);
      this.selectedPresetType = name;
      this.cubicBezierValue = value;
      this.setPositions(value);
      this.setCubicBezierPathData();
      this.cssDefinedEasing = name;
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
      this.presets.some(preset => {
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

    dragstart(itemType, e) {
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

      this.selectedPresetType = null;
      this.cssDefinedEasing = null;
      this.positions = { ...this.currentPositions };
      this.setCubicBezierValue();
      this.setCubicBezierPathData();
    },

    onDrag(item, e) {
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
      this.dragItemType = null;
      this.dragStartPosition = null;
    },

    getAbsolutePoints(points) {
      return [...points].map((point, index) => {
        return index % 2 === 0 ? point + this.offset.left : point + this.offset.top;
      });
    }
  },
}
</script>

<style lang="scss" scoped>
.easing-editor {
  width: 270px;
  height: 350px;
  padding: 16px;
  border-radius: 2px;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.05), 0 2px 4px rgba(0, 0, 0, 0.2), 0 2px 6px rgba(0, 0, 0, 0.1);
}

.bezier-container {
  display: flex;
  margin-top: 38px;
}

.bezier-curve {
  margin-top: -8px;
  margin-left: 32px;

  line.linear-line {
    stroke: rgb(238, 238, 238);
    stroke-width: 2;
    stroke-linecap: round;
    fill: none;
  }

  path.bezier-path {
    stroke: black;
    stroke-width: 3;
    stroke-linecap: round;
    fill: none;
  }

  line.bezier-control-line {
    stroke: #9C27B0;
    stroke-width: 2;
    stroke-linecap: round;
    fill: none;
    opacity: 0.6;
  }

  circle.bezier-control-circle {
    fill: #9C27B0;
    cursor: pointer;
  }
}

.bezier-header {
  margin-top: 16px;

  .bezier-display-value {
    display: block;
    width: 100%;
    text-align: center;
    white-space: nowrap;
  }
}

.source-code {
  font-size: 11px;
  font-family: Menlo, monospace;
  font-weight: 400;
  color: #303942;
}
</style>
