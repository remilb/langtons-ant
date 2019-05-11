import React, { useState } from "react";

import {
  Grid,
  Drawer,
  Typography,
  Paper,
  CssBaseline
} from "@material-ui/core";

import AppHeader from "./components/AppHeader";
import PlaybackControls from "./components/PlaybackControls";
import LangtonsAntCanvas from "./components/LangtonsAntCanvas";
import SetttingsDrawer from "./components/SettingsDrawer";
import RulesDrawer from "./components/RulesDrawer";
import Rules from "./Rules";

import RuleItem from "./components/RuleItem";

function App(props) {
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({
    prerenderSteps: 0,
    gridType: "square"
  });

  const [animSpeed, setAnimSpeed] = useState(30);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isResetting, setIsResetting] = useState(true);

  const [showRules, setShowRules] = useState(true);
  const [rules, setRules] = useState([
    { onColor: "#ffffff", nextColor: "#000000", rotation: "l", numSteps: 1 },
    { onColor: "#000000", nextColor: "#37d67a", rotation: "r", numSteps: 1 },
    { onColor: "#37d67a", nextColor: "#ff8a65", rotation: "r", numSteps: 1 },
    { onColor: "#ff8a65", nextColor: "#ffffff", rotation: "l", numSteps: 1 }
  ]);

  return (
    <>
      <CssBaseline />
      <AppHeader
        handleClickSettings={() => setShowSettings(!showSettings)}
        handleClickRules={() => setShowRules(!showRules)}
      />
      <SetttingsDrawer
        settings={settings}
        handleSettingsChange={setSettings}
        open={showSettings}
        onClose={() => setShowSettings(false)}
      />
      <LangtonsAntCanvas
        rules={rulesArrayToMap(rules)}
        cellType={settings.gridType}
        cellSize={3}
        canvasWidth={document.documentElement.clientWidth}
        canvasHeight={document.documentElement.clientHeight}
        prerenderSteps={settings.prerenderSteps}
        animInterval={animSpeed}
        isAnimating={isPlaying}
        isResetting={isResetting}
        onResetComplete={() => setIsResetting(false)}
      />
      <RulesDrawer
        open={showRules}
        rules={rules}
        onRulesChange={newRules => setRules(newRules)}
        onClose={() => setShowRules(false)}
      />
      <Drawer anchor="bottom" open={false} variant="persistent" elevation={16}>
        <Rules rules={rules} onRulesChange={newRules => setRules(newRules)} />
      </Drawer>
      <PlaybackControls
        onPlayPause={(e, v) => setIsPlaying(!isPlaying)}
        isPlaying={isPlaying}
        minAnimInterval={20}
        maxAnimInterval={60}
        animInterval={animSpeed}
        onAnimIntervalUpdate={(e, v) => setAnimSpeed(v)}
        handleReset={() => setIsResetting(true)}
      />
    </>
  );
}

function rulesArrayToMap(rulesArray) {
  let rulesMap = {};
  for (let rule of rulesArray) {
    const { onColor, ...rest } = rule;
    rulesMap[onColor] = rest;
  }
  return rulesMap;
}

export default App;
