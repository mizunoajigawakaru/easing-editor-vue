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
          <line class="linear-line" x1="7" y1="193" x2="143" y2="57"></line>
          <path class="bezier-path"></path>
          <line class="bezier-control-line"></line>
          <circle class="bezier-control-circle"></circle>
          <line class="bezier-control-line"></line>
          <circle class="bezier-control-circle"></circle>
        </g>
      </svg>
    </div>
    <div class="bezier-header">
      <span class="source-code bezier-display-value">cubic-bezier(0.42, 0, 0.58, 1)</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'EasingEditor',
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
