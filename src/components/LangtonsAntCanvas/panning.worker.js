import {
  cellsVisibleAfterShift,
  canvasCoordsFromCellCoords
} from "./drawingUtils";

// Nested look up table allowing fast look up of wether or not a cell has been visited.
// This allows filtering out cells that have never been visited from panning results.
// Mirrors the gridState in the main thread by updates via message
// This map also keeps track of cells that are already queued for repaint in the main thread such
// that we don't pile the main thread with requests to repaint a given cell multiple times.
// This can very easily arise from rapid back and forth pannning
let visitedCells = {};

// Bounding box for region of canvas that has been painted. Keeping this up to date allows
// optimization of panning. When calculating cellsVisibleAfterShift(), rectangles can be cropped
// to the bounding box. Many rulesets produce near-convex structures that can be tightly bounded.
let boundingBox = { top: 0, left: 0, bottom: 0, right: 0 };

// TODO: needs to know about resetting grid state as well
onmessage = e => {
  if (e.data.action === "UPDATE_VISITED_CELLS") {
    updateVisitedCells(
      e.data.payload.cells,
      e.data.payload.cellType,
      e.data.payload.cellSize
    );
  } else if (e.data.action === "PANNING") {
    handlePanningEvent(...e.data.payload);
  } else if (e.data.action === "UPDATE_REPAINTED_CELLS") {
    unqueueCells(e.data.payload);
  } else if (e.data.action === "RESET") {
    visitedCells = {};
    boundingBox = { top: 0, left: 0, bottom: 0, right: 0 };
  }
};

function handlePanningEvent(
  canvasWidth,
  canvasHeight,
  dx,
  dy,
  currentOffset,
  cellType,
  cellSize
) {
  const newCells = cellsVisibleAfterShift(
    canvasWidth,
    canvasHeight,
    dx,
    dy,
    currentOffset,
    cellType,
    cellSize,
    boundingBox
  );
  const filteredCells = newCells.filter(
    cell => isCellVisited(cell) && !isAlreadyQueued(cell)
  );

  if (filteredCells.length > 0) {
    queueCells(filteredCells);
    self.postMessage(filteredCells); // eslint-disable-line no-restricted-globals
  }
}

function queueCells(cells) {
  for (const cell of cells) {
    visitedCells[cell].queued = true;
  }
}

function unqueueCells(cells) {
  for (const cell of cells) {
    visitedCells[cell].queued = false;
  }
}

function updateVisitedCells(newlyVisitedCells, cellType, cellSize) {
  for (const cell of newlyVisitedCells) {
    setCellVisited(cell);
    updateBoundingBox(cell, cellType, cellSize);
  }
}

function setCellVisited(cell) {
  visitedCells[cell] = { queued: false };
}

function isCellVisited(cell) {
  return visitedCells.hasOwnProperty(cell);
}

function isAlreadyQueued(cell) {
  return visitedCells[cell].queued;
}

function updateBoundingBox(cell, cellType, cellSize) {
  const canvasCoords = canvasCoordsFromCellCoords(cellType, cell, cellSize);
  // We need to pad a little bit to account for the canvasCoords of a cell being
  // in the center of hex cells and upper left corner of square cells
  if (canvasCoords[0] - cellSize < boundingBox.left) {
    boundingBox.left = canvasCoords[0] - cellSize;
  } else if (canvasCoords[0] + cellSize > boundingBox.right) {
    boundingBox.right = canvasCoords[0] + cellSize;
  }
  if (canvasCoords[1] - cellSize < boundingBox.top) {
    boundingBox.top = canvasCoords[1] - cellSize;
  } else if (canvasCoords[1] + cellSize > boundingBox.bottom) {
    boundingBox.bottom = canvasCoords[1] + cellSize;
  }
}
