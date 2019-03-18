<template>
<svg
  class="bezier-curve"
  width="150"
  height="250"
  @mousedown="$emit('drag-start', $event)"
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
</template>

<script>
export default {
  name: 'BezierPreview',
  props: [
    'cubicBezierPathData',
    'linearLinePoints',
    'beginPoints',
    'endPoints'
  ],
}
</script>

<style lang="scss" scoped>
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
</style>
