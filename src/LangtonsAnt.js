import React, { useState, useRef, useEffect, useCallback } from "react";
import { useInterval } from "./utils";

function LangtonsAnt(props) {
  const {
    rules,
    gridWidth,
    gridHeight,
    squareWidth,
    animInterval,
    isAnimating,
    prerenderSteps,
    isResetting,
    onResetComplete
  } = props;

  const canvasRef = useRef(null);
  //Using ref instead of state to ensure synchronous canvas updates
  const antState = useRef({ pos: [0, 0], dir: [1, 0] });

  // Initialize (or reset) canvas
  useEffect(() => {
    if (isResetting) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const initialColor = Object.keys(rules)[0];
      ctx.fillStyle = initialColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      let newPos = [0, 0];
      let newDir = [1, 0];
      let newColor = initialColor;
      let gridState = {};

      for (let i = 0; i < prerenderSteps; i++) {
        let oldPos = newPos.slice(0);
        ({ newPos, newDir, newColor } = takeStep(
          newPos,
          newDir,
          gridState[newPos] ? gridState[newPos] : initialColor,
          rules
        ));
        gridState[oldPos] = newColor;
      }
      drawCells(canvas, gridState, squareWidth);

      antState.current = { pos: newPos, dir: newDir };
      onResetComplete();
    }
  }, [isResetting, onResetComplete, prerenderSteps, rules]);

  useInterval(
    () => {
      const canvas = canvasRef.current;
      let curPos = antState.current.pos;
      let curDir = antState.current.dir;
      let curColor = getCellColorFromCanvas(canvas, curPos, squareWidth);

      const { newPos, newDir, newColor } = takeStep(
        curPos,
        curDir,
        curColor,
        rules
      );

      let cellData = {};
      cellData[curPos] = newColor;
      drawCells(canvas, cellData, squareWidth);

      antState.current = { pos: newPos, dir: newDir };
    },
    isAnimating ? animInterval : null
  );

  return <canvas ref={canvasRef} width={gridWidth} height={gridHeight} />;
}

function drawCells(canvas, cellData, cellWidth) {
  const context = canvas.getContext("2d");
  for (let pos in cellData) {
    const [x, y] = pos.split(",");
    const [canvasX, canvasY] = [
      canvas.width / 2 + Number(x) * cellWidth,
      canvas.height / 2 + Number(y) * -cellWidth
    ];
    context.fillStyle = cellData[pos];
    context.fillRect(canvasX, canvasY, cellWidth, cellWidth);
  }
}

function getCellColorFromCanvas(canvas, pos, cellWidth) {
  const context = canvas.getContext("2d");
  const [canvasX, canvasY] = [
    canvas.width / 2 + pos[0] * cellWidth,
    canvas.height / 2 + pos[1] * -cellWidth
  ];
  const curSquare = context.getImageData(canvasX, canvasY, 1, 1);
  const [r, g, b] = curSquare.data;
  return rgbToHex(r, g, b);
}

function rgbToHex(r, g, b) {
  return "#" + byteToHex(r) + byteToHex(g) + byteToHex(b);
}

function byteToHex(b) {
  let h = b.toString(16);
  return h.length === 2 ? h : "0" + h;
}

function takeStep(curPos, curDir, curColor, rules) {
  let rule = rules[curColor];
  if (rule === undefined) {
    rule = { nextColor: "aqua", rotation: "r", numSteps: 1 };
  }
  let newColor = rule.nextColor;
  let newDir = applyRotation(rule.rotation, curDir);
  let newPos = curPos.map((e, i) => e + newDir[i] * rule.numSteps);
  return { newPos, newDir, newColor };
}

function applyRotation(rot, dir) {
  switch (rot) {
    case "r":
      return [dir[1], -dir[0]];
    case "l":
      return [-dir[1], dir[0]];
    default:
      throw new Error("Invalid rotation supplied in rule set");
  }
}

export default LangtonsAnt;
