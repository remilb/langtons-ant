import React, { useRef, useEffect } from "react";
import { takeStep } from "./langtonsAntUtils";
import { drawCells, getCellColorFromCanvas } from "./drawingUtils";
import { useInterval } from "../../utils";

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
    onResetComplete
  } = props;

  const canvasRef = useRef(null);
  //Using ref instead of state to ensure synchronous canvas updates
  const antState = useRef({ pos: [0, 0], dir: 0 });

  // Initialize (or reset) canvas
  useEffect(() => {
    if (isResetting) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const initialColor = Object.keys(rules)[0];
      ctx.fillStyle = initialColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      let newPos = [0, 0];
      let newDirIndex = 0;
      let newColor = initialColor;
      let gridState = {};

      for (let i = 0; i < prerenderSteps; i++) {
        let oldPos = newPos.slice(0);
        ({ newPos, newDirIndex, newColor } = takeStep(
          newPos,
          newDirIndex,
          gridState[newPos] ? gridState[newPos] : initialColor,
          rules,
          cellType
        ));
        gridState[oldPos] = newColor;
      }
      drawCells(canvas, cellType, gridState, cellSize);

      antState.current = { pos: newPos, dir: newDirIndex };
      onResetComplete();
    }
  }, [isResetting, onResetComplete, prerenderSteps, rules]);

  useInterval(
    () => {
      const canvas = canvasRef.current;
      let curPos = antState.current.pos;
      let curDir = antState.current.dir;
      let curColor = getCellColorFromCanvas(canvas, cellType, curPos, cellSize);

      const { newPos, newDirIndex, newColor } = takeStep(
        curPos,
        curDir,
        curColor,
        rules,
        cellType
      );

      let cellData = {};
      cellData[curPos] = newColor;
      drawCells(canvas, cellType, cellData, cellSize);

      antState.current = { pos: newPos, dir: newDirIndex };
    },
    isAnimating ? animInterval : null
  );

  return <canvas ref={canvasRef} width={canvasWidth} height={canvasHeight} />;
}