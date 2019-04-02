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
  const [isResetting, setIsResetting] = useState(true);
  const [rules, setRules] = useState([
    { onColor: "#ffffff", nextColor: "#000000", rotation: "l", numSteps: 1 },
    { onColor: "#000000", nextColor: "#37d67a", rotation: "r", numSteps: 1 },
    { onColor: "#37d67a", nextColor: "#ffffff", rotation: "r", numSteps: 1 },
    { onColor: "#000000", nextColor: "#37d67a", rotation: "l", numSteps: 1 }
  ]);

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
            handleReset={() => setIsResetting(true)}
          />
        </Grid>
        <Grid item>
          <Paper>
            <LangtonsAnt
              rules={rulesArrayToMap(rules)}
              gridWidth={500}
              gridHeight={500}
              squareWidth={3}
              prerenderSteps={50}
              animInterval={animSpeed}
              isAnimating={isPlaying}
              isResetting={isResetting}
              onResetComplete={() => setIsResetting(false)}
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

function rulesArrayToMap(rulesArray) {
  return Object.fromEntries(rulesArray.map(rule => [rule.onColor, rule]));
}

export default App;
