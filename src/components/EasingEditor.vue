<template>
  <div class="easing-editor">
    <div class="bezier-container">
      <div class="bezier-presets">
        <div class="bezier-preset-category"></div>
        <div class="bezier-preset-category"></div>
        <div class="bezier-preset-category"></div>
      </div>
      <svg class="bezier-curve" width="150" height="250">
        <g>
          <line
            class="linear-line"
            :x1="absolutelinearLinePoints[0]"
            :y1="absolutelinearLinePoints[1]"
            :x2="absolutelinearLinePoints[2]"
            :y2="absolutelinearLinePoints[3]"
          />

          <path class="bezier-path" d="M7,193 C64.12, 193 85.88, 57 143, 57" />

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
export default {
  name: 'EasingEditor',
  data() {
    return {
      // [x1, y1, x2, y2]
      value: [0.45, 0.05, 0.55, 0.95],
      frame: {
        width: 136,
        height: 136,
      },
      offset: {
        top: 57,
        left: 7,
      },
      relativeLinearLinePoints: [0, 136, 136, 0],
    };
  },
  computed: {
    displayValue() {
      return `cubic-bezier(${this.value.join(' ')})`;
    },

    positions() {
      const { width, height } = this.frame;
      const [px1, py1, px2, py2] = this.value;

      const result = {
        x1: width * px1,
        y1: height - height * py1,
        x2: width * px2,
        y2: height - height * py2,
      };

      return result;
    },

    absolutelinearLinePoints() {
      return this.getOffsetAppliedPoints(this.relativeLinearLinePoints);
    },

    absoluteBeginControllerPoints() {
      const { x1, y1 } = this.positions;
      return this.getOffsetAppliedPoints([x1, y1]);
    },

    absoluteBeginControllerLinePoints() {
      const { height } = this.frame;
      const { x1, y1 } = this.positions;
      return this.getOffsetAppliedPoints([0, height, x1, y1]);
    },

    absoluteEndControllerPoints() {
      const { x2, y2 } = this.positions;
      return this.getOffsetAppliedPoints([x2, y2]);
    },

    absoluteEndControllerLinePoints() {
      const { width } = this.frame;
      const { x2, y2 } = this.positions;
      return this.getOffsetAppliedPoints([width, 0, x2, y2]);
    },
  },
  methods: {
    getOffsetAppliedPoints(points) {
      const result = points.map((point, index) => {
        return index % 2 === 0 ? point + this.offset.left : point + this.offset.top;
      });

      return result;
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
  }
}

.source-code {
  font-size: 11px;
  font-family: Menlo, monospace;
  font-weight: 400;
  color: #303942;
}
</style>
