const SQUARE_GRID_DIRECTIONS = [[1, 0], [0, 1], [-1, 0], [0, -1]];
const AXIAL_HEX_GRID_DIRECTIONS = [
  [1, 0],
  [1, -1],
  [0, -1],
  [-1, 0],
  [-1, 1],
  [0, 1]
];

export function takeStep(
  curPos,
  curDirIndex,
  curColor,
  rules,
  gridType = "hex"
) {
  const gridDirs =
    gridType === "square" ? SQUARE_GRID_DIRECTIONS : AXIAL_HEX_GRID_DIRECTIONS;

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

function applyRotation(rot, dir) {
  switch (rot) {
    case "r":
      return [dir[1], -dir[0]];
    case "l":
      return [-dir[1], dir[0]];
    default:
      throw new Error("Invalid rotation supplied in rule set");
  }
}
