import { ref, computed } from "vue";
import { clamp, isEqual } from "lodash-es";

const FRAME_WIDTH = 136;
const FRAME_HEIGHT = 136;
const OFFSET_TOP = 57;
const OFFSET_LEFT = 7;

const getDistance = (x1: number, y1: number, x2: number, y2: number) => {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
};

export const useBezier = ({
  dragstartCallback,
  dragendCallback,
}: {
  dragstartCallback: () => void;
  dragendCallback: () => void;
}) => {
  const cubicBezierValue = ref([0, 0, 1, 1]);

  const positions = ref({
    beginX: 0,
    beginY: 0,
    endX: 0,
    endY: 0,
  });

  const currentPositions = ref({
    beginX: 0,
    beginY: 0,
    endX: 0,
    endY: 0,
  });

  const dragItemType = ref<null | "begin" | "end">(null);
  const dragStartPosition = ref<null | Array<number>>(null);
  const lastMoveAmount = ref([0, 0]);

  const initBezier = (value: Array<number>) => {
    cubicBezierValue.value = [...value];
    setPositions(value);
  };

  const setPositions = (value: Array<number>) => {
    const [beginX, beginY, endX, endY] = value;

    positions.value = {
      beginX: FRAME_WIDTH * beginX,
      beginY: FRAME_HEIGHT - FRAME_HEIGHT * beginY,
      endX: FRAME_WIDTH * endX,
      endY: FRAME_HEIGHT - FRAME_HEIGHT * endY,
    };
  };

  const getAbsolutePoints = (points: Array<number>) => {
    return points.map((point, index: number) => {
      return index % 2 === 0 ? point + OFFSET_LEFT : point + OFFSET_TOP;
    });
  };

  const linearLinePoints = computed(() => {
    return getAbsolutePoints([0, FRAME_HEIGHT, FRAME_WIDTH, 0]);
  });

  const beginPoints = computed(() => {
    return getAbsolutePoints([
      0,
      FRAME_HEIGHT,
      positions.value.beginX,
      positions.value.beginY,
    ]);
  });

  const endPoints = computed(() => {
    return getAbsolutePoints([
      FRAME_WIDTH,
      0,
      positions.value.endX,
      positions.value.endY,
    ]);
  });

  const cubicBezierPathData = computed(() => {
    const [x1, y1, x2, y2] = beginPoints.value;
    const [x3, y3, x4, y4] = endPoints.value;
    return `M${x1} ${y1} C ${x2} ${y2}, ${x4} ${y4}, ${x3} ${y3}`;
  });

  const setCubicBezierValue = () => {
    const { beginX, beginY, endX, endY } = positions.value;
    const formatNumber = (number: number) => Number(number.toFixed(2));
    const nextCubicBezierValue = [
      beginX / FRAME_WIDTH,
      (FRAME_HEIGHT - beginY) / FRAME_HEIGHT,
      endX / FRAME_WIDTH,
      (FRAME_HEIGHT - endY) / FRAME_HEIGHT,
    ].map(formatNumber);

    cubicBezierValue.value = nextCubicBezierValue;

    // set display value to css defined easing name if cubicBezierValue matches

    // presets.CSS_DEFINED_EASING_LIST.some((preset) => {
    //   if (isEqual(preset.value, nextCubicBezierValue)) {
    //     cssDefinedEasing.value = preset.name;
    //     return true;
    //   } else {
    //     cssDefinedEasing.value = null;
    //     return false;
    //   }
    // });
  };

  const dragstart = (e: MouseEvent) => {
    const [startX, startY] = [e.offsetX - OFFSET_LEFT, e.offsetY - OFFSET_TOP];
    const { beginX, beginY, endX, endY } = positions.value;
    const distanceToBegin = getDistance(startX, startY, beginX, beginY);
    const distanceToEnd = getDistance(startX, startY, endX, endY);

    // set closer controller to move target
    dragStartPosition.value = [e.pageX, e.pageY];
    dragItemType.value = distanceToBegin < distanceToEnd ? "begin" : "end";

    // move target controller to clicked position
    if (dragItemType.value === "begin") {
      currentPositions.value = {
        ...positions.value,
        beginX: clamp(startX, 0, FRAME_WIDTH),
        beginY: startY,
      };
    } else {
      currentPositions.value = {
        ...positions.value,
        endX: clamp(startX, 0, FRAME_WIDTH),
        endY: startY,
      };
    }

    dragstartCallback();

    positions.value = { ...currentPositions.value };
    setCubicBezierValue();
  };

  const onDrag = (e: MouseEvent) => {
    if (!dragStartPosition.value) return;

    const [startX, startY] = dragStartPosition.value;
    const moveAmount = [startX - e.pageX, startY - e.pageY].map(
      (value) => ~value
    );

    if (isEqual(lastMoveAmount.value, moveAmount)) return;

    const [moveX, moveY] = moveAmount;
    const { beginX, beginY, endX, endY } = currentPositions.value;

    if (dragItemType.value === "begin") {
      positions.value = {
        ...currentPositions.value,
        beginX: clamp(beginX + moveX, 0, FRAME_WIDTH),
        beginY: beginY + moveY,
      };
    } else {
      positions.value = {
        ...currentPositions.value,
        endX: clamp(endX + moveX, 0, FRAME_WIDTH),
        endY: endY + moveY,
      };
    }

    lastMoveAmount.value = moveAmount;
    setCubicBezierValue();
  };

  const dragend = () => {
    if (dragItemType.value) {
      dragendCallback();
    }

    dragItemType.value = null;
    dragStartPosition.value = null;
  };

  return {
    cubicBezierValue,
    initBezier,
    setPositions,
    linearLinePoints,
    beginPoints,
    endPoints,
    cubicBezierPathData,
    dragstart,
    onDrag,
    dragend,
  };
};
