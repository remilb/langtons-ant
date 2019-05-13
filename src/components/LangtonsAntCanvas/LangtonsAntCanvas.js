import React, { useRef, useEffect } from "react";
import { takeSteps } from "./langtonsAntUtils";
import { drawCells, clearCanvas, getCellColorFromCanvas } from "./drawingUtils";

export function LangtonsAntCanvas(props) {
  const {
    rules,
    cellType,
    cellSize,
    canvasWidth,
    canvasHeight,
    animInterval,
    isAnimating,
    prerenderSteps,
    isResetting,
    onResetComplete,
    onWheel
  } = props;

  const canvasRef = useRef(null);
  //Using ref instead of state to ensure synchronous canvas updates
  const antState = useRef({ pos: [0, 0], dir: 0 });
  const gridStateRef = useRef({});
  const primaryColor = Object.keys(rules)[0];

  useResize(canvasRef, canvasWidth, canvasHeight);

  // Handle zoom via cellSize change
  useEffect(() => {
    const canvas = canvasRef.current;
    clearCanvas(canvas, primaryColor);
    drawCells(canvas, cellType, gridStateRef.current, cellSize);
  }, [cellSize]);

  // Handle reset of canvas and related state
  useEffect(() => {
    if (isResetting) {
      const canvas = canvasRef.current;
      gridStateRef.current = {};
      antState.current = { pos: [0, 0], dir: 0 };
      clearCanvas(canvas, primaryColor);
      onResetComplete();
    }
  }, [isResetting, onResetComplete]);

  // Prerender steps
  useEffect(() => {
    if (isResetting) {
      const canvas = canvasRef.current;
      const { newPos, newDirIndex } = takeSteps(
        prerenderSteps,
        antState.current,
        gridStateRef.current,
        rules,
        cellType
      );
      antState.current = { pos: newPos, dir: newDirIndex };
      drawCells(canvas, cellType, gridStateRef.current, cellSize);
    }
  }, [prerenderSteps, rules, isResetting]);

  useAnimationFrame(
    () => {
      const canvas = canvasRef.current;
      const { newPos, newDirIndex, gridStateUpdates } = takeSteps(
        10,
        antState.current,
        gridStateRef.current,
        rules,
        cellType
      );
      antState.current = { pos: newPos, dir: newDirIndex };
      // Only draw updated cells
      drawCells(canvas, cellType, gridStateUpdates, cellSize);
    },
    isAnimating ? animInterval : null
  );

  return <canvas ref={canvasRef} onWheel={onWheel} />;
}

function useResize(canvasRef, width, height) {
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const oldWidth = canvas.width;
    const oldHeight = canvas.height;
    // Store current canvas data
    const curImage = ctx.getImageData(0, 0, oldWidth, oldHeight);
    // Resize
    const x = (width - oldWidth) / 2;
    const y = (height - oldHeight) / 2;
    canvas.width = width;
    canvas.height = height;
    // Redraw old data
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    ctx.putImageData(curImage, x, y);
  }, [width, height]);
}

function useAnimationFrame(callback, animInterval) {
  const savedCallback = useRef();
  const frameRef = useRef();
  const prevTimestamp = useRef(0);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  const animLoop = timestamp => {
    if (
      animInterval !== null &&
      timestamp - prevTimestamp.current >= animInterval
    ) {
      savedCallback.current();
      prevTimestamp.current = timestamp;
    }
    frameRef.current = requestAnimationFrame(animLoop);
  };

  useEffect(() => {
    frameRef.current = requestAnimationFrame(animLoop);
    return () => cancelAnimationFrame(frameRef.current);
  }, [animInterval]);
}
