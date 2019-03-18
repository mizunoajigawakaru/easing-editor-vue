export const PRESET_TYPE_EASE_IN_OUT = 'ease-in-out';
export const PRESET_TYPE_EASE_IN = 'ease-in';
export const PRESET_TYPE_EASE_OUT = 'ease-out';

export const PRESET_VALUES = [
    {
        name: PRESET_TYPE_EASE_IN_OUT,
        value: [0.42, 0, 0.58, 1],
    },
    {
        name: PRESET_TYPE_EASE_IN,
        value: [0.42, 0, 1, 1],
    },
    {
        name: PRESET_TYPE_EASE_OUT,
        value: [0, 0, 0.58, 1],
    },
];