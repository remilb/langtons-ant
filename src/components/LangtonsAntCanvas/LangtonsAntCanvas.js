import React, { useRef, useEffect } from "react";
import { takeStep } from "./langtonsAntUtils";
import { drawCells, clearCanvas, getCellColorFromCanvas } from "./drawingUtils";
import { useInterval } from "../../hooks";

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

  // Handle zoom
  useEffect(() => {
    const canvas = canvasRef.current;
    clearCanvas(canvas, primaryColor);
    drawCells(canvas, cellType, gridStateRef.current, cellSize);
  }, [cellSize]);

  // Initialize (or reset) canvas
  useEffect(() => {
    if (isResetting) {
      const canvas = canvasRef.current;
      clearCanvas(canvas, primaryColor);

      let newPos = [0, 0];
      let newDirIndex = 0;
      let newColor = primaryColor;
      gridStateRef.current = {};

      for (let i = 0; i < prerenderSteps; i++) {
        let oldPos = newPos.slice(0);
        ({ newPos, newDirIndex, newColor } = takeStep(
          newPos,
          newDirIndex,
          gridStateRef.current[newPos]
            ? gridStateRef.current[newPos]
            : primaryColor,
          rules,
          cellType
        ));
        gridStateRef.current[oldPos] = newColor;
      }
      drawCells(canvas, cellType, gridStateRef.current, cellSize);

      antState.current = { pos: newPos, dir: newDirIndex };
      onResetComplete();
    }
  }, [isResetting, onResetComplete, prerenderSteps, rules]);

  useAnimationFrame(
    () => {
      const gridState = gridStateRef.current;

      const canvas = canvasRef.current;
      let curPos = antState.current.pos;
      let curDir = antState.current.dir;
      let curColor = gridState[curPos] ? gridState[curPos] : primaryColor;

      const { newPos, newDirIndex, newColor } = takeStep(
        curPos,
        curDir,
        curColor,
        rules,
        cellType
      );

      gridState[curPos] = newColor;

      let cellData = {};
      cellData[curPos] = newColor;
      drawCells(canvas, cellType, cellData, cellSize);

      antState.current = { pos: newPos, dir: newDirIndex };
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
