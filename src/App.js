import React, { useState } from "react";
import logo from "./logo.svg";
import "./App.css";

import { Grid, Paper, Typography } from "@material-ui/core";
import Slider from "@material-ui/lab/Slider";

import LangtonsAnt from "./LangtonsAnt";
import Controls from "./Controls";
import Rules from "./Rules";

function App(props) {
  const [animSpeed, setAnimSpeed] = useState(30);
  const [isPlaying, setIsPlaying] = useState(false);
  const [numResets, setNumResets] = useState(0);

  return (
    <div className="App">
      <Grid container alignItems="center" justify="center" spacing="16">
        <Grid item xs={3}>
          <Controls
            onPlayPause={(e, v) => setIsPlaying(!isPlaying)}
            isPlaying={isPlaying}
            minAnimInterval={20}
            maxAnimInterval={500}
            animInterval={animSpeed}
            handleAnimIntervalUpdate={(e, v) => setAnimSpeed(v)}
            handleReset={() => setNumResets(numResets + 1)}
          />
        </Grid>
        <Grid item>
          <Paper>
            <LangtonsAnt
              gridWidth={500}
              gridHeight={500}
              squareWidth={2}
              prerenderSteps={50}
              animInterval={animSpeed}
              isAnimating={isPlaying}
              numResets={numResets}
            />
          </Paper>
        </Grid>
        <Grid item xs={3}>
          <Rules />
        </Grid>
      </Grid>
    </div>
  );
}

export default App;
