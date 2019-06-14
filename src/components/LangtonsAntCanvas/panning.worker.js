import { cellsVisibleAfterShift } from "./drawingUtils";

// Nested look up table allowing fast look up of wether or not a cell has been visited.
// This allows filtering out cells that have never been visited from panning results.
// Mirrors the gridState in the main thread by updates via message
// This map also keeps track of cells that are already queued for repaint in the main thread such
// that we don't pile the main thread with requests to repaint a given cell multiple times.
// This can very easily arise from rapid back and forth pannning
let visitedCells = {};

// TODO: needs to know about resetting grid state as well
onmessage = e => {
  if (e.data.action === "UPDATE_VISITED_CELLS") {
    updateVisitedCells(e.data.payload);
  } else if (e.data.action === "PANNING") {
    handlePanningEvent(...e.data.payload);
  } else if (e.data.action === "UPDATE_REPAINTED_CELLS") {
    unqueueCells(e.data.payload);
  } else if (e.data.action === "RESET") {
    visitedCells = {};
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
    cellSize
  );
  const filteredCells = newCells.filter(
    cell => isCellVisited(cell) && !isAlreadyQueued(cell)
  );
  queueCells(filteredCells);

  if (filteredCells.length > 0) {
    self.postMessage(filteredCells);
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

function updateVisitedCells(newlyVisitedCells) {
  for (const cell of newlyVisitedCells) {
    setCellVisited(cell);
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
