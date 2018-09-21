import React, { Component } from 'react';
import logo from './logo.png';
import './App.css';
import Game from './Components/Game';

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
        </header>
        <Game />
      </div>
    );
  }
}

export default App;
