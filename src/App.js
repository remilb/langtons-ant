import React, { useState, useRef } from "react";
import { CssBaseline } from "@material-ui/core";

import AppHeader from "./components/AppHeader";
import PlaybackControls from "./components/PlaybackControls";
import LangtonsAntCanvas from "./components/LangtonsAntCanvas";
import SetttingsDrawer from "./components/SettingsDrawer";
import RulesDrawer from "./components/RulesDrawer";

import { useWindowSize, useDebounce } from "./hooks";

function App() {
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({
    prerenderSteps: 0,
    gridType: "hex"
  });

  const [animSpeed, setAnimSpeed] = useState(32);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isResetting, setIsResetting] = useState(true);

  const [cellSize, setCellSize] = useState(3);
  // Can make this more sophisticated later
  const handleWheel = e => {
    if (e.deltaY < 0) {
      setCellSize(sz => sz + 2);
    } else {
      setCellSize(sz => sz - 2);
    }
  };

  const [showRules, setShowRules] = useState(true);
  const [rules, setRules] = useState([
    { onColor: "#ffffff", nextColor: "#000000", rotation: "r", numSteps: 1 },
    { onColor: "#000000", nextColor: "#37d67a", rotation: "r", numSteps: 1 },
    { onColor: "#37d67a", nextColor: "#ff8a65", rotation: "l", numSteps: 1 },
    { onColor: "#ff8a65", nextColor: "#1f28cd", rotation: "l", numSteps: 1 },
    { onColor: "#1f28cd", nextColor: "#f59e06", rotation: "l", numSteps: 1 },
    { onColor: "#f59e06", nextColor: "#436bc3", rotation: "r", numSteps: 1 },
    { onColor: "#436bc3", nextColor: "#9f6773", rotation: "l", numSteps: 1 },
    { onColor: "#9f6773", nextColor: "#dce775", rotation: "l", numSteps: 1 },
    { onColor: "#dce775", nextColor: "#f6e76b", rotation: "l", numSteps: 1 },
    { onColor: "#f6e76b", nextColor: "#ca76c8", rotation: "r", numSteps: 1 },
    { onColor: "#ca76c8", nextColor: "#53b4b7", rotation: "r", numSteps: 1 },
    { onColor: "#53b4b7", nextColor: "#ffffff", rotation: "r", numSteps: 1 }
  ]);

  const windowSize = useDebounce(useWindowSize(), 250);

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
        cellSize={cellSize}
        canvasWidth={windowSize.width}
        canvasHeight={windowSize.height}
        prerenderSteps={settings.prerenderSteps}
        animInterval={animSpeed}
        isAnimating={isPlaying}
        isResetting={isResetting}
        onResetComplete={() => setIsResetting(false)}
        onWheel={handleWheel}
      />
      <RulesDrawer
        open={showRules}
        rules={rules}
        onRulesChange={newRules => setRules(newRules)}
        onClose={() => setShowRules(false)}
      />
      <PlaybackControls
        onPlayPause={(e, v) => setIsPlaying(!isPlaying)}
        isPlaying={isPlaying}
        minAnimInterval={15}
        maxAnimInterval={100}
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
