<template>
  <div
    class="easing-editor"
    :class="{ dragging: dragItemType }"
  >
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
import { isEqual } from 'lodash';
import * as presets from '../constants/presets';
import BezierPresets from './BezierPresets.vue';
import BezierCurve from './BezierCurve.vue';
import BezierHeader from './BezierHeader.vue';

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

    applyPreset(name) {
      const appliedPreset = presets.PRESET_LISTS[name][this.selectedPresetIndex[name]];

      this.selectedPresetType = name;
      this.devToolDefinedEasing = appliedPreset.name;
      this.cubicBezierValue = appliedPreset.value;
      this.setPositions(appliedPreset.value);
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
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.05), 0 2px 4px rgba(0, 0, 0, 0.2), 0 2px 6px rgba(0, 0, 0, 0.1);
}

.bezier-container {
  display: flex;
  margin-top: 38px;
}
</style>
