import React, { useState } from "react";
import "./App.css";

import {
  Grid,
  AppBar,
  Drawer,
  Typography,
  Toolbar,
  Paper
} from "@material-ui/core";

import LangtonsAntCanvas from "./components/LangtonsAntCanvas";
import Controls from "./Controls";
import Rules from "./Rules";

function App(props) {
  const [animSpeed, setAnimSpeed] = useState(30);
  const [prerenderSteps, setPrerenderSteps] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isResetting, setIsResetting] = useState(true);
  const [rules, setRules] = useState([
    { onColor: "#ffffff", nextColor: "#000000", rotation: "l", numSteps: 1 },
    { onColor: "#000000", nextColor: "#37d67a", rotation: "r", numSteps: 1 },
    { onColor: "#37d67a", nextColor: "#ff8a65", rotation: "r", numSteps: 1 },
    { onColor: "#ff8a65", nextColor: "#ffffff", rotation: "l", numSteps: 1 }
  ]);

  return (
    <div className="App">
      <AppBar position="fixed">
        <Toolbar>
          <Typography variant="h6" color="inherit">
            Langton's Ant
          </Typography>
        </Toolbar>
      </AppBar>
      <Grid container alignItems="center" justify="center" spacing={16}>
        <Drawer anchor="left" open={true} variant="persistent" elevation={16}>
          <Controls
            onPlayPause={(e, v) => setIsPlaying(!isPlaying)}
            isPlaying={isPlaying}
            minAnimInterval={20}
            maxAnimInterval={60}
            animInterval={animSpeed}
            onAnimIntervalUpdate={(e, v) => setAnimSpeed(v)}
            prerenderSteps={prerenderSteps}
            onPrerenderStepsChange={(e, v) => setPrerenderSteps(v)}
            handleReset={() => setIsResetting(true)}
          />
        </Drawer>
        <Grid item>
          <LangtonsAntCanvas
            rules={rulesArrayToMap(rules)}
            cellType="hex"
            cellSize={3}
            canvasWidth={window.innerWidth}
            canvasHeight={window.innerHeight}
            prerenderSteps={prerenderSteps}
            animInterval={animSpeed}
            isAnimating={isPlaying}
            isResetting={isResetting}
            onResetComplete={() => setIsResetting(false)}
          />
        </Grid>
      </Grid>
      <Drawer anchor="right" open={true} variant="persistent" elevation={16}>
        <Rules rules={rules} onRulesChange={newRules => setRules(newRules)} />
      </Drawer>
    </div>
  );
}

function rulesArrayToMap(rulesArray) {
  return Object.fromEntries(rulesArray.map(rule => [rule.onColor, rule]));
}

export default App;
