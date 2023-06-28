<template>
  <div @click="$emit('trigger-preview')">
    <div id="bezier-preview" class="bezier-preview-container">
      <div class="bezier-preview-animation"></div>
    </div>
    <div class="bezier-preview">
      <div class="bezier-preview-onion" v-if="animatonTracePositions">
        <div
          class="bezier-preview-animation"
          v-for="(position, index) in animatonTracePositions"
          :key="index"
          :style="{ transform: `translateX(${getPosition(position)})` }"
        ></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "BezierPreview",
  props: ["previewAreaWidth", "animatonTracePositions"],
  methods: {
    getPosition(position) {
      return `${this.previewAreaWidth * position}px`;
    },
  },
};
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
  background-color: #9c27b0;
  width: 20px;
  height: 20px;
  border-radius: 20px;
  position: absolute;
}

.bezier-preview-onion {
  position: relative;
  z-index: 1;

  .bezier-preview-animation {
    opacity: 0.1;
  }
}
</style>
