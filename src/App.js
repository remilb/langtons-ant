import React, { useState } from "react";
import "./App.css";

import { Grid, Paper } from "@material-ui/core";

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
    { onColor: "#000000", nextColor: "#ffffff", rotation: "r", numSteps: 1 }
    // { onColor: "#37d67a", nextColor: "#ff8a65", rotation: "r", numSteps: 1 },
    // { onColor: "#ff8a65", nextColor: "#ffffff", rotation: "l", numSteps: 1 }
  ]);

  return (
    <div className="App">
      <Grid container alignItems="center" justify="center" spacing={16}>
        <Grid item xs={3}>
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
        </Grid>
        <Grid item>
          <Paper>
            <LangtonsAntCanvas
              rules={rulesArrayToMap(rules)}
              cellType="square"
              cellSize={8}
              canvasWidth={500}
              canvasHeight={500}
              prerenderSteps={prerenderSteps}
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
