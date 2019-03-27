import React, { useState, Fragment } from "react";
import {
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Grid,
  Paper,
  Typography,
  Button
} from "@material-ui/core";
import Slider from "@material-ui/lab/Slider";
import { PlayArrow, Pause, Replay } from "@material-ui/icons";

function Controls(props) {
  const {
    onPlayPause,
    isPlaying,
    minAnimInterval,
    maxAnimInterval,
    animInterval,
    handleAnimIntervalUpdate,
    handleReset
  } = props;

  return (
    <Paper>
      <Grid container alignItems="center" justify="center" spacing="16">
        <Grid item>
          <PlayPauseButton onPlayPause={onPlayPause} isPlaying={isPlaying} />
        </Grid>
        <Grid item>
          <Button variant="contained" onClick={handleReset}>
            Reset <Replay />
          </Button>
        </Grid>
      </Grid>
      <List>
        <ListItem>
          <ListItemText primary="Animation speed" />
          <Slider
            value={animInterval}
            min={maxAnimInterval}
            max={minAnimInterval}
            onChange={handleAnimIntervalUpdate}
          />
        </ListItem>
      </List>
    </Paper>
  );
}

function PlayPauseButton({ onPlayPause, isPlaying }) {
  return (
    <Button variant="contained" onClick={onPlayPause}>
      {isPlaying ? (
        <Fragment>
          Pause <Pause />
        </Fragment>
      ) : (
        <Fragment>
          Play <PlayArrow />
        </Fragment>
      )}
    </Button>
  );
}

export default Controls;
