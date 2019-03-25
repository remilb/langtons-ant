import React, { useState, useRef, useEffect } from "react";

function LangtonsAnt(props) {
  const { gridWidth, gridHeight, squareWidth, animInterval } = props;

  const [antState, setAntState] = useState({ pos: [0, 0], dir: [-1, 0] });
  const canvasRef = useRef(null);

  // Setup canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  useInterval(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const [antCanvasX, antCanvasY] = [
      canvas.width / 2 + antState.pos[0] * squareWidth,
      canvas.height / 2 + antState.pos[1] * -squareWidth
    ];

    ctx.save();
    ctx.translate(antCanvasX, antCanvasY);

    // Not affected by transformation matrix
    const curSquare = ctx.getImageData(antCanvasX, antCanvasY, 1, 1);
    const [r, g, b] = curSquare.data;
    let newDir = [0, 0];
    if (r === 255 && g === 255 && b === 255) {
      ctx.fillStyle = "black";
      newDir = [antState.dir[1], -antState.dir[0]];
    } else {
      ctx.fillStyle = "white";
      newDir = [-antState.dir[1], antState.dir[0]];
    }

    ctx.fillRect(0, 0, squareWidth, squareWidth);

    ctx.restore();

    let newPos = [antState.pos[0] + newDir[0], antState.pos[1] + newDir[1]];
    setAntState({ pos: newPos, dir: newDir });
  }, animInterval);

  return (
    <canvas
      ref={canvasRef}
      width={gridWidth}
      height={gridHeight}
      style={{ border: "4px solid #61DAFB", borderRadius: "5px" }}
    />
  );
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
