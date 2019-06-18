export function drawCells(canvas, cellType, cellData, cellSize) {
  const context = canvas.getContext("2d");
  for (let pos in cellData) {
    const cellPos = pos.split(",");
    const canvasPos = canvasCoordsFromCellCoords(cellType, cellPos, cellSize);
    context.fillStyle = cellData[pos];
    drawCell(context, cellType, canvasPos, cellSize);
  }
}

export function drawCellsv2(canvas, cellType, cellDataByColor, cellSize) {
  const context = canvas.getContext("2d");

  for (const color in cellDataByColor) {
    const cellsToDraw = cellDataByColor[color];
    context.beginPath();
    for (const pos of cellsToDraw) {
      const canvasPos = canvasCoordsFromCellCoords(cellType, pos, cellSize);
      drawCell(context, cellType, canvasPos, cellSize);
    }
    context.fillStyle = color;
    context.fill();
  }
}

export function addCellsToDrawQueue(drawQueue, cellsToAdd) {
  for (const color in cellsToAdd) {
    drawQueue[color].push.apply(drawQueue[color], cellsToAdd[color]);
  }
}

export function groupByColor(cellData) {
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

export function clearCanvas(ctx) {
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.restore();
}

export function shiftCanvas(ctx, dx, dy) {
  ctx.save();
  ctx.globalCompositeOperation = "copy";
  ctx.setTransform(1, 0, 0, 1, dx, dy);
  ctx.drawImage(ctx.canvas, 0, 0);
  ctx.restore();
}

export function cellsVisibleAfterShift(
  canvasWidth,
  canvasHeight,
  dx,
  dy,
  currentOffset,
  cellType,
  cellSize,
  boundingBox
) {
  const horizPanBox = {
    top: -currentOffset.y,
    left: dx < 0 ? canvasWidth + dx - currentOffset.x : -currentOffset.x,
    width: Math.abs(dx),
    height: canvasHeight
  };
  const vertPanBox = {
    top: dy < 0 ? canvasHeight + dy - currentOffset.y : -currentOffset.y,
    left: dx < 0 ? -currentOffset.x : -currentOffset.x + dx,
    width: canvasWidth - Math.abs(dx),
    height: Math.abs(dy)
  };

  const horizIntersect = boxIntersect(boundingBox, {
    ...horizPanBox,
    right: horizPanBox.left + horizPanBox.width,
    bottom: horizPanBox.top + horizPanBox.height
  });
  const vertIntersect = boxIntersect(boundingBox, {
    ...vertPanBox,
    right: vertPanBox.left + vertPanBox.width,
    bottom: vertPanBox.top + vertPanBox.height
  });

  const newlyVisibleX = horizIntersect
    ? cellsInRect(
        horizIntersect.left,
        horizIntersect.top,
        horizIntersect.right - horizIntersect.left,
        horizIntersect.bottom - horizIntersect.top,
        cellType,
        cellSize
      )
    : [];
  const newlyVisibleY = vertIntersect
    ? cellsInRect(
        vertIntersect.left,
        vertIntersect.top,
        vertIntersect.right - vertIntersect.left,
        vertIntersect.bottom - vertIntersect.top,
        cellType,
        cellSize
      )
    : [];

  // const newlyVisibleX = cellsInRect(
  //   horizPanBox.left,
  //   horizPanBox.top,
  //   horizPanBox.width,
  //   horizPanBox.height,
  //   cellType,
  //   cellSize
  // );

  // const newlyVisibleY = cellsInRect(
  //   vertPanBox.left,
  //   vertPanBox.top,
  //   vertPanBox.width,
  //   vertPanBox.height,
  //   cellType,
  //   cellSize
  // );

  return [...newlyVisibleX, ...newlyVisibleY];
}

function boxIntersect(box1, box2) {
  const xIntersect = intervalIntersect(
    [box1.left, box1.right],
    [box2.left, box2.right]
  );
  const yIntersect = intervalIntersect(
    [box1.top, box1.bottom],
    [box2.top, box2.bottom]
  );
  if (xIntersect && yIntersect) {
    return {
      top: yIntersect[0],
      left: xIntersect[0],
      right: xIntersect[1],
      bottom: yIntersect[1]
    };
  } else {
    return false;
  }
}

function intervalIntersect(interval1, interval2) {
  if (interval2[0] > interval1[1] || interval1[0] > interval2[1]) {
    return false;
  } else {
    return [
      Math.max(interval1[0], interval2[0]),
      Math.min(interval1[1], interval2[1])
    ];
  }
}

export function cellsInRect(x, y, w, h, cellType, cellSize) {
  return cellType === "square"
    ? squareCellsInRect(x, y, w, h, cellSize)
    : hexCellsInRect(x, y, w, h, cellSize);
}

function squareCellsInRect(x, y, w, h, cellSize) {
  const cells = [];
  const topLeftCorner = squareGridCoordsFromCanvas(x, y, cellSize);
  // +1 ensures no partial cells on right and bottom borders of rect are missed
  const widthInCells = w / cellSize + 1;
  const heightInCells = h / cellSize + 1;

  cells.push(topLeftCorner);
  for (let xs = 0; xs < widthInCells; xs += 1) {
    for (let ys = 0; ys < heightInCells; ys += 1) {
      cells.push([topLeftCorner[0] + xs, topLeftCorner[1] + ys]);
    }
  }

  return cells;
}

function hexCellsInRect(x, y, w, h, cellSize) {
  // TODO: Ewwww.....
  const cells = [];
  const topLeftCell = hexCoordsFromCanvas(x, y, cellSize);
  const hexCenter = canvasCoordsFromAxialHex(topLeftCell, cellSize);
  // +2 ensures no partial cells on right border of rect are missed
  const widthInCells = Math.ceil(w / (cellSize * Math.sqrt(3))) + 1;
  const heightInCells = h / cellSize;

  let shouldZag = hexCenter[0] - topLeftCell[0] > 0;
  let xStart = topLeftCell[0];

  cells.push(topLeftCell);
  for (let ys = -1; ys < heightInCells + 1; ys += 1) {
    for (
      let xs = xStart;
      xs < widthInCells + xStart + Number(!shouldZag);
      xs += 1
    ) {
      cells.push([xs, topLeftCell[1] + ys]);
    }
    xStart = shouldZag ? xStart - 1 : xStart;
    shouldZag = !shouldZag;
  }

  return cells;
}

export function getCellColorFromCanvas(canvas, cellType, cellPos, cellSize) {
  const context = canvas.getContext("2d");
  const canvasPos = canvasCoordsFromCellCoords(cellType, cellPos, cellSize);
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

export function canvasCoordsFromCellCoords(cellType, cellPos, cellSize) {
  const projectionFuncs = {
    square: canvasCoordsFromSquareGrid,
    hex: canvasCoordsFromAxialHex
  };
  return projectionFuncs[cellType](cellPos, cellSize);
}

function canvasCoordsFromAxialHex(cellPos, cellSize) {
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

function canvasCoordsFromSquareGrid(cellPos, cellSize) {
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
