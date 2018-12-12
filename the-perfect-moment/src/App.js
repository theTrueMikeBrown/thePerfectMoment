import React, { Component } from 'react';
import logo from './logo.png';
import './App.css';
import Game from './Components/Game';
import formatImage from "./Domain/formatImage";

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <div className="right">
            <a href="https://www.dropbox.com/sh/8r91j8724qd6t7v/AACNdDp_w7FixSjqeLAZLJcqa?dl=0&amp;preview=TPM_+Echoes+(SOLO).pdf">
              <img className="actionButton" src={formatImage("rules")} alt="Rules" title="Rules" />
            </a>
            <a href="https://buttonshygames.com/">
              <img className="actionButton" src={formatImage("buttonshy")} alt="ButtonShy games" title="ButtonShy games" />
            </a>
          </div>
        </header>
        <Game />
      </div>
    );
  }
}

export default App;