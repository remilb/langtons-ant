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

export function drawCellsv2(canvas, cellType, cellData, cellSize) {
  const context = canvas.getContext("2d");
  const cellsByColor = groupByColor(cellData);

  for (const color in cellsByColor) {
    const cellsToDraw = cellsByColor[color];
    context.beginPath();
    for (const pos of cellsToDraw) {
      //const cellPos = pos.split(",");
      const canvasPos = canvasCoordsFromCellCoords(
        cellType,
        canvas.width,
        canvas.height,
        pos,
        cellSize
      );
      drawCell(context, cellType, canvasPos, cellSize);
    }
    context.fillStyle = color;
    context.fill();
  }
}

function groupByColor(cellData) {
  const byColor = {};
  for (const key in cellData) {
    const color = cellData[key].color;
    const pos = cellData[key].pos;
    if (color in byColor) {
      byColor[color].push(pos);
    } else {
      byColor[color] = [pos];
    }
  }
  return byColor;
}

export function clearCanvas(canvas, clearColor) {
  const ctx = canvas.getContext("2d");
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = clearColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.restore();
}

export function cellsInRect(x, y, w, h, cellType, cellSize) {
  return cellType === "square"
    ? squareCellsInRect(x, y, w, h, cellSize)
    : hexCellsInRect(x, y, w, h, cellSize);
}

function squareCellsInRect(x, y, w, h, cellSize) {
  const cells = [];
  const topLeftCorner = squareGridCoordsFromCanvas(x, y, cellSize);
  const widthInCells = w / cellSize;
  const heightInCells = h / cellSize;
  const margin = 1;

  cells.push(topLeftCorner);
  for (let xs = -margin; xs < widthInCells + margin; xs += 1) {
    for (let ys = -margin; ys < heightInCells + margin; ys += 1) {
      cells.push([topLeftCorner[0] + xs, topLeftCorner[1] + ys]);
    }
  }

  return cells;
}

function hexCellsInRect(x, y, w, h, cellSize) {
  const cells = [];
  const topLeftCorner = hexCoordsFromCanvas(x, y, cellSize);
  const widthInCells = w / cellSize;
  const heightInCells = h / cellSize;
  const margin = 1;

  cells.push(topLeftCorner);
  let xStart = 0;
  for (let ys = -margin; ys < heightInCells + margin; ys += 1) {
    xStart = ys % 2 === 0 ? xStart - 1 : xStart;
    for (
      let xs = xStart - margin;
      xs < widthInCells + xStart + margin;
      xs += 1
    ) {
      cells.push([topLeftCorner[0] + xs, topLeftCorner[1] + ys]);
    }
  }

  return cells;
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
  context.moveTo(...startingPoint);
  for (const point of remainingPoints) {
    context.lineTo(...point);
  }
  context.lineTo(...startingPoint);
}

function drawSquare(context, center, size) {
  context.rect(center[0], center[1], size, size);
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
  return [x, y];
}

function hexCoordsFromCanvas(x, y, cellSize) {
  const q = ((Math.sqrt(3) / 3) * x - y / 3) / cellSize;
  const r = (y * 2) / (cellSize * 3);
  return hexRound([q, r]);
}

function hexRound(axialCoords) {
  const [x, z] = [axialCoords[0], axialCoords[1]];
  const y = -(x + z);
  let [rx, ry, rz] = [Math.round(x), Math.round(y), Math.round(z)];
  const [xDiff, yDiff, zDiff] = [
    Math.abs(rx - x),
    Math.abs(ry - y),
    Math.abs(rz - z)
  ];
  if (xDiff > yDiff && xDiff > zDiff) {
    rx = -ry - rz;
  } else if (yDiff > zDiff) {
    ry = -rx - rz;
  } else {
    rz = -rx - ry;
  }
  return [rx, rz];
}

function canvasCoordsFromSquareGrid(
  canvasWidth,
  canvasHeight,
  cellPos,
  cellSize
) {
  return [cellPos[0] * cellSize, cellPos[1] * cellSize];
}

function squareGridCoordsFromCanvas(x, y, cellSize) {
  return [Math.floor(x / cellSize), Math.floor(y / cellSize)];
}

function rgbToHex(r, g, b) {
  return "#" + byteToHex(r) + byteToHex(g) + byteToHex(b);
}

function byteToHex(b) {
  let h = b.toString(16);
  return h.length === 2 ? h : "0" + h;
}
