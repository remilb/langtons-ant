import React, { Component } from "react";
import logo from "./logo.svg";
import "./App.css";

import LangtonsAnt from "./LangtonsAnt";

class App extends Component {
  render() {
    return (
      <div className="App">
        <LangtonsAnt
          gridWidth={500}
          gridHeight={500}
          squareWidth={10}
          animInterval={3000}
        />
      </div>
    );
  }
}

export default App;
