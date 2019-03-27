import React, { useState, useRef, useEffect, useCallback } from "react";

function LangtonsAnt(props) {
  const {
    rules,
    gridWidth,
    gridHeight,
    squareWidth,
    animInterval,
    isAnimating,
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

  useInterval(
    () => {
      const { numSteps, rot } = takeStep(
        canvasRef.current,
        antState.current.pos,
        antState.current.dir,
        squareWidth
      );

      const newDir = [
        rot[0][0] * antState.current.dir[0] +
          rot[0][1] * antState.current.dir[1],
        rot[1][0] * antState.current.dir[0] +
          rot[1][1] * antState.current.dir[1]
      ];
      const newPos = [
        antState.current.pos[0] + newDir[0] * numSteps,
        antState.current.pos[1] + newDir[1] * numSteps
      ];

      antState.current = { pos: newPos, dir: newDir };
    },
    isAnimating ? animInterval : null
  );

  return <canvas ref={canvasRef} width={gridWidth} height={gridHeight} />;
}

function takeStep(canvas, curPos, curDir, squareWidth) {
  const ctx = canvas.getContext("2d");
  const [antCanvasX, antCanvasY] = [
    canvas.width / 2 + curPos[0] * squareWidth,
    canvas.height / 2 + curPos[1] * -squareWidth
  ];
  let [numSteps, rot] = [1, [0, 0]];

  ctx.save();
  ctx.translate(antCanvasX, antCanvasY);

  // Not affected by transformation matrix
  const curSquare = ctx.getImageData(antCanvasX, antCanvasY, 1, 1);
  const [r, g, b] = curSquare.data;
  if (r === 255 && g === 255 && b === 255) {
    ctx.fillStyle = "black";
    rot = [[0, 1], [-1, 0]];
    //newDir = [curDir[1], -curDir[0]];
  } else {
    ctx.fillStyle = "white";
    rot = [[0, -1], [1, 0]];
    //newDir = [-curDir[1], curDir[0]];
  }

  ctx.fillRect(0, 0, squareWidth, squareWidth);
  ctx.restore();

  return { numSteps: numSteps, rot: rot };
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
