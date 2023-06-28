import { ref, computed, Ref } from "vue";
import * as presets from "../constants/presets";

export const usePresets = (
  callback: (presetValue: Array<number>) => void,
  cubicBezierValue: Ref<Array<number>>
) => {
  const presetTypes = presets.PRESET_TYPES;
  const selectedPresetType = ref<null | presets.presetType>(null);
  const cssDefinedEasing = ref<null | string>(null);
  const devToolDefinedEasing = ref<null | string>(null);
  const selectedPresetIndex = ref({
    [presets.PRESET_TYPE_EASE_IN_OUT]: 0,
    [presets.PRESET_TYPE_EASE_IN]: 0,
    [presets.PRESET_TYPE_EASE_OUT]: 0,
  });

  const applyPreset = (name: presets.presetType) => {
    const appliedPreset =
      presets.PRESET_LISTS[name][selectedPresetIndex.value[name]];

    selectedPresetType.value = name;
    devToolDefinedEasing.value = appliedPreset.name;
    cssDefinedEasing.value =
      selectedPresetIndex.value[name] === 0 ? name : null;

    // cubicBezierValue.value = appliedPreset.value
    // setPositions(appliedPreset.value)
    callback(appliedPreset.value);
  };

  const changePreset = (count: number) => {
    if (!selectedPresetType.value) {
      return;
    }

    const currentIndex = selectedPresetIndex.value[selectedPresetType.value];
    const selectedPresetList = presets.PRESET_LISTS[selectedPresetType.value];
    const nextIndex =
      currentIndex + count === selectedPresetList.length
        ? 0
        : currentIndex + count === -1
        ? selectedPresetList.length - 1
        : currentIndex + count;
    const nextSelectedPresetIndex = {
      ...selectedPresetIndex.value,
      [selectedPresetType.value]: nextIndex,
    };
    const selectedPreset =
      selectedPresetList[nextSelectedPresetIndex[selectedPresetType.value]];

    cssDefinedEasing.value = nextIndex === 0 ? selectedPreset.name : null;
    devToolDefinedEasing.value = selectedPreset.name;
    selectedPresetIndex.value = nextSelectedPresetIndex;

    callback(selectedPreset.value);
  };

  const resetPreset = () => {
    selectedPresetType.value = null;
    cssDefinedEasing.value = null;
    devToolDefinedEasing.value = null;
  };

  const displayValue = computed(() => {
    if (devToolDefinedEasing.value) {
      return devToolDefinedEasing.value;
    } else if (cssDefinedEasing.value) {
      return cssDefinedEasing.value;
    } else {
      return `cubic-bezier(${cubicBezierValue.value.join(", ")})`;
    }
  });

  return {
    presetTypes,
    selectedPresetType,
    selectedPresetIndex,
    applyPreset,
    changePreset,
    resetPreset,
    displayValue,
  };
};
