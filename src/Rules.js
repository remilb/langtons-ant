import React, { useState, Fragment } from "react";
import {
  Paper,
  Typography,
  Button,
  IconButton,
  Fab,
  List,
  ListItem,
  Select,
  MenuItem,
  Popover,
  ListItemSecondaryAction
} from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import DeleteIcon from "@material-ui/icons/Delete";
import { BlockPicker } from "react-color";

function generateValidRules(rules) {
  return Array.from(rules, (rule, index) => {
    let successorColor = rules[(index + 1) % rules.length].onColor;
    return rule.nextColor !== successorColor
      ? { ...rule, nextColor: successorColor }
      : rule;
  });
}

function Rules({ rules, onRulesChange }) {
  const ruleListItems = rules.map((rule, idx) => (
    <Rule
      key={idx}
      rule={rule}
      onRuleChange={newRule =>
        onRulesChange(
          generateValidRules(
            Array.from(rules, (oldRule, i) => (i === idx ? newRule : oldRule))
          )
        )
      }
    />
  ));

  return (
    <Paper>
      <List>{ruleListItems}</List>
      <Fab
        onClick={() =>
          onRulesChange([
            ...rules,
            {
              onColor: rules[rules.length - 1].nextColor,
              nextColor: rules[0].onColor,
              rotation: "l",
              numSteps: 1
            }
          ])
        }
      >
        <AddIcon />
      </Fab>
    </Paper>
  );
}

function Rule({ rule, onRuleChange }) {
  return (
    <ListItem>
      <Typography>
        On{" "}
        <PopoverColorPicker
          color={rule.onColor}
          onColorChange={c => {
            onRuleChange({ ...rule, onColor: c });
          }}
        />{" "}
        turn
        <Select
          value={rule.rotation}
          onChange={e => onRuleChange({ ...rule, rotation: e.target.value })}
        >
          <MenuItem value="l">Left</MenuItem>
          <MenuItem value="r">Right</MenuItem>
        </Select>
        and change to{" "}
        <PopoverColorPicker
          color={rule.nextColor}
          onColorChange={c => {
            onRuleChange({ ...rule, nextColor: c });
          }}
        />
      </Typography>
    </ListItem>
  );
}

function PopoverColorPicker({ color, onColorChange }) {
  let [anchorEl, setAnchorEl] = useState(null);
  const pickerVisible = Boolean(anchorEl);
  return (
    <Fragment>
      <Button
        variant="outlined"
        onClick={e => setAnchorEl(e.currentTarget)}
        style={{ backgroundColor: color }}
      />
      <Popover
        open={pickerVisible}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
      >
        <BlockPicker
          color={color}
          onChangeComplete={c => onColorChange(c.hex)}
        />
      </Popover>
    </Fragment>
  );
}

export default Rules;
