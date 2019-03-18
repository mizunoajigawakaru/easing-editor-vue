<template>
  <div class="easing-editor">
    <div class="bezier-container">
      <div class="bezier-presets">
        <div class="bezier-preset-category"></div>
        <div class="bezier-preset-category"></div>
        <div class="bezier-preset-category"></div>
      </div>
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
            :x1="absolutelinearLinePoints[0]"
            :y1="absolutelinearLinePoints[1]"
            :x2="absolutelinearLinePoints[2]"
            :y2="absolutelinearLinePoints[3]"
          />

          <path class="bezier-path" :d="cubicBezierPathData" />

          <line class="bezier-control-line"
            :x1="absoluteBeginControllerLinePoints[0]"
            :y1="absoluteBeginControllerLinePoints[1]"
            :x2="absoluteBeginControllerLinePoints[2]"
            :y2="absoluteBeginControllerLinePoints[3]"
          />
          <circle class="bezier-control-circle"
            :cx="absoluteBeginControllerPoints[0]"
            :cy="absoluteBeginControllerPoints[1]"
            r="7"
          />

          <line class="bezier-control-line"
            :x1="absoluteEndControllerLinePoints[0]"
            :y1="absoluteEndControllerLinePoints[1]"
            :x2="absoluteEndControllerLinePoints[2]"
            :y2="absoluteEndControllerLinePoints[3]"
          />
          <circle class="bezier-control-circle"
            :cx="absoluteEndControllerPoints[0]"
            :cy="absoluteEndControllerPoints[1]"
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

export default {
  name: 'EasingEditor',
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
    };
  },
  created() {
    this.cubicBezierValue = [...this.defaultValue];
    this.setPositions([...this.defaultValue]);
    this.setCubicBezierPathData();
  },
  computed: {
    displayValue() {
      return `cubic-bezier(${this.cubicBezierValue.join(', ')})`;
    },

    absolutelinearLinePoints() {
      return this.getOffsetAppliedPoints(this.relativeLinearLinePoints);
    },

    absoluteBeginControllerPoints() {
      const { beginX, beginY } = this.positions;
      return this.getOffsetAppliedPoints([beginX, beginY]);
    },

    absoluteBeginControllerLinePoints() {
      const { height } = this.frame;
      const { beginX, beginY } = this.positions;
      return this.getOffsetAppliedPoints([0, height, beginX, beginY]);
    },

    absoluteEndControllerPoints() {
      const { endX, endY } = this.positions;
      return this.getOffsetAppliedPoints([endX, endY]);
    },

    absoluteEndControllerLinePoints() {
      const { width } = this.frame;
      const { endX, endY } = this.positions;
      return this.getOffsetAppliedPoints([width, 0, endX, endY]);
    },
  },
  methods: {
    getDistance(x1, y1, x2, y2) {
      return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
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
    },

    setCubicBezierPathData() {
      const [x1, y1, x2, y2] = this.absoluteBeginControllerLinePoints;
      const [x3, y3, x4, y4] = this.absoluteEndControllerLinePoints;

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

    getOffsetAppliedPoints(points) {
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

.bezier-presets {
  .bezier-preset-category {
    width: 50px;
    height: 50px;
    margin: 20px 0;
    background-color: #f5f5f5;
  }
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
