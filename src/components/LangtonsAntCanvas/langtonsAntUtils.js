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
  const gridStateUpdates = {};

  for (let i = 0; i < numSteps; i++) {
    let oldPos = newPos.slice(0);
    ({ newPos, newDirIndex, newColor } = takeStep(
      newPos,
      newDirIndex,
      gridState[newPos] ? gridState[newPos] : primaryColor,
      rules,
      cellType
    ));
    gridState[oldPos] = newColor;
    gridStateUpdates[oldPos] = newColor;
  }

  return { newPos, newDirIndex, gridStateUpdates };
}

export function takeStep(curPos, curDirIndex, curColor, rules, cellType) {
  const gridDirs =
    cellType === "square" ? SQUARE_GRID_DIRECTIONS : AXIAL_HEX_GRID_DIRECTIONS;

  let rule = rules[curColor];

  if (rule === undefined) {
    rule = { nextColor: "aqua", rotation: "r", numSteps: 1 };
  }
  let newColor = rule.nextColor;
  let newDirIndex = directionIndexFromRotation(rule.rotation, curDirIndex);
  newDirIndex =
    ((newDirIndex % gridDirs.length) + gridDirs.length) % gridDirs.length;
  let newDir = gridDirs[newDirIndex];

  let newPos = curPos.map((e, i) => e + newDir[i] * rule.numSteps);

  return { newPos, newDirIndex, newColor };
}

function directionIndexFromRotation(rot, dirIndex) {
  switch (rot) {
    case "n":
      return dirIndex;
    case "r":
      return dirIndex - 1;
    case "l":
      return dirIndex + 1;
    default:
      throw new Error("Invalid rotation supplied in rule set");
  }
}
