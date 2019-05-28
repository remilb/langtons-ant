import React, { useState } from "react";
import {
  Typography,
  Button,
  IconButton,
  Popover,
  Select,
  MenuItem,
  TextField,
  Paper
} from "@material-ui/core";
import ArrowRightIcon from "@material-ui/icons/ArrowRightAlt";
import DeleteIcon from "@material-ui/icons/Delete";
import { makeStyles } from "@material-ui/core/styles";
import { BlockPicker } from "react-color";

const useStyles = makeStyles(theme => ({
  ruleItem: {
    display: "flex",
    alignItems: "center",
    width: 350,
    height: 40,
    padding: theme.spacing(0, 2),
    margin: theme.spacing(1, 0)
  }
}));

function RuleItem(props) {
  const { rule, onRuleChange, onRuleRemove } = props;
  const classes = useStyles();
  return (
    <Paper className={classes.ruleItem}>
      <PopoverColorPicker
        color={rule.onColor}
        onColorChange={c => {
          onRuleChange({ ...rule, onColor: c });
        }}
      />
      <ArrowRightIcon />
      <Select
        value={rule.rotation}
        onChange={e => onRuleChange({ ...rule, rotation: e.target.value })}
      >
        <MenuItem value="l">Left</MenuItem>
        <MenuItem value="l2">Left Twice</MenuItem>
        <MenuItem value="r">Right</MenuItem>
        <MenuItem value="r2">Right Twice</MenuItem>
        <MenuItem value="n">No Turn</MenuItem>
        <MenuItem value="u">Around</MenuItem>
      </Select>
      <ArrowRightIcon />
      <TextField
        value={rule.numSteps}
        onChange={e => onRuleChange({ ...rule, numSteps: e.target.value })}
        type="number"
        InputLabelProps={{
          shrink: true
        }}
      />
      <Typography>steps</Typography>
      <IconButton size="small" onClick={onRuleRemove}>
        <DeleteIcon />
      </IconButton>
    </Paper>
  );
}

function PopoverColorPicker({ color, onColorChange }) {
  let [anchorEl, setAnchorEl] = useState(null);
  const pickerVisible = Boolean(anchorEl);
  return (
    <>
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
    </>
  );
}

export default RuleItem;
