import React, { useState } from "react";
import { Paper, Typography, Button } from "@material-ui/core";
import Slider from "@material-ui/lab/Slider";
//import ToggleButton from "@material-ui/lab/ToggleButton";

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
      {isPlaying ? "Pause" : "Play"}
    </Button>
  );
}

export default Controls;
