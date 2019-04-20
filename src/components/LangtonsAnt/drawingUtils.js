export function drawCells(canvas, cellType, cellData, cellSize) {
  const context = canvas.getContext("2d");
  for (let pos in cellData) {
    const cellPos = pos.split(",");
    const canvasPos = canvasCoordsFromCellCoords(
      cellType,
      canvas.width,
      canvas.height,
      cellPos,
      cellSize
    );
    context.fillStyle = cellData[pos];
    drawCell(context, cellType, canvasPos, cellSize);
  }
}

export function getCellColorFromCanvas(canvas, cellType, cellPos, cellSize) {
  const context = canvas.getContext("2d");
  const canvasPos = canvasCoordsFromCellCoords(
    cellType,
    canvas.width,
    canvas.height,
    cellPos,
    cellSize
  );
  const cellSample = context.getImageData(canvasPos[0], canvasPos[1], 1, 1);
  const [r, g, b] = cellSample.data;
  return rgbToHex(r, g, b);
}

function drawCell(context, cellType, center, size) {
  const dispatchTable = { square: drawSquare, hex: drawHex };
  dispatchTable[cellType](context, center, size);
}

function drawHex(context, center, size) {
  const startingPoint = hexCorner(center, size, 0);
  const remainingPoints = [1, 2, 3, 4, 5].map(v => hexCorner(center, size, v));
  context.beginPath();
  context.moveTo(...startingPoint);
  for (const point of remainingPoints) {
    context.lineTo(...point);
  }
  context.closePath();
  context.fill();
}

function drawSquare(context, center, size) {
  context.fillRect(center[0], center[1], size, size);
}

function hexCorner(center, size, i) {
  const angle_deg = 60 * i - 30;
  const angle_rad = (Math.PI / 180) * angle_deg;
  return [
    center[0] + size * Math.cos(angle_rad),
    center[1] + size * Math.sin(angle_rad)
  ];
}

function canvasCoordsFromCellCoords(
  cellType,
  canvasWidth,
  canvasHeight,
  cellPos,
  cellSize
) {
  const projectionFuncs = {
    square: canvasCoordsFromSquareGrid,
    hex: canvasCoordsFromAxialHex
  };
  return projectionFuncs[cellType](
    canvasWidth,
    canvasHeight,
    cellPos,
    cellSize
  );
}

function canvasCoordsFromAxialHex(
  canvasWidth,
  canvasHeight,
  cellPos,
  cellSize
) {
  const x =
    cellSize * (Math.sqrt(3) * cellPos[0] + (Math.sqrt(3) / 2) * cellPos[1]);
  const y = cellSize * ((3 / 2) * cellPos[1]);
  return [canvasWidth / 2 + x, canvasHeight / 2 + y];
}

function canvasCoordsFromSquareGrid(
  canvasWidth,
  canvasHeight,
  cellPos,
  cellSize
) {
  return [
    canvasWidth / 2 + cellPos[0] * cellSize,
    canvasHeight / 2 + cellPos[1] * -cellSize
  ];
}

function rgbToHex(r, g, b) {
  return "#" + byteToHex(r) + byteToHex(g) + byteToHex(b);
}

function byteToHex(b) {
  let h = b.toString(16);
  return h.length === 2 ? h : "0" + h;
}
