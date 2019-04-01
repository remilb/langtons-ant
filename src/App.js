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
  const [rules, setRules] = useState({
    "#ffffff": { nextColor: "#000000", rotation: "l", numSteps: 1 },
    "#000000": { nextColor: "#37d67a", rotation: "r", numSteps: 1 },
    "#37d67a": { nextColor: "#ffffff", rotation: "l", numSteps: 1 }
  });

  return (
    <div className="App">
      <Grid container alignItems="center" justify="center" spacing={16}>
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
              rules={rules}
              gridWidth={500}
              gridHeight={500}
              squareWidth={3}
              prerenderSteps={10000}
              animInterval={animSpeed}
              isAnimating={isPlaying}
              numResets={numResets}
            />
          </Paper>
        </Grid>
        <Grid item xs={3}>
          <Rules rules={rules} onRulesChange={newRules => setRules(newRules)} />
        </Grid>
      </Grid>
    </div>
  );
}

export default App;
