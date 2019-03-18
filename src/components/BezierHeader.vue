<template>
<div class="bezier-header">
  <svg
    v-if="selectedPresetType"
    class="bezier-preset-modify bezier-preset-minus"
    width="20"
    height="20"
    @click="$emit('change-preset', -1)"
  >
    <path d="M 12 6 L 8 10 L 12 14" />
  </svg>
  <svg
    v-if="selectedPresetType"
    class="bezier-preset-modify bezier-preset-plus"
    width="20"
    height="20"
    @click="$emit('change-preset', 1)"
  >
    <path d="M 8 6 L 12 10 L 8 14" />
  </svg>
  <span class="source-code bezier-display-value">{{ displayValue }}</span>
</div>
</template>

<script>
export default {
  name: 'BezierHeader',
  props: [
    'selectedPresetType',
    'displayValue',
  ],
}
</script>

<style lang="scss" scoped>
.bezier-header {
  margin-top: 16px;

  .bezier-display-value {
    display: block;
    width: 100%;
    height: 20px;
    line-height: 20px;
    text-align: center;
    white-space: nowrap;

    .dragging & {
      -webkit-user-select: none;
    }
  }

  .bezier-preset-modify {
    background-color: #f5f5f5;
    border-radius: 35px;
    display: inline-block;
    transition: transform 100ms cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer;
    position: absolute;

    &.bezier-preset-plus {
      right: 16px;
    }

    &:hover {
      background-color: #999;
    }
  }
}

.source-code {
  font-size: 11px;
  font-family: Menlo, monospace;
  font-weight: 400;
  color: #303942;
}
</style>
