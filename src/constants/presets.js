export const PRESET_TYPE_EASE_IN_OUT = 'ease-in-out';
export const PRESET_TYPE_EASE_IN = 'ease-in';
export const PRESET_TYPE_EASE_OUT = 'ease-out';

export const PRESET_TYPES = [
    PRESET_TYPE_EASE_IN_OUT,
    PRESET_TYPE_EASE_IN,
    PRESET_TYPE_EASE_OUT,
];

export const PRESET_LIST_EASE_IN_OUT = [
    {
        name: PRESET_TYPE_EASE_IN_OUT,
        value: [0.42, 0, 0.58, 1],
    },
    {
        name: 'In Out · Sine',
        value: [0.45, 0.05, 0.55, 0.95],
    },
    {
        name: 'In Out · Quadratic',
        value: [0.46, 0.03, 0.52, 0.96],
    },
    {
        name: 'In Out · Cubic',
        value: [0.65, 0.05, 0.36, 1],
    },
    {
        name: 'Fast Out, Slow In',
        value: [0.4, 0, 0.2, 1],
    },
    {
        name: 'In Out · Back',
        value: [0.68, -0.55, 0.27, 1.55],
    },
];

export const PRESET_LIST_EASE_IN = [
    {
        name: PRESET_TYPE_EASE_IN,
        value: [0.42, 0, 1, 1],
    },
    {
        name: 'In · Sine',
        value: [0.47, 0, 0.75, 0.72],
    },
    {
        name: 'In · Quadratic',
        value: [0.55, 0.09, 0.68, 0.53],
    },
    {
        name: 'In · Cubic',
        value: [0.55, 0.06, 0.68, 0.19],
    },
    {
        name: 'In · Back',
        value: [0.6, -0.28, 0.74, 0.05],
    },
    {
        name: 'Fast Out, Linear In',
        value: [0.4, 0, 1, 1],
    },
];

export const PRESET_LIST_EASE_OUT = [
    {
        name: PRESET_TYPE_EASE_OUT,
        value: [0, 0, 0.58, 1],
    },
    {
        name: 'Out · Sine',
        value: [0.39, 0.58, 0.57, 1],
    },
    {
        name: 'Out · Quadratic',
        value: [0.25, 0.46, 0.45, 0.94],
    },
    {
        name: 'Out · Cubic',
        value: [0.22, 0.61, 0.36, 1],
    },
    {
        name: 'Linear Out, Slow In',
        value: [0, 0, 0.2, 1],
    },
    {
        name: 'Out · Back',
        value: [0.18, 0.89, 0.32, 1.28],
    },
];

export const PRESET_LISTS = {
    [PRESET_TYPE_EASE_IN_OUT]: PRESET_LIST_EASE_IN_OUT,
    [PRESET_TYPE_EASE_IN]: PRESET_LIST_EASE_IN,
    [PRESET_TYPE_EASE_OUT]: PRESET_LIST_EASE_OUT,
};
