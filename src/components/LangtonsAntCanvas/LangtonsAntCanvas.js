import React, { useRef, useEffect, useState } from "react";
import { takeSteps } from "./langtonsAntUtils";
import {
  drawCellsv2,
  clearCanvas,
  cellsInRect,
  groupByColor
} from "./drawingUtils";

export function LangtonsAntCanvas(props) {
  const {
    rules,
    cellType,
    defaultCellSize,
    canvasWidth,
    canvasHeight,
    animInterval,
    isAnimating,
    prerenderSteps,
    isResetting,
    onResetComplete
  } = props;

  const canvasRef = useRef(null);
  // Using ref instead of state to ensure synchronous canvas updates
  const antState = useRef({ pos: [0, 0], dir: 0 });
  const gridStateRef = useRef({});

  const cellSize = useRef(2);
  const primaryColor = Object.keys(rules)[0];

  const cellsToRedraw = useRef({});
  const stepsPerFrame = 10;
  const maxCellsPerFrame = 1000 - stepsPerFrame;
  const prevTimestampRef = useRef(0);

  const [dragData, setDragData] = useClickAndDragPan(canvasRef);

  //useResize(canvasRef, canvasWidth, canvasHeight);

  // Handle reset of canvas and related state
  useEffect(() => {
    if (isResetting) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      gridStateRef.current = {};
      antState.current = { pos: [0, 0], dir: 0 };
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
      drawCellsv2(
        canvas,
        cellType,
        groupByColor(gridStateRef.current),
        cellSize.current
      );
    }
  }, [prerenderSteps, rules, isResetting]);

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
      cellSize.current
    );
    const newlyVisibleY = cellsInRect(
      -dragData.offset.x,
      topEdge,
      canvasWidth,
      Math.abs(dragData.delta.y),
      cellType,
      cellSize.current
    );
    const newlyVisible = [...newlyVisibleX, ...newlyVisibleY];

    // Add newly visible cells to draw queue
    newlyVisible.forEach(pos => {
      if (pos in gridStateRef.current) {
        cellsToRedraw.current[pos] = pos;
      }
    });
  }, [dragData, cellsToRedraw]);

  // Handle zoom via cellSize change
  const handleWheel = e => {
    const canvas = canvasRef.current;
    let newCellSize = cellSize.current;
    if (e.deltaY < 0) {
      newCellSize++;
    } else {
      newCellSize--;
    }
    cellSize.current = newCellSize;
    clearCanvas(canvas.getContext("2d"));
    drawCellsv2(
      canvas,
      cellType,
      groupByColor(gridStateRef.current),
      cellSize.current
    );
  };

  // useEffect(() => {
  //   const canvas = canvasRef.current;
  //   cellsInRect(0, 0, canvasWidth, canvasHeight);
  //   clearCanvas(canvas.getContext("2d"));
  //   drawCellsv2(canvas, cellType, groupByColor(gridStateRef.current), cellSize);
  // }, [cellSize]);

  // Main animation logic
  useAnimationFrame(timestamp => {
    const canvas = canvasRef.current;
    const cellsToDraw = {};
    // Compute next steps and add to draw pool if we are animating and animInterval has elapsed
    if (isAnimating && timestamp - prevTimestampRef.current >= animInterval) {
      const { newPos, newDirIndex, updatedCells } = takeSteps(
        stepsPerFrame,
        antState.current,
        gridStateRef.current,
        rules,
        cellType
      );
      antState.current = { pos: newPos, dir: newDirIndex };

      updatedCells.forEach(pos => {
        const cellColor = gridStateRef.current[pos]
          ? gridStateRef.current[pos].color
          : primaryColor;
        cellColor in cellsToDraw
          ? cellsToDraw[cellColor].push(pos)
          : (cellsToDraw[cellColor] = [pos]);
      });

      prevTimestampRef.current = timestamp;
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

    drawCellsv2(canvas, cellType, cellsToDraw, cellSize.current);
  });

  return (
    <div style={{ backgroundColor: primaryColor }}>
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        onWheel={handleWheel}
      />
    </div>
  );
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
    ctx.save();
    canvas.width = width;
    canvas.height = height;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    ctx.restore();
    // Redraw old data
    const x = Math.floor((width - oldWidth) / 2);
    const y = Math.floor((height - oldHeight) / 2);
    ctx.putImageData(curImage, x, y);
  }, [width, height]);
}

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
