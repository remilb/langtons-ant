import React, { useRef, useEffect, useState } from "react";
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

  // Handle canvas pan
  const { offset, setOffset } = useClickAndDragPan(canvasRef);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    clearCanvas(canvas, primaryColor);
    ctx.setTransform(1, 0, 0, 1, offset.x, offset.y);
    drawCells(canvas, cellType, gridStateRef.current, cellSize);
  }, [offset]);

  // Handle zoom via cellSize change
  useEffect(() => {
    const canvas = canvasRef.current;
    clearCanvas(canvas, primaryColor);
    drawCells(canvas, cellType, gridStateRef.current, cellSize);
  }, [cellSize]);

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

function useClickAndDragPan(elementRef) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const lastPoint = useRef();

  useEffect(() => {
    const onMouseDown = e => {
      lastPoint.current = { x: e.clientX, y: e.clientY };
      isDragging.current = true;
    };

    const onMouseMove = e => {
      if (isDragging.current) {
        const deltaX = e.clientX - lastPoint.current.x;
        const deltaY = e.clientY - lastPoint.current.y;
        lastPoint.current = { x: e.clientX, y: e.clientY };
        setOffset(os => ({ x: os.x + deltaX, y: os.y + deltaY }));
      }
    };

    const onMouseUp = e => {
      if (isDragging) {
        isDragging.current = false;
      }
    };
    elementRef.current.addEventListener("mousedown", onMouseDown);
    elementRef.current.addEventListener("mousemove", onMouseMove);
    elementRef.current.addEventListener("mouseup", onMouseUp);
    elementRef.current.addEventListener("mouseout", onMouseUp);

    return () => {
      elementRef.current.removeEventListener("mousedown", onMouseDown);
      elementRef.current.removeEventListener("mousemove", onMouseMove);
      elementRef.current.removeEventListener("mouseup", onMouseUp);
      elementRef.current.addEventListener("mouseout", onMouseUp);
    };
  }, []);

  return { offset, setOffset };
}
