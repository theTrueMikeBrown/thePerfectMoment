import React from 'react';
import Deck from './Deck';
import ScorePile from './ScorePile';
import Paradox from './Paradox';
import Equipment from './Equipment';
import Revision from './Revision';
import Cards from '../Domain/cards';

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.handleMove = this.handleMove.bind(this);
    this.handleActivate = this.handleActivate.bind(this);
    this.draw = this.draw.bind(this);

    this.state = {
      phase: "setup.equip",
      message: "Select a card to equip.",
      actionAbortable: false,
      deck: Cards,
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

    this.state.opponent.revision.push(this.draw());
    this.state.opponent.equipment.push(this.draw());
    this.state.paradox.push(this.draw());
    this.state.player.revision.push(this.draw());
    this.state.player.revision.push(this.draw());
    this.state.player.revision.push(this.draw());
    this.state.player.revision.push(this.draw());
  }

  draw() {
    return this.state.deck.pop();
  }

  handleActivate(activateData) {
    var result = activateData.card.action(this.state, activateData.card)
    //TODO: correct having too much/little equipment
    if (!this.complete) {
      this.state.message = result.message;
      this.state.actionAbortable = this.abortable;
    }
    else if (this.state.phase === "action.select.1") {
      this.state.message = "Select another equipment card to activate."
      this.state.actionAbortable = this.abortable;
      this.state.phase = "action.select.2";
    }
    else if (this.state.phase === "action.select.2") {
      if (this.isAnyCardScorable(this.state)) {
        this.state.message = "Select a card to score.";
        this.state.actionAbortable = this.abortable;
        this.state.phase = "score.card";
      }
      else {
        //TODO: opponent's turn here
        this.state.message = "Select an equipment card to activate.";
        this.state.actionAbortable = this.abortable;
        this.state.phase = "action.select.1";
      }
    }
  }

  isAnyCardScorable(state) {
    for (var i = 0; i < state.paradox.length; i++) {
      if (isCardScorable(state.paradox[i], state)) {
        return true;
      }
    }
    for (var i = 0; i < state.player.revision; i++) {
      if (isCardScorable(state.player.revision[i], state)) {
        return true;
      }
    }
    return false;
  }

  isCardScorable(card, state) {
    if (state.equipment)
    card.action1
    card.action2
  }

  handleMove(moveData) {
    const cardState = moveData.card
    const target = moveData.target;

    this.setState(state => {
      cardState.equipable = false;
      cardState.flippable = false;
      cardState.giveable = false;
      cardState.discardable = false;
      cardState.returnable = false;
      cardState.swapable = false;

      state.player.revision = state.player.revision.filter(card => card.id !== cardState.id);
      state.player.equipment = state.player.equipment.filter(card => card.id !== cardState.id);
      state.player.scorePile = state.player.scorePile.filter(card => card.id !== cardState.id);
      state.opponent.revision = state.opponent.revision.filter(card => card.id !== cardState.id);
      state.opponent.equipment = state.opponent.equipment.filter(card => card.id !== cardState.id);
      state.opponent.scorePile = state.opponent.scorePile.filter(card => card.id !== cardState.id);
      state.paradox = state.paradox.filter(card => card.id !== cardState.id);
      state.deck = state.deck.filter(card => card.id !== cardState.id);

      if (target === "equip") {
        state.player.equipment.push(cardState);
      }
      else if (target == "give") {
        state.opponent.equipment.push(cardState);
        cardState.flipped = !cardState.flipped;
      }
      else if (target == "discard") {
        state.deck.unshift(cardState);
      }
      else if (target == "return") {
        state.deck.push(cardState);
      }

      if (this.state.phase === "setup.equip") {
        this.state.phase = "setup.give";
        this.state.message = "Select a card to give to your opponent.";
      }
      else if (this.state.phase === "setup.give") {
        state.player.equipment.push(this.draw());
        this.state.phase = "setup.discardOrReturn";
        this.state.message = "Select a card to return to the top of the deck or discard.";
      }
      else if (this.state.phase === "setup.discardOrReturn") {
        this.state.phase = "action.select.1";
        this.state.message = "Select an equipment card to activate.";
        this.state.actionAbortable = true;
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
    this.state.opponent.revision.forEach(card => {
      card.resetStatus();
      card.hidden = true;
    });

    if (this.state.phase === "setup.equip") {
      this.state.player.revision.forEach(card => {
        card.resetStatus();
        card.flippable = true;
        card.equipable = true;
      });
    }
    else if (this.state.phase === "setup.give") {
      this.state.player.revision.forEach(card => {
        card.resetStatus();
        card.flippable = true;
        card.giveable = true;
      });
    }
    else if (this.state.phase === "setup.discardOrReturn") {
      this.state.player.revision.forEach(card => {
        card.resetStatus();
        card.discardable = true;
        card.returnable = true;
      });
    }
    else if (this.state.phase === "action.select.1" || this.state.phase === "action.select.2") {
      this.state.player.revision.forEach(card => {
        card.resetStatus();
      });
      this.state.player.equipment.forEach(card => {
        card.resetStatus();
        card.activatable = true;
      });
      this.state.opponent.equipment.forEach(card => {
        card.resetStatus();
        card.activatable = true;
      });
      this.state.paradox.forEach(card => {
        card.resetStatus();
        card.activatable = true;
      });
    }
    else if (this.state.phase === "score.card") {
      this.state.player.revision.forEach(card => {
        card.resetStatus();
        if (this.isCardScorable(card, this.state)) { card.scorable = true; }
      });
      this.state.player.equipment.forEach(card => {
        card.resetStatus();
      });
      this.state.opponent.equipment.forEach(card => {
        card.resetStatus();
      });
      this.state.paradox.forEach(card => {
        card.resetStatus();
        if (this.isCardScorable(card)) { card.scorable = true; }
      });
    }

    return (<div className="game">
      <h2>{this.state.message}</h2>
      <div>
        <Revision flipped cards={this.state.opponent.revision} />
        <Equipment flipped cards={this.state.opponent.equipment} onActivate={this.handleActivate} />
        <ScorePile flipped />
      </div>
      <div>
        <Deck />
        <Paradox cards={this.state.paradox} onActivate={this.handleActivate} />
      </div>
      <div>
        <ScorePile />
        <Equipment cards={this.state.player.equipment} onActivate={this.handleActivate} />
        <Revision cards={this.state.player.revision} onMove={this.handleMove} />
      </div>
    </div>);
  }
}

export default Game;