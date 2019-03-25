import React, { useState } from "react";
import logo from "./logo.svg";
import "./App.css";

import Slider from "@material-ui/lab/Slider";

import LangtonsAnt from "./LangtonsAnt";

function App(props) {
  const [animSpeed, setAnimSpeed] = useState(16);

  return (
    <div className="App">
      <LangtonsAnt
        gridWidth={1000}
        gridHeight={1000}
        squareWidth={2}
        animInterval={animSpeed}
      />
      <Slider
        width={500}
        value={animSpeed}
        min={1}
        max={1000}
        onChange={(e, value) => setAnimSpeed(value)}
      />
    </div>
  );
}

export default App;
