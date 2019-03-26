import React, { useState, Fragment } from "react";
import { Paper, Typography, Button } from "@material-ui/core";
import Slider from "@material-ui/lab/Slider";
import { PlayArrow, Pause } from "@material-ui/icons";

function Controls({ onPlayPause }) {
  return (
    <Paper>
      <Typography> Controls </Typography>
      <PlayPauseButton onPlayPause={onPlayPause} />
      <Slider value={40} min={25} max={1000} />
    </Paper>
  );
}

function PlayPauseButton({ onPlayPause }) {
  const [isPlaying, setIsPlaying] = useState(false);

  function onClick(e, v) {
    const p = !isPlaying;
    onPlayPause(p);
    setIsPlaying(p);
  }

  return (
    <Button variant="contained" onClick={onClick}>
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
