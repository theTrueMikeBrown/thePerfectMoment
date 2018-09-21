import React, { Component } from 'react';
import logo from './logo.png';
import './App.css';

function formatImage(s) { return `/img/${s}.png`; }

var _currentCardId = 0;
class CardState {
  constructor(name = "empty", flipped = false, hidden = false, flippable = false, equipable = false) {
    this.name = name;
    this.flipped = flipped;
    this.hidden = hidden;
    this.flippable = flippable;
    this.equipable = equipable;
    this.id = _currentCardId++;
  }
}

class Deck extends React.Component {
  render() {
    var image = this.props.img || formatImage('BackPM');
    return (
      <fieldset className="deck">
        <legend>Deck</legend>
        <img className="art" src={image} />
      </fieldset>
    );
  }
}

class Card extends React.Component {
  constructor(props) {
    super(props);
    this.state = { card: new CardState() };

    this.flip = this.flip.bind(this);
    this.equip = this.equip.bind(this);
  }

  flip(e) {
    e.preventDefault();
    this.setState(state => {
      state.card.flipped = !state.card.flipped
      return state;
    });
  }

  equip(e) {
    e.preventDefault();
    this.props.onEquip(this.state.card);
  }

  render() {
    var getName = (card) => card.hidden ? 'BackPM' : card.name;

    var rotate = parseInt(this.props.rotate) || 0;
    this.state.card = this.props.card || new CardState();
    if (this.state.card.flipped) {
      rotate = (rotate + 180) % 360;
    }

    rotate = `rotate${rotate}`;

    return (
      <div className="inline relative">
        <div className={"card " + rotate}>
          <img className="art" src={formatImage(getName(this.state.card))} />
        </div>
        <div className="actionButtons">
          {this.state.card.flippable &&
            <img className="actionButton" src={formatImage("flip")} onClick={this.flip} />}
          {this.state.card.equipable &&
            <img className="actionButton" src={formatImage("equip")} onClick={this.equip} />}
        </div>
      </div>
    );
  }
}

class ScorePile extends React.Component {
  render() {
    var flipped = this.props.flipped;
    if (flipped) {
      flipped = '180';
    }
    else {
      flipped = '';
    }
    return (
      <fieldset className="scorePile">
        <legend>Score Pile</legend>
      </fieldset>
    );
  }
}

class Paradox extends React.Component {
  render() {
    var cards = this.props.cards || [];
    if (cards.length > 1) {
      cards = cards.filter(card => card.name !== "empty");
    }
    while (cards.length < 1) {
      cards.push(new CardState());
    }

    return (
      <fieldset className="paradox">
        <legend>Paradox</legend>
        {cards.map(card => (
          <Card key={card.id} rotate="90" card={card} />
        ))}
      </fieldset>
    );
  }
}

class Equipment extends React.Component {
  render() {
    var flipped = this.props.flipped;
    if (flipped) {
      flipped = '180';
    }
    else {
      flipped = '';
    }

    var cards = this.props.cards || [];
    if (cards.length > 2) {
      cards = cards.filter(card => card.name !== "empty");
    }
    while (cards.length < 2) {
      cards.push(new CardState());
    }

    var hidden = this.props.hidden || false;
    if (hidden) {
      cards.forEach(card => card.hidden = true);
    }

    return (
      <fieldset className="equipment">
        <legend>Equipment</legend>
        {cards.map(card => (
          <Card key={card.id} rotate={flipped} card={card} />
        ))}
      </fieldset>
    );
  }
}

class Revision extends React.Component {
  constructor(props) {
    super(props);
    this.handleEquip = this.handleEquip.bind(this);
  }

  handleEquip(cardState) {
    this.props.onEquip(cardState);
  }

  render() {
    var flipped = this.props.flipped;
    if (flipped) {
      flipped = '180';
    }
    else {
      flipped = '';
    }

    var cards = this.props.cards || [];
    if (cards.length > 1) {
      cards = cards.filter(card => card.name !== "empty");
    }
    while (cards.length < 1) {
      cards.push(new CardState());
    }

    var hidden = this.props.hidden || false;
    if (hidden) {
      cards.forEach(card => {
        card.hidden = true;
        card.flippable = false;
        card.equipable = false;
      });
    }
    else {
      cards.forEach(card => {
        card.hidden = false;
        card.flippable = true;
        card.equipable = true;
      });
    }

    return (
      <fieldset className="revision">
        <legend>Revision</legend>
        {cards.map(card => (
          <Card key={card.id} rotate={flipped} card={card} onEquip={this.handleEquip} />
        ))}
      </fieldset>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.handleEquip = this.handleEquip.bind(this);
    this.draw = this.draw.bind(this);

    this.state = {
      phase: "setup.equip",
      deck: [
        new CardState('0.1'), new CardState('0.2'), new CardState('0.3'), new CardState('0.4'), new CardState('0.5'), new CardState('0.6'),
        new CardState('1.1'), new CardState('1.2'), new CardState('1.3'), new CardState('1.4'), new CardState('1.5'), new CardState('1.6'),
        new CardState('2.1'), new CardState('2.2'), new CardState('2.3'), new CardState('2.4'), new CardState('2.5'), new CardState('2.6'),
      ],
      paradox: [],
      player: {
        revision: [],
        equipment: [],
        scorePile: []
      },
      opponent: {
        revision: [],
        equipment: [],
        scorePile: []
      }
    };

    this.shuffle(this.state.deck);

    var draw = this.draw;
    this.state.opponent.revision.push(draw());
    this.state.opponent.equipment.push(draw());
    this.state.paradox.push(draw());
    this.state.player.revision.push(draw());
    this.state.player.revision.push(draw());
    this.state.player.revision.push(draw());
    this.state.player.revision.push(draw());
  }

  draw() {
    return this.state.deck.pop();
  }

  handleEquip(cardState) {
    this.setState(state => {
      if (this.state.phase === "setup.equip") {
        state.player.equipment.push(cardState)
        state.player.revision = state.player.revision.filter(card => card.id !== cardState.id);
        cardState.equipable = false;
        cardState.flippable = false;
        this.state.phase = "setup.opponentEquip";
      }
      else if (this.state.phase === "setup.opponentEquip") {
        state.opponent.equipment.push(cardState)
        state.player.revision = state.player.revision.filter(card => card.id !== cardState.id);
        cardState.equipable = false;
        cardState.flippable = false;        
        cardState.flipped = !cardState.flipped
        this.state.phase = "setup.discardOrReturn";
      }
      return state;
    });
  }

  shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;
    while (0 !== currentIndex) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
      temporaryValue.flipped = (Math.random() >= 0.5);
    }
    return array;
  }

  render() {
    return (
      <div className="game">
        <div>&nbsp;</div>
        <div>
          <Revision flipped hidden cards={this.state.opponent.revision} />
          <Equipment flipped cards={this.state.opponent.equipment} />
          <ScorePile flipped />
        </div>
        <div>
          <Deck />
          <Paradox cards={this.state.paradox} />
        </div>
        <div>
          <ScorePile />
          <Equipment cards={this.state.player.equipment} />
          <Revision cards={this.state.player.revision} onEquip={this.handleEquip} />
        </div>
      </div>
    );
  }
}

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
