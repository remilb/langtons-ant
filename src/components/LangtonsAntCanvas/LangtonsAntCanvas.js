import React, {
  useRef,
  useEffect,
  useState,
  useImperativeHandle,
  useCallback,
  forwardRef
} from "react";
import { takeSteps } from "./langtonsAntUtils";
import {
  drawCellsv2,
  clearCanvas,
  cellsInRect,
  groupByColor
} from "./drawingUtils";

export const LangtonsAntCanvas = forwardRef((props, ref) => {
  const {
    rules,
    cellType,
    initialCellSize,
    beginAtStep,
    isAnimating,
    animInterval,
    width: canvasWidth,
    height: canvasHeight
  } = props;

  console.log("render");
  // Using refs instead of state due to imperative canvas drawing api, no need to trigger rerenders

  // Simulation state pieces
  const antStateRef = useRef({ pos: [0, 0], dir: 0 });
  const gridStateRef = useRef({});
  const stepCountRef = useRef(0);
  const currentCellTypeRef = useRef(cellType);
  const currentRulesRef = useRef(rules);

  // Drawing related state and constants
  const canvasRef = useRef();
  const cellSizeRef = useRef(initialCellSize);
  const primaryColor = Object.keys(rules)[0];
  const cellsToRedraw = useRef({});
  const stepsPerFrame = 10;
  const maxCellsPerFrame = 1000 - stepsPerFrame;
  const prevTimestampRef = useRef(0);

  // Used for panning
  const [dragData, setDragData] = useClickAndDragPan(canvasRef, {
    x: Math.floor(canvasWidth / 2),
    y: Math.floor(canvasHeight / 2)
  });

  /*** Imperative interface exposed on ref to LangtonsAntCanvas*/

  // Reset method
  // TODO: Fix memoization due to rules prop
  const initialize = useCallback(() => {
    // Clear canvas and reset transform
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    clearCanvas(ctx);
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

    // Reset simulation state
    gridStateRef.current = {};
    antStateRef.current = { pos: [0, 0], dir: 0 };

    // Update currentCellTypeRef and currentRulesRef to match most recent props
    currentCellTypeRef.current = cellType;
    currentRulesRef.current = rules;

    // Prerender up to beginAtStep
    const { newPos, newDirIndex } = takeSteps(
      beginAtStep,
      antStateRef.current,
      gridStateRef.current,
      currentRulesRef.current,
      currentCellTypeRef.current
    );
    antStateRef.current = { pos: newPos, dir: newDirIndex };
    drawCellsv2(
      canvas,
      currentCellTypeRef.current,
      groupByColor(gridStateRef.current),
      cellSizeRef.current
    );
  }, [beginAtStep, cellType, rules, setDragData]);

  // Set imperative methods
  useImperativeHandle(
    ref,
    () => ({
      reset: initialize
    }),
    [initialize]
  );

  /*** End of imperative interface */

  // Handle resizing of canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    clearCanvas(ctx);
    setDragData({
      delta: { x: 0, y: 0 },
      offset: {
        x: Math.floor(canvasWidth / 2),
        y: Math.floor(canvasHeight / 2)
      }
    });
    ctx.setTransform(
      1,
      0,
      0,
      1,
      Math.floor(canvasWidth / 2),
      Math.floor(canvasHeight / 2)
    );
    drawCellsv2(
      canvas,
      currentCellTypeRef.current,
      groupByColor(gridStateRef.current),
      cellSizeRef.current
    );
  }, [canvasWidth, canvasHeight, setDragData]);

  // Handle canvas pannig
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
        ? canvas.width + dragData.delta.x - dragData.offset.x
        : -dragData.offset.x;

    const topEdge =
      dragData.delta.y < 0
        ? canvas.height + dragData.delta.y - dragData.offset.y
        : -dragData.offset.y;

    const newlyVisibleX = cellsInRect(
      leftEdge,
      -dragData.offset.y,
      Math.abs(dragData.delta.x),
      canvas.height,
      currentCellTypeRef.current,
      cellSizeRef.current
    );
    const newlyVisibleY = cellsInRect(
      -dragData.offset.x,
      topEdge,
      canvas.width,
      Math.abs(dragData.delta.y),
      currentCellTypeRef.current,
      cellSizeRef.current
    );
    const newlyVisible = [...newlyVisibleX, ...newlyVisibleY];

    // Add newly visible cells to draw queue
    newlyVisible.forEach(pos => {
      if (pos in gridStateRef.current) {
        cellsToRedraw.current[pos] = pos;
      }
    });
  }, [dragData, cellsToRedraw]);

  // Handle zooming via cellSize change
  const handleWheel = e => {
    const canvas = canvasRef.current;
    let newCellSize = cellSizeRef.current;
    if (e.deltaY < 0) {
      newCellSize++;
    } else {
      newCellSize--;
    }
    cellSizeRef.current = newCellSize;
    clearCanvas(canvas.getContext("2d"));
    drawCellsv2(
      canvas,
      currentCellTypeRef.current,
      groupByColor(gridStateRef.current),
      cellSizeRef.current
    );
  };

  // Main animation logic
  useAnimationFrame(timestamp => {
    const canvas = canvasRef.current;
    const cellsToDraw = {};
    // Compute next steps and add to draw pool if we are animating and animInterval has elapsed
    if (isAnimating && timestamp - prevTimestampRef.current >= animInterval) {
      const { newPos, newDirIndex, updatedCells } = takeSteps(
        stepsPerFrame,
        antStateRef.current,
        gridStateRef.current,
        currentRulesRef.current,
        currentCellTypeRef.current
      );
      antStateRef.current = { pos: newPos, dir: newDirIndex };

      updatedCells.forEach(pos => {
        const cellColor = gridStateRef.current[pos]
          ? gridStateRef.current[pos].color
          : primaryColor;
        cellColor in cellsToDraw
          ? cellsToDraw[cellColor].push(pos)
          : (cellsToDraw[cellColor] = [pos]);
      });

      prevTimestampRef.current = timestamp;
      stepCountRef.current += stepsPerFrame;
    }

    // Add up to maxCellsPerFrame to draw pool regardless of whether we are animating
    // These include cells that need to be redrawn as part of a pan
    let drawCount = 0;
    for (let [key, pos] of Object.entries(cellsToRedraw.current)) {
      if (drawCount === maxCellsPerFrame) {
        break;
      }
      const cellColor = gridStateRef.current[key]
        ? gridStateRef.current[key].color
        : primaryColor;

      cellColor in cellsToDraw
        ? cellsToDraw[cellColor].push(pos)
        : (cellsToDraw[cellColor] = [pos]);
      delete cellsToRedraw.current[key];
      drawCount += 1;
    }

    drawCellsv2(
      canvas,
      currentCellTypeRef.current,
      cellsToDraw,
      cellSizeRef.current
    );
  });

  return (
    <div style={{ backgroundColor: primaryColor }}>
      <canvas ref={canvasRef} onWheel={handleWheel} />
    </div>
  );
});

function useAnimationFrame(callback) {
  const savedCallback = useRef();
  const frameRef = useRef();

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    const animLoop = timestamp => {
      savedCallback.current(timestamp);
      frameRef.current = requestAnimationFrame(animLoop);
    };

    frameRef.current = requestAnimationFrame(animLoop);
    return () => cancelAnimationFrame(frameRef.current);
  }, []);
}

function useClickAndDragPan(elementRef, initialOffset, useMouseOut = false) {
  const [dragData, setDragData] = useState({
    delta: { x: 0, y: 0 },
    offset: initialOffset
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

    const element = elementRef.current;

    element.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    element.addEventListener("mouseup", onMouseUp);
    if (useMouseOut) {
      element.addEventListener("mouseout", onMouseUp);
    }

    return () => {
      element.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      element.removeEventListener("mouseup", onMouseUp);
      if (useMouseOut) {
        element.addEventListener("mouseout", onMouseUp);
      }
    };
  }, [elementRef, useMouseOut]);

  return [dragData, setDragData];
}
