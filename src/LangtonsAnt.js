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
  const offscreenCanvasRef = useRef(document.createElement("canvas"));

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
    const offscreenCanvas = offscreenCanvasRef.current;
    offscreenCanvas.width = gridWidth;
    offscreenCanvas.height = gridHeight;
    let newPos = [0, 0];
    let newDir = [-1, 0];
    for (let i = 0; i < prerenderSteps; i++) {
      const { newPos: nextPos, newDir: nextDir } = takeStep(
        offscreenCanvas,
        newPos,
        newDir,
        squareWidth
      );
      newPos = nextPos;
      newDir = nextDir;
    }
    // const prerender = offscreenCanvas
    //   .getContext("2d")
    //   .getImageData(0, 0, offscreenCanvas.width, offscreenCanvas.height);
    canvasRef.current.getContext("2d").drawImage(offscreenCanvas, 0, 0);
    // canvasRef.current.getContext("2d").putImageData(prerender, 0, 0);
    antState.current = { pos: newPos, dir: newDir };
  }, [prerenderSteps, gridWidth, gridHeight]);

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
