<template>
<svg
  class="bezier-preset"
  width="40"
  height="40"
>
  <g>
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
      r="2"
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
      r="2"
    />
  </g>
</svg>
</template>

<script>
export default {
  name: 'BezierPreset',
  props: ['value'],
  data() {
    return {
      cubicBezierPathData: '',
      offset: {
        top: 2,
        left: 2
      },
      frame: {
        width: 36,
        height: 36,
      },
    };
  },
  created() {
    this.setPositions(this.value);
    this.setCubicBezierPathData();
  },
  computed: {
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

    setCubicBezierPathData() {
      const [x1, y1, x2, y2] = this.beginPoints;
      const [x3, y3, x4, y4] = this.endPoints;

      this.cubicBezierPathData = `M${x1} ${y1} C ${x2} ${y2}, ${x4} ${y4}, ${x3} ${y3}`;
    },

    getAbsolutePoints(points) {
      return [...points].map((point, index) => {
        return index % 2 === 0 ? point + this.offset.left : point + this.offset.top;
      });
    },
  }
}
</script>

<style lang="scss" scoped>
.bezier-preset {
  width: 50px;
  height: 50px;
  padding: 5px;
  margin: auto;
  border-radius: 3px;
  background-color: #f5f5f5;

  line.linear-line {
    stroke: rgb(238, 238, 238);
    stroke-width: 2;
    stroke-linecap: round;
    fill: none;
  }

  path.bezier-path {
    stroke: black;
    stroke-width: 2;
    stroke-linecap: round;
    fill: none;
  }

  line.bezier-control-line {
    stroke: #666;
    stroke-width: 1;
    stroke-linecap: round;
    fill: none;
  }

  circle.bezier-control-circle {
    fill: #666;
  }
}
</style>

