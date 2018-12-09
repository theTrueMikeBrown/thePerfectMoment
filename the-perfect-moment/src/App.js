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
          <div className="right">
            <a href="https://www.dropbox.com/sh/8r91j8724qd6t7v/AACNdDp_w7FixSjqeLAZLJcqa?dl=0&preview=TPM_+Echoes+(SOLO).pdf">rules</a>
          </div>
        </header>
        <Game />
      </div>
    );
  }
}

export default App;