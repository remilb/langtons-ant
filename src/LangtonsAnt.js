import React, { useState, useRef, useEffect, useCallback } from "react";
import { useInterval } from "./utils";

function LangtonsAnt(props) {
  const {
    rules = {
      white: { nextColor: "black", rotation: "l", numSteps: 1 },
      black: { nextColor: "white", rotation: "r", numSteps: 1 }
    },
    gridWidth,
    gridHeight,
    squareWidth,
    animInterval,
    isAnimating,
    prerenderSteps,
    numResets
  } = props;

  const canvasRef = useRef(null);
  //Experiment using ref for state to ensure synchronous canvas updates
  const antState = useRef({ pos: [0, 0], dir: [-1, 0] });

  // Initialize (or reset) canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    antState.current = { pos: [0, 0], dir: [-1, 0] };
  }, [numResets]);

  useEffect(() => {
    const canvas = canvasRef.current;
    let gridState = {};
    let newPos = [0, 0];
    let newDir = [-1, 0];
    let newColor = "white";

    for (let i = 0; i < prerenderSteps; i++) {
      let oldPos = newPos.slice(0);
      ({ newPos, newDir, newColor } = takeStep(
        newPos,
        newDir,
        gridState[newPos] ? gridState[newPos] : "white",
        rules
      ));
      gridState[oldPos] = newColor;
    }

    drawCells(canvas, gridState, squareWidth);

    antState.current = { pos: newPos, dir: newDir };
  }, [prerenderSteps]);

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
  return r === 255 && g === 255 && b === 255 ? "white" : "black";
}

// function projectCoordinatesToCanvas()

function takeStep(curPos, curDir, curColor, rules) {
  //let curColor = curColor(curPos);
  let { newPos, newDir, newColor } = executeRules(
    rules,
    curColor,
    curPos,
    curDir
  );

  return { newPos, newDir, newColor };
}

function executeRules(rules, curColor, curPos, curDir) {
  let rule = rules[curColor];
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
