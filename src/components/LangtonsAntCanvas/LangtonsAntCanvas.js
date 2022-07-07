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
  shiftCanvas,
  scaleCanvas,
  groupByColor
} from "./drawingUtils";
import PanningWorker from "./panning.worker.js";
import { useRAFThrottle } from "../../hooks";

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
  // TODO: This color thing is busted right now
  const primaryColor = Object.keys(rules)[0];
  const cellsToRedraw = useRef([]);
  const stepsPerFrame = 10;
  const prevTimestampRef = useRef(0);

  // Used for panning
  const panningWorkerRef = usePanningWebWorker(e => {
    const newlyVisible = e.data;
    cellsToRedraw.current = cellsToRedraw.current.concat(newlyVisible);
  });

  const [dragData, setDragData] = useClickAndDragPan(canvasRef, {
    x: Math.floor(canvasWidth / 2),
    y: Math.floor(canvasHeight / 2)
  });
  const throttledDragData = useRAFThrottle(dragData);
  const prevThrottledDragData = usePrevious(throttledDragData);

  // Main animation loop callback
  const animLoop = timestamp => {
    const canvas = canvasRef.current;
    const cellsToDraw = {};
    for (const color in currentRulesRef.current) {
      cellsToDraw[color] = [];
    }
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
        const cellColor = gridStateRef.current[pos].color;
        cellsToDraw[cellColor].push(pos);
      });

      // Tell panning worker about newly visited cells
      panningWorkerRef.current.postMessage({
        action: "UPDATE_VISITED_CELLS",
        payload: {
          cells: updatedCells,
          cellType: currentCellTypeRef.current,
          cellSize: cellSizeRef.current
        }
      });

      prevTimestampRef.current = timestamp;
      stepCountRef.current += stepsPerFrame;
    }

    // const redrawCount = 10000;
    // const redrawBatch =
    //   cellsToRedraw.current.length > 0
    //     ? cellsToRedraw.current.slice(0, redrawCount)
    //     : [];
    // cellsToRedraw.current = cellsToRedraw.current.slice(redrawCount);
    for (let pos of cellsToRedraw.current) {
      const cellColor = gridStateRef.current[pos].color;
      cellsToDraw[cellColor].push(pos);
    }

    panningWorkerRef.current.postMessage({
      action: "UPDATE_REPAINTED_CELLS",
      payload: cellsToRedraw.current
    });

    cellsToRedraw.current = [];

    drawCellsv2(
      canvas,
      currentCellTypeRef.current,
      cellsToDraw,
      cellSizeRef.current
    );
  };

  /*** Imperative interface exposed on ref to LangtonsAntCanvas*/

  // Reset method
  // TODO: Fix memoization due to rules prop
  // TODO: Also will probably need to use worker.terminate() in here to prevent stale messages from bubbling through to the new run
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
    const { newPos, newDirIndex, updatedCells } = takeSteps(
      beginAtStep,
      antStateRef.current,
      gridStateRef.current,
      currentRulesRef.current,
      currentCellTypeRef.current
    );
    antStateRef.current = { pos: newPos, dir: newDirIndex };

    // Reset panning worker
    panningWorkerRef.current.postMessage({ action: "RESET" });
    cellsToRedraw.current = [];

    // Inform panning worker of visited cells
    panningWorkerRef.current.postMessage({
      action: "UPDATE_VISITED_CELLS",
      payload: {
        cells: updatedCells,
        cellType: currentCellTypeRef.current,
        cellSize: cellSizeRef.current
      }
    });

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

  // Handle canvas panning
  // TODO: This shouldn't run anymore than once per frame, right now it can run up to four times per frame!
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const [deltaX, deltaY] = [
      throttledDragData.offset.x - prevThrottledDragData.offset.x,
      throttledDragData.offset.y - prevThrottledDragData.offset.y
    ];
    shiftCanvas(ctx, deltaX, deltaY);
    ctx.setTransform(
      1,
      0,
      0,
      1,
      throttledDragData.offset.x,
      throttledDragData.offset.y
    );

    // Calculate cells that have "slid" into view
    panningWorkerRef.current.postMessage({
      action: "PANNING",
      payload: [
        ctx.canvas.width,
        ctx.canvas.height,
        deltaX,
        deltaY,
        throttledDragData.offset,
        currentCellTypeRef.current,
        cellSizeRef.current
      ]
    });
  }, [throttledDragData, prevThrottledDragData, panningWorkerRef]);

  // Handle zooming via cellSize change
  const handleWheel = e => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let newCellSize =
      e.deltaY < 0 ? cellSizeRef.current + 1 : cellSizeRef.current - 1;
    if (newCellSize > 0) {
      // scaleCanvas(
      //   ctx,
      //   newCellSize / cellSizeRef.current,
      //   throttledDragData.offset.x,
      //   throttledDragData.offset.y
      // );
      clearCanvas(ctx);
      panningWorkerRef.current.postMessage({
        action: "ZOOMING",
        payload: [
          canvasWidth,
          canvasHeight,
          throttledDragData.offset,
          currentCellTypeRef.current,
          newCellSize,
          cellSizeRef.current
        ]
      });
      cellSizeRef.current = newCellSize;
    }
  };

  // Run animation loop
  useAnimationLoop(animLoop);

  return (
    <div style={{ backgroundColor: primaryColor }}>
      <canvas ref={canvasRef} onWheel={handleWheel} />
    </div>
  );
});

function useAnimationLoop(callback) {
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

function usePanningWebWorker(messageHandler) {
  const panningWorker = useRef();
  useEffect(() => {
    panningWorker.current = new PanningWorker();
    panningWorker.current.onmessage = messageHandler;
    return () => panningWorker.current.terminate();
  }, []);
  return panningWorker;
}

function usePrevious(value) {
  const ref = useRef(value);
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}
