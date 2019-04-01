import React, { useState, Fragment } from "react";
import {
  Paper,
  Typography,
  Button,
  List,
  ListItem,
  Popover
} from "@material-ui/core";
import { BlockPicker } from "react-color";

function Rules({ rules, onRulesChange }) {
  return (
    <Paper>
      <Typography>Rules</Typography>
      <List>
        {Object.keys(rules).map((key, idx) => {
          return (
            <Rule
              key={idx}
              rule={{ onColor: key, ...rules[key] }}
              onRuleChange={rule => {
                let onColor = rule.onColor;
                delete rule.onColor;
                let newRule = {};
                newRule[onColor] = rule;
                let newRules = { ...rules };
                delete newRules[key];
                newRules = { ...newRules, ...newRule };
                onRulesChange(newRules);
              }}
            />
          );
        })}
      </List>
    </Paper>
  );
}

function Rule({ rule, onRuleChange }) {
  return (
    <ListItem>
      <Typography>
        On
        <PopoverColorPicker
          color={rule.onColor}
          onColorChange={c => {
            onRuleChange({ ...rule, onColor: c });
          }}
        />
        turn left and change to
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
