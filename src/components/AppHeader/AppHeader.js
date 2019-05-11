import React from "react";
import { AppBar, Toolbar, Typography, IconButton } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import SettingsIcon from "@material-ui/icons/Settings";

const useStyles = makeStyles(theme => ({
  title: {
    textAlign: "left",
    flexGrow: 1
  }
}));

function AppHeader(props) {
  const classes = useStyles();
  return (
    <AppBar position="fixed">
      <Toolbar>
        <IconButton onClick={props.handleClickRules} aria-label="Open rules">
          <SettingsIcon />
        </IconButton>
        <Typography variant="h6" color="inherit" className={classes.title}>
          Langton's Ant
        </Typography>
        <IconButton
          onClick={props.handleClickSettings}
          aria-label="Open settings"
        >
          <SettingsIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}

export default AppHeader;
