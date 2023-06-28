import { ref, Ref } from "vue";
import { range } from "lodash-es";
import BezierEasing from "bezier-easing";

const PREVIEW_TRACE_COUNT = 20;
const PREVIEW_MOVE_DURATION = 1400;
const PREVIEW_FADE_OUT_DURATION = 100;
const PREVIEW_TOTAL_DURATION =
  PREVIEW_MOVE_DURATION + PREVIEW_FADE_OUT_DURATION;

export const usePreview = (cubicBezierValue: Ref<Array<number>>) => {
  const previewAreaWidth = 218;
  const previewCubicBezierValue = ref([0, 0, 1, 1]);
  const previewEasing = ref(BezierEasing(0, 0, 1, 1));
  const bezierPreviewElement = ref<null | HTMLElement>(null);
  const animatonTracePositions = ref<null | Array<number>>(null);
  const previewAnimation = ref<null | number>(null);
  const previewIsRunning = ref(false);
  const startTime = ref(0);
  const endTime = ref(0);

  const triggerPreview = () => {
    if (previewAnimation.value) {
      cancelAnimationFrame(previewAnimation.value);
    }

    previewCubicBezierValue.value = [...cubicBezierValue.value];
    previewEasing.value = BezierEasing(
      cubicBezierValue.value[0],
      cubicBezierValue.value[1],
      cubicBezierValue.value[2],
      cubicBezierValue.value[3]
    );
    previewIsRunning.value = true;
    setPreviewTraces();

    requestAnimationFrame(runPreview);
  };

  const setPreviewTraces = () => {
    const easing = BezierEasing(
      cubicBezierValue.value[0],
      cubicBezierValue.value[1],
      cubicBezierValue.value[2],
      cubicBezierValue.value[3]
    );
    const keyFrames = range(PREVIEW_TRACE_COUNT + 1).map((index) => {
      const currentTime = index / PREVIEW_TRACE_COUNT;
      return easing(currentTime);
    });

    animatonTracePositions.value = keyFrames;
  };

  const runPreview = (timeStamp: number) => {
    if (!bezierPreviewElement.value) {
      return;
    }
    startTime.value = timeStamp;
    endTime.value = startTime.value + PREVIEW_TOTAL_DURATION;
    bezierPreviewElement.value.style.opacity = "1";
    drawPreview(timeStamp);
  };

  const drawPreview = (now: number) => {
    if (!previewIsRunning.value) {
      resetPreview();
      return;
    }

    const elapsedTime = now - startTime.value;

    if (elapsedTime >= PREVIEW_TOTAL_DURATION) {
      previewIsRunning.value = false;
    }

    // move preview
    if (elapsedTime <= PREVIEW_MOVE_DURATION) {
      const moveTimeRatio = elapsedTime / PREVIEW_MOVE_DURATION;
      const position = previewAreaWidth * previewEasing.value(moveTimeRatio);

      if (bezierPreviewElement.value) {
        bezierPreviewElement.value.style.transform = `translateX(${position}px)`;
      }
    }

    // fade out preview
    if (elapsedTime >= PREVIEW_TOTAL_DURATION - PREVIEW_FADE_OUT_DURATION) {
      const fadeOutTimeRatio =
        (elapsedTime - PREVIEW_MOVE_DURATION) / PREVIEW_FADE_OUT_DURATION;
      if (bezierPreviewElement.value) {
        bezierPreviewElement.value.style.opacity = `${1 - fadeOutTimeRatio}`;
      }
    }

    previewAnimation.value = requestAnimationFrame(drawPreview);
  };

  const resetPreview = () => {
    if (bezierPreviewElement.value) {
      bezierPreviewElement.value.style.transform = "translateX(0px)";
      bezierPreviewElement.value.style.opacity = "0";
    }
    previewAnimation.value = null;
    return;
  };

  return {
    bezierPreviewElement,
    previewAreaWidth,
    animatonTracePositions,
    triggerPreview,
  };
};
