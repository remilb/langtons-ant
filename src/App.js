import React, { useState, useRef, useCallback } from "react";
import { CssBaseline } from "@material-ui/core";

import AppHeader from "./components/AppHeader";
import PlaybackControls from "./components/PlaybackControls";
import LangtonsAntCanvas from "./components/LangtonsAntCanvas";
import SetttingsDrawer from "./components/SettingsDrawer";
import RulesDrawer from "./components/RulesDrawer";

import { useWindowSize, useDebounce } from "./hooks";

function App() {
  const antCanvasRef = useRef();

  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({
    prerenderSteps: 0,
    gridType: "hex"
  });

  const [animSpeed, setAnimSpeed] = useState(32);
  const [isPlaying, setIsPlaying] = useState(false);
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

  // Handlers
  const handleClickSettings = useCallback(() => setShowSettings(s => !s), [
    setShowSettings
  ]);
  const handleClickRules = useCallback(() => setShowRules(s => !s), [
    setShowRules
  ]);

  const windowSize = useDebounce(useWindowSize(), 250);

  return (
    <>
      <CssBaseline />
      <AppHeader
        handleClickSettings={handleClickSettings}
        handleClickRules={handleClickRules}
      />
      <SetttingsDrawer
        settings={settings}
        handleSettingsChange={setSettings}
        open={showSettings}
        onClose={() => setShowSettings(false)}
      />
      <LangtonsAntCanvas
        ref={antCanvasRef}
        rules={rulesArrayToMap(rules)}
        cellType={settings.gridType}
        initialCellSize={3}
        width={windowSize.width}
        height={windowSize.height}
        beginAtStep={settings.prerenderSteps}
        animInterval={animSpeed}
        isAnimating={isPlaying}
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
        handleReset={() => antCanvasRef.current.reset()}
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
