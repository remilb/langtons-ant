import React, { useState, useRef, useEffect } from "react";

function LangtonsAnt(props) {
  const { gridWidth, gridHeight, squareWidth, animInterval } = props;

  const [antPos, setAntPos] = useState([0, 0]);
  const [antDir, setAntDir] = useState([-1, 0]);
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const [canvasX, canvasY] = [
      canvas.width / 2 + antPos[0] * squareWidth,
      canvas.height / 2 + antPos[1] * -squareWidth
    ];

    ctx.save();
    ctx.translate(canvasX, canvasY);

    // Not affected by transformation matrix
    const curSquare = ctx.getImageData(canvasX, canvasY, 1, 1);
    const [r, g, b] = curSquare.data;
    if (r === 255 && g === 255 && b === 255) {
      ctx.fillStyle = "black";
      setAntDir([antDir[1], -antDir[0]]);
    } else {
      ctx.fillStyle = "white";
      setAntDir([-antDir[1], antDir[0]]);
    }

    ctx.fillRect(0, 0, squareWidth, squareWidth);
    console.log("Drew new rect");
    ctx.restore();
  }, [antPos]);

  useInterval(() => {
    setAntPos([antPos[0] + antDir[0], antPos[1] + antDir[1]]);
    console.log("Updated ant's position");
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
