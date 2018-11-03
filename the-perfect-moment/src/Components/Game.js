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
    this.activate = this.activate.bind(this);
    this.draw = this.draw.bind(this);
    this.abort = this.abort.bind(this);
    this.isCardScorable = this.isCardScorable.bind(this);
    this.isAnyCardScorable = this.isAnyCardScorable.bind(this);
    this.endActionPhase = this.endActionPhase.bind(this);
    this.doOpponentsTurn = this.doOpponentsTurn.bind(this);
    this.requiresCleanup = this.requiresCleanup.bind(this);
    this.cleanup = this.cleanup.bind(this);

    this.state = {
      phase: "setup.equip",
      subPhase: "",
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
      },
      activationStack: []
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
    activateData.card.activationStep = "0";
    var stateCopy = this.activate(activateData);

    this.setState(stateCopy);
  }

  activate(activateData) {
    var result = activateData.card.action(this.state, activateData.card)
    var stateCopy = this.state;
    stateCopy.subPhase = "";
    if (!result.complete) {
      stateCopy.message = result.message;
      stateCopy.actionAbortable = result.abortable;
      stateCopy.subPhase = "activate.card";
      stateCopy.activationStack.push(activateData);
    }
    else {
      if (this.requiresCleanup(stateCopy)) {
        this.cleanup(stateCopy);
        stateCopy.activationStack.push(activateData);
      }
      else if (this.state.phase === "action.select.1") {
        stateCopy.message = "Select another equipment card to activate."
        stateCopy.actionAbortable = true;
        stateCopy.phase = "action.select.2";
      }
      else if (this.state.phase === "action.select.2") {
        this.endActionPhase(stateCopy);
      }
    }
    return stateCopy;
  }

  requiresCleanup(stateCopy) {
    return stateCopy.player.revision.length !== 1 || stateCopy.player.equipment.length !== 2 ||
    stateCopy.opponent.revision.length !== 1 || stateCopy.opponent.equipment.length !== 2;
  }

  cleanup(stateCopy) {
    if (stateCopy.player.revision.length > 1) {      
      stateCopy.message = "Equip a card from your hand."
      stateCopy.actionAbortable = false;
      stateCopy.subPhase = "cleanup";
    }
  }

  doOpponentsTurn(stateCopy) {
    //TODO: opponent's turn here
    stateCopy.message = "Select an equipment card to activate.";
    stateCopy.actionAbortable = true;
    stateCopy.phase = "action.select.1";
  }

  endActionPhase(stateCopy) {
    stateCopy.subPhase = "";
    debugger;
    if (this.isAnyCardScorable()) {
      stateCopy.message = "Select a card to score.";
      stateCopy.actionAbortable = true;
      stateCopy.phase = "score.card";

      this.state.paradox.forEach(card => {
        if (this.isCardScorable(card)) {
          card.resetStatus();
          card.scorable = true;
        }
      });
      this.state.player.revision.forEach(card => {
        if (this.isCardScorable(card)) {
          card.resetStatus();
          card.scorable = true;
        }
      });
    }
    else {
      this.doOpponentsTurn(stateCopy);
    }
  }

  isAnyCardScorable() {
    for (var i = 0; i < this.state.paradox.length; i++) {
      if (this.isCardScorable(this.state.paradox[i])) {
        return true;
      }
    }
    for (var j = 0; j < this.state.player.revision; j++) {
      if (this.isCardScorable(this.state.player.revision[j])) {
        return true;
      }
    }
    return false;
  }

  isCardScorable(card) {
    return this.state.player.equipment.some(equipmentCard =>
      equipmentCard.action1 === card.action1 ||
      equipmentCard.action1 === card.action2 ||
      equipmentCard.action2 === card.action1 ||
      equipmentCard.action2 === card.action2);
  }

  handleMove(moveData) {
    const cardState = moveData.card
    const target = moveData.target;

    this.setState(state => {
      var swapTarget = cardState.swapTarget;
      cardState.resetStatus();
      cardState.swapTarget = swapTarget;

      state.player.revision = state.player.revision.filter(card => card.id !== cardState.id);
      state.player.equipment = state.player.equipment.filter(card => card.id !== cardState.id);
      state.player.scorePile = state.player.scorePile.filter(card => card.id !== cardState.id);
      state.opponent.revision = state.opponent.revision.filter(card => card.id !== cardState.id);
      state.opponent.equipment = state.opponent.equipment.filter(card => card.id !== cardState.id);
      state.opponent.scorePile = state.opponent.scorePile.filter(card => card.id !== cardState.id);
      state.paradox = state.paradox.filter(card => card.id !== cardState.id);
      state.deck = state.deck.filter(card => card.id !== cardState.id);

      //todo: run this everywhere that adds stuff to places with empties.
      var cleanEmpties = function(collection, count) {
        while (collection.length > count) {
          var index = collection.findIndex(x=>x.name === "empty");
          if (index !== -1){
            collection.splice(index, 1);
          }
          else {
            break;
          }
        }
      }

      if (target === "equip") {
        state.player.equipment.push(cardState);
        cleanEmpties(state.player.equipment, 2);
      }
      else if (target === "give") {
        state.opponent.equipment.push(cardState);
        cardState.flipped = !cardState.flipped;
      }
      else if (target === "discard") {
        state.deck.unshift(cardState);
      }
      else if (target === "return") {
        state.deck.push(cardState);
      }
      else if (target === "score") {
        cardState.flipped = true;
        state.player.scorePile.push(cardState);
        
        if (this.state.paradox.length < 1) { this.state.paradox.push(this.draw()); }
        if (this.state.player.revision.length < 1) { this.state.player.revision.push(this.draw()); }
        if (this.state.opponent.revision.length < 1) { this.state.opponent.revision.push(this.draw()); }
      }
      else if (target === "swap") {
        if (cardState.swapTarget === "player.revision") {
          var temp = state.player.revision.pop();
          state.player.revision.push(cardState);
          state.player.equipment.push(temp);
        }
      }

      if (state.phase === "setup.equip") {
        state.phase = "setup.give";
        state.message = "Select a card to give to your opponent.";
      }
      else if (this.state.phase === "setup.give") {
        state.player.equipment.push(this.draw());
        state.phase = "setup.discardOrReturn";
        state.message = "Select a card to return to the top of the deck or discard.";
      }
      else if (this.state.phase === "setup.discardOrReturn") {
        state.phase = "action.select.1";
        state.message = "Select an equipment card to activate.";
        state.actionAbortable = true;
      }
      else if (this.state.phase.startsWith("action.select") && 
        (this.state.subPhase === "activate.card" || this.state.subPhase === "cleanup")) {
        state = this.activate(state.activationStack.pop());
      }
      else if (this.state.phase === "score.card") {
        this.doOpponentsTurn(this.state);
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

  abort(e) {
    e.preventDefault();
    var stateCopy = this.state;
    if (this.state.phase.startsWith("action.select")) {
      this.endActionPhase(stateCopy);
      this.setState(stateCopy);
    }
    else if (this.state.phase === "score.card") {
      this.doOpponentsTurn(this.state);
      this.setState(stateCopy);
    }
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
    else if (this.state.phase.startsWith("action.select")) {
      if (this.state.subPhase === "activate.card") {
        /// the card should have done any state changes already
      }
      else if (this.state.subPhase === "cleanup") {
        this.state.player.revision.forEach(card => {
          card.resetStatus();
          card.equipable = true;
        });
        this.state.player.equipment.forEach(card => {
          card.resetStatus();
        });
        this.state.opponent.equipment.forEach(card => {
          card.resetStatus();
        });
        this.state.paradox.forEach(card => {
          card.resetStatus();
        });
      }
      else {
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

    var abortArea = <div />;
    if (this.state.actionAbortable) {
      abortArea = <div className="actionButtons">
        <img className="actionButton" src="/img/abort.png" onClick={this.abort} alt="abort" title="Abort" />
      </div>;
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
        <Paradox cards={this.state.paradox} onActivate={this.handleActivate} onMove={this.handleMove} />
      </div>
      <div>
        <ScorePile cards={this.state.player.scorePile} onMove={this.handleMove} />
        <Equipment cards={this.state.player.equipment} onActivate={this.handleActivate} onMove={this.handleMove} />
        <Revision cards={this.state.player.revision} onMove={this.handleMove} />
      </div>
      {abortArea}
    </div>);
  }
}

export default Game;