const SQUARE_GRID_DIRECTIONS = [[1, 0], [0, 1], [-1, 0], [0, -1]];
const AXIAL_HEX_GRID_DIRECTIONS = [
  [1, 0],
  [1, -1],
  [0, -1],
  [-1, 0],
  [-1, 1],
  [0, 1]
];

export function takeSteps(numSteps, antState, gridState, rules, cellType) {
  let newPos = antState.pos.slice(0);
  let newDirIndex = antState.dir;
  const primaryColor = Object.keys(rules)[0];
  let newColor = primaryColor;
  const updatedCells = [];

  for (let i = 0; i < numSteps; i++) {
    let oldPos = newPos.slice(0);
    ({ newPos, newDirIndex, newColor } = takeStep(
      newPos,
      newDirIndex,
      gridState[newPos] ? gridState[newPos].color : primaryColor,
      rules,
      cellType
    ));
    gridState[oldPos] = { color: newColor, pos: oldPos };
    updatedCells.push(oldPos);
  }

  return { newPos, newDirIndex, updatedCells };
}

export function takeStep(curPos, curDirIndex, curColor, rules, cellType) {
  const gridDirs =
    cellType === "square" ? SQUARE_GRID_DIRECTIONS : AXIAL_HEX_GRID_DIRECTIONS;

  const rule = rules[curColor];

  if (rule === undefined) {
    rule = { nextColor: "aqua", rotation: "r", numSteps: 1 };
  }
  const newColor = rule.nextColor;
  const newDirIndex = directionIndexFromRotation(
    rule.rotation,
    curDirIndex,
    cellType
  );
  const newDir = gridDirs[newDirIndex];

  const newPos = curPos.map((e, i) => e + newDir[i] * rule.numSteps);

  return { newPos, newDirIndex, newColor };
}

function directionIndexFromRotation(rot, dirIndex, cellType) {
  const numDirs = cellType === "square" ? 4 : 6;
  switch (rot) {
    case "n":
      return dirIndex;
    case "r":
      return mod(dirIndex - 1, numDirs);
    case "r2":
      return mod(dirIndex - 2, numDirs);
    case "l":
      return mod(dirIndex + 1, numDirs);
    case "l2":
      return mod(dirIndex + 2, numDirs);
    case "u":
      return mod(dirIndex + numDirs / 2, numDirs);
    default:
      throw new Error("Invalid rotation supplied in rule set");
  }
}

function mod(a, b) {
  return a - b * Math.floor(a / b);
}
