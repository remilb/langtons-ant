import React from "react";
import { Typography, Paper, IconButton } from "@material-ui/core";
import Slider from "@material-ui/lab/Slider";
import { makeStyles } from "@material-ui/core/styles";
import { PlayArrow, Pause, Replay, Fullscreen } from "@material-ui/icons";

const useStyles = makeStyles(theme => ({
  root: {
    display: "flex",
    flexDirection: "column",
    position: "absolute",
    width: 300,
    margin: "0 auto",
    padding: 12,
    left: 0,
    right: 0,
    bottom: 48
  },

  playbackButtons: {
    display: "flex",
    justifyContent: "center"
  },

  animSpeedControl: {
    display: "flex",
    alignItems: "center"
  }
}));

function PlaybackControls(props) {
  const classes = useStyles();

  const {
    isPlaying,
    onPlayPause,
    handleReset,
    onAnimIntervalUpdate,
    animInterval,
    maxAnimInterval,
    minAnimInterval
  } = props;

  return (
    <Paper elevation={4} className={classes.root}>
      <div className={classes.playbackButtons}>
        <IconButton onClick={handleReset}>
          <Replay />
        </IconButton>
        <PlayPauseButton onPlayPause={onPlayPause} isPlaying={isPlaying} />
        <IconButton variant="contained" onClick={handleReset}>
          <Fullscreen />
        </IconButton>
      </div>
      <div className={classes.animSpeedControl}>
        <Typography>Slower</Typography>
        <Slider
          value={animInterval}
          min={maxAnimInterval}
          max={minAnimInterval}
          onChange={onAnimIntervalUpdate}
        />
        <Typography>Faster</Typography>
      </div>
    </Paper>
  );
}

function PlayPauseButton({ onPlayPause, isPlaying }) {
  return (
    <IconButton onClick={onPlayPause}>
      {isPlaying ? <Pause /> : <PlayArrow />}
    </IconButton>
  );
}

export default PlaybackControls;
