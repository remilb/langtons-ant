import React, { useState } from "react";
import logo from "./logo.svg";
import "./App.css";

import { Grid, Paper, Typography } from "@material-ui/core";
import Slider from "@material-ui/lab/Slider";

import LangtonsAnt from "./LangtonsAnt";
import Controls from "./Controls";

function App(props) {
  const [animSpeed, setAnimSpeed] = useState(40);
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="App">
      <Grid container alignItems="center" justify="center" spacing="16">
        {/* <Grid item>
          <Typography>Controls</Typography>
          <Slider
            value={animSpeed}
            min={25}
            max={1000}
            onChange={(e, value) => setAnimSpeed(value)}
          />
        </Grid> */}
        <Grid item xs={3}>
          <Controls onPlayPause={setIsPlaying} />
        </Grid>
        <Grid item>
          <Paper>
            <LangtonsAnt
              gridWidth={500}
              gridHeight={500}
              squareWidth={2}
              animInterval={animSpeed}
              isAnimating={isPlaying}
            />
          </Paper>
        </Grid>
        <Grid item xs={3}>
          <Paper>
            <Typography>Rules</Typography>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
}

export default App;
