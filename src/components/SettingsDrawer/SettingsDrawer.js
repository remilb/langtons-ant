import React from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Typography,
  FormControl,
  FormControlLabel,
  RadioGroup,
  Radio
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { Close } from "@material-ui/icons";
import Slider from "@material-ui/lab/Slider";

import RuleItem from "../RuleItem";

const useStyles = makeStyles(theme => ({
  settingsContainer: {
    display: "flex",
    zIndex: theme.zIndex.appBar - 1,
    flexDirection: "column",
    width: 320,
    padding: theme.spacing(10, 2, 2, 2),
    overflowX: "hidden" // Fix for Slider extra margin issue
    // Hack due to mui not allowing shadow when drawer variant is "persistent", despite material specs allowing it
    // boxShadow:
    //   "0px 5px 5px -3px rgba(0,0,0,0.2),0px 8px 10px 1px rgba(0,0,0,0.14),0px 3px 14px 2px rgba(0,0,0,0.12)"
  },

  settingsHeader: {
    height: 32,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  }
}));

function SettingsDrawer(props) {
  const {
    settings,
    handleSettingsChange,
    prerenderSteps,
    onPrerenderStepsChange,
    gridType,
    onGridTypeChange,
    onClose
  } = props;
  const classes = useStyles();

  return (
    <Drawer
      anchor="right"
      open={props.open}
      variant="persistent"
      classes={{ paper: classes.settingsContainer }}
      elevation={8}
    >
      <div className={classes.settingsHeader}>
        <Typography variant="h6">Settings</Typography>
        <IconButton onClick={onClose}>
          <Close />
        </IconButton>
      </div>

      <Typography>Prerender steps</Typography>
      <Slider
        value={settings.prerenderSteps}
        min={0}
        max={100000}
        step={1}
        onChange={(e, v) =>
          handleSettingsChange({ ...settings, prerenderSteps: v })
        }
      />

      <Typography>Grid type</Typography>
      <FormControl component="fieldset">
        <RadioGroup
          value={settings.gridType}
          onChange={(e, v) =>
            handleSettingsChange({ ...settings, gridType: v })
          }
        >
          <FormControlLabel
            value="square"
            control={<Radio />}
            label="Square"
            labelPlacement="end"
          />
          <FormControlLabel
            value="hex"
            control={<Radio />}
            label="Hex"
            labelPlacement="end"
          />
        </RadioGroup>
      </FormControl>
    </Drawer>
  );
}

export default SettingsDrawer;
