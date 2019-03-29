import React, { useState, useRef, useEffect, useCallback } from "react";

function LangtonsAnt(props) {
  const {
    rules,
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
    const context = canvas.getContext("2d");

    let gridState = {};
    function getCurColor(curPos) {
      if (gridState[curPos] == undefined) {
        return "white";
      }
      return gridState[curPos]; // ? gridHeight[curPos] : "white";
    }

    let newPos = [0, 0];
    let newDir = [-1, 0];
    let newColor = "white";
    for (let i = 0; i < prerenderSteps; i++) {
      let oldPos = newPos.slice(0);
      ({ newPos, newDir, newColor } = takeStepV2(newPos, newDir, getCurColor));
      gridState[oldPos] = newColor;
    }

    for (let pos in gridState) {
      const [x, y] = pos.split(",");
      const [canvasX, canvasY] = [
        canvas.width / 2 + Number(x) * squareWidth,
        canvas.height / 2 + Number(y) * -squareWidth
      ];
      context.fillStyle = gridState[pos];
      context.fillRect(canvasX, canvasY, squareWidth, squareWidth);
    }

    antState.current = { pos: newPos, dir: newDir };
  }, [prerenderSteps]);

  useInterval(
    () => {
      const { newPos, newDir } = takeStep(
        canvasRef.current,
        antState.current.pos,
        antState.current.dir,
        squareWidth
      );

      antState.current = { pos: newPos, dir: newDir };
    },
    isAnimating ? animInterval : null
  );

  return <canvas ref={canvasRef} width={gridWidth} height={gridHeight} />;
}

function takeStepV2(curPos, curDir, getCurColor, rules) {
  let curColor = getCurColor(curPos);
  let newColor, newPos, newDir;
  //Execute rules based on current color
  //let {newPos, newDir, newColor} = executeRules()
  if (curColor === "white") {
    newColor = "black";
    newDir = [curDir[1], -curDir[0]];
  } else {
    newColor = "white";
    newDir = [-curDir[1], curDir[0]];
  }
  newPos = [curPos[0] + newDir[0], curPos[1] + newDir[1]];

  return { newPos, newDir, newColor };
}

function takeStep(canvas, curPos, curDir, squareWidth) {
  let newPos = [0, 0];
  let newDir = [0, 0];
  const ctx = canvas.getContext("2d");
  const [antCanvasX, antCanvasY] = [
    canvas.width / 2 + curPos[0] * squareWidth,
    canvas.height / 2 + curPos[1] * -squareWidth
  ];

  ctx.save();
  ctx.translate(antCanvasX, antCanvasY);

  // Not affected by transformation matrix
  const curSquare = ctx.getImageData(antCanvasX, antCanvasY, 1, 1);
  const [r, g, b] = curSquare.data;
  if (r === 255 && g === 255 && b === 255) {
    ctx.fillStyle = "black";
    newDir = [curDir[1], -curDir[0]];
  } else {
    ctx.fillStyle = "white";
    newDir = [-curDir[1], curDir[0]];
  }
  newPos = [curPos[0] + newDir[0], curPos[1] + newDir[1]];

  ctx.fillRect(0, 0, squareWidth, squareWidth);
  ctx.restore();

  return { newPos, newDir };
}

function executeRules(rules, curColor, curPos, curDir) {
  // return a new direction and position
  return;
}

// Courtesy of Dan Abramov
function useInterval(callback, delay) {
  const savedCallback = useRef();

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

export default LangtonsAnt;
