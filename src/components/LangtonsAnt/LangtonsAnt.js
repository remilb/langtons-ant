import React, { useRef, useEffect } from "react";
import { takeStep } from "./langtonsAntUtils";
import { useInterval } from "../../utils";

export function LangtonsAnt(props) {
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
          rules
        ));
        gridState[oldPos] = newColor;
      }
      drawCells(canvas, gridState, squareWidth);

      antState.current = { pos: newPos, dir: newDirIndex };
      onResetComplete();
    }
  }, [isResetting, onResetComplete, prerenderSteps, rules]);

  useInterval(
    () => {
      const canvas = canvasRef.current;
      let curPos = antState.current.pos;
      let curDir = antState.current.dir;
      let curColor = getCellColorFromCanvas(canvas, curPos, squareWidth);

      const { newPos, newDirIndex, newColor } = takeStep(
        curPos,
        curDir,
        curColor,
        rules
      );

      let cellData = {};
      cellData[curPos] = newColor;
      drawCells(canvas, cellData, squareWidth);

      antState.current = { pos: newPos, dir: newDirIndex };
    },
    isAnimating ? animInterval : null
  );

  return <canvas ref={canvasRef} width={gridWidth} height={gridHeight} />;
}

function drawCells(canvas, cellData, cellWidth) {
  const context = canvas.getContext("2d");
  for (let pos in cellData) {
    const [x, y] = pos.split(",");
    // const [canvasX, canvasY] = [
    //   canvas.width / 2 + Number(x) * cellWidth,
    //   canvas.height / 2 + Number(y) * -cellWidth
    // ];
    const [canvasX, canvasY] = canvasCoordsFromAxialHex(
      [x, y],
      8,
      canvas.width,
      canvas.height
    );
    context.fillStyle = cellData[pos];
    //context.fillRect(canvasX, canvasY, cellWidth, cellWidth);
    drawHex(context, [canvasX, canvasY], 8);
  }
}

function canvasCoordsFromAxialHex(pos, size, canvasWidth, canvasHeight) {
  const x = size * (Math.sqrt(3) * pos[0] + (Math.sqrt(3) / 2) * pos[1]);
  const y = size * ((3 / 2) * pos[1]);
  return [canvasWidth / 2 + x, canvasHeight / 2 + y];
}

function drawHex(context, center, size) {
  const startingPoint = hex_corner(center, size, 0);
  const remainingPoints = [1, 2, 3, 4, 5].map(v => hex_corner(center, size, v));
  context.beginPath();
  context.moveTo(...startingPoint);
  for (const point of remainingPoints) {
    context.lineTo(...point);
  }
  context.closePath();
  context.fill();
}

function hex_corner(center, size, i) {
  const angle_deg = 60 * i - 30;
  const angle_rad = (Math.PI / 180) * angle_deg;
  return [
    center[0] + size * Math.cos(angle_rad),
    center[1] + size * Math.sin(angle_rad)
  ];
}

function getCellColorFromCanvas(canvas, pos, cellWidth) {
  const context = canvas.getContext("2d");
  // const [canvasX, canvasY] = [
  //   canvas.width / 2 + pos[0] * cellWidth,
  //   canvas.height / 2 + pos[1] * -cellWidth
  // ];
  const [canvasX, canvasY] = canvasCoordsFromAxialHex(
    pos,
    8,
    canvas.width,
    canvas.height
  );
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
