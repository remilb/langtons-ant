import React, { useRef, useEffect, useState } from "react";
import { takeSteps } from "./langtonsAntUtils";
import {
  drawCellsv2,
  clearCanvas,
  cellsInRect,
  viewportToCanvasCoords
} from "./drawingUtils";
import { useDebounce } from "../../hooks";

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
  // Using ref instead of state to ensure synchronous canvas updates
  const antState = useRef({ pos: [0, 0], dir: 0 });
  const gridStateRef = useRef({});
  const primaryColor = Object.keys(rules)[0];

  const [dragData, setDragData] = useClickAndDragPan(canvasRef);

  useResize(canvasRef, canvasWidth, canvasHeight);

  // Handle reset of canvas and related state
  useEffect(() => {
    if (isResetting) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      gridStateRef.current = {};
      antState.current = { pos: [0, 0], dir: 0 };
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      clearCanvas(canvas, primaryColor);
      setDragData({
        delta: { x: 0, y: 0 },
        offset: {
          x: Math.floor(canvas.width / 2),
          y: Math.floor(canvas.height / 2)
        }
      });
      ctx.setTransform(
        1,
        0,
        0,
        1,
        Math.floor(canvas.width / 2),
        Math.floor(canvas.height / 2)
      );
      onResetComplete();
    }
  }, [isResetting, onResetComplete]);

  // Handle canvas pan
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.globalCompositeOperation = "copy";
    ctx.setTransform(1, 0, 0, 1, dragData.delta.x, dragData.delta.y);
    ctx.drawImage(canvas, 0, 0);
    ctx.setTransform(1, 0, 0, 1, dragData.offset.x, dragData.offset.y);
    ctx.globalCompositeOperation = "source-over";
    const leftEdge =
      dragData.delta.x < 0
        ? canvasWidth + dragData.delta.x - dragData.offset.x
        : -dragData.offset.x;

    const topEdge =
      dragData.delta.y < 0
        ? canvasHeight + dragData.delta.y - dragData.offset.y
        : -dragData.offset.y;

    const newlyVisibleX = cellsInRect(
      leftEdge,
      -dragData.offset.y,
      Math.abs(dragData.delta.x),
      canvasHeight,
      cellType,
      cellSize
    );
    const newlyVisibleY = cellsInRect(
      -dragData.offset.x,
      topEdge,
      canvasWidth,
      Math.abs(dragData.delta.y),
      cellType,
      cellSize
    );
    const newlyVisible = [...newlyVisibleX, ...newlyVisibleY];

    if (newlyVisible.length > 0) {
      const cellsToDraw = newlyVisible.reduce((cellData, pos) => {
        if (pos in gridStateRef.current) {
          cellData[pos] = gridStateRef.current[pos];
        }
        return cellData;
      }, {});
      drawCellsv2(canvas, cellType, cellsToDraw, cellSize);
    }
  }, [dragData]);

  // Handle zoom via cellSize change
  useEffect(() => {
    const canvas = canvasRef.current;
    clearCanvas(canvas, primaryColor);
    drawCellsv2(canvas, cellType, gridStateRef.current, cellSize);
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
      drawCellsv2(canvas, cellType, gridStateRef.current, cellSize);
    }
  }, [prerenderSteps, rules, isResetting]);

  // Main animation logic
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
      drawCellsv2(canvas, cellType, gridStateUpdates, cellSize);
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

function useClickAndDragPan(elementRef, useMouseOut = false) {
  const [dragData, setDragData] = useState({
    delta: { x: 0, y: 0 },
    offset: { x: 0, y: 0 }
  });
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
        setDragData(s => ({
          delta: { x: deltaX, y: deltaY },
          offset: { x: s.offset.x + deltaX, y: s.offset.y + deltaY }
        }));
      }
    };

    const onMouseUp = e => {
      if (isDragging) {
        isDragging.current = false;
      }
    };

    elementRef.current.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    elementRef.current.addEventListener("mouseup", onMouseUp);
    if (useMouseOut) {
      elementRef.current.addEventListener("mouseout", onMouseUp);
    }

    return () => {
      elementRef.current.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      elementRef.current.removeEventListener("mouseup", onMouseUp);
      if (useMouseOut) {
        elementRef.current.addEventListener("mouseout", onMouseUp);
      }
    };
  }, []);

  return [dragData, setDragData];
}
