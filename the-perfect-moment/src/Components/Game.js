import React from 'react';
import CardState from '../Domain/cardState';
import Deck from './Deck';
import ScorePile from './ScorePile';
import Paradox from './Paradox';
import Equipment from './Equipment';
import Revision from './Revision';

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.handleMove = this.handleMove.bind(this);
    this.draw = this.draw.bind(this);

    this.state = {
      phase: "setup.equip",
      message: "Select a card to equip.",
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

  handleMove(moveData) {
    const cardState = moveData.card
    const target = moveData.target;

    this.setState(state => {
      cardState.equipable = false;
      cardState.flippable = false;
      cardState.giveable = false;
      cardState.discardable = false;
      cardState.returnable = false;
      
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
        this.state.phase = "action.select";        
        this.state.message = "Select an equipment card to activate.";
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
      card.hidden = true;
      card.flippable = false;
      card.equipable = false;
      card.giveable = false;
      card.discardable = false;
      card.returnable = false;
    });

    if (this.state.phase === "setup.equip") {
      this.state.player.revision.forEach(card => {
        card.hidden = false;
        card.flippable = true;
        card.equipable = true;
        card.giveable = false;
        card.discardable = false;
        card.returnable = false;
      });
    }
    else if (this.state.phase === "setup.give") {
      this.state.player.revision.forEach(card => {
        card.hidden = false;
        card.flippable = true;
        card.equipable = false;
        card.giveable = true;
        card.discardable = false;
        card.returnable = false;
      });
    }
    else if (this.state.phase === "setup.discardOrReturn") {
      this.state.player.revision.forEach(card => {
        card.hidden = false;
        card.flippable = false;
        card.equipable = false;
        card.giveable = false;
        card.discardable = true;
        card.returnable = true;
      });
    }
    else if (this.state.phase === "action.select") {
      this.state.player.revision.forEach(card => {
        card.hidden = false;
        card.flippable = false;
        card.equipable = false;
        card.giveable = false;
        card.discardable = false;
        card.returnable = false;
      });
      this.state.player.equipment.forEach(card => {
        card.hidden = false;
        card.flippable = false;
        card.equipable = false;
        card.giveable = false;
        card.discardable = false;
        card.returnable = false;
        card.activatable = true;
      });
      this.state.paradox.forEach(card => {
        card.hidden = false;
        card.flippable = false;
        card.equipable = false;
        card.giveable = false;
        card.discardable = false;
        card.returnable = false;
        card.activatable = true;
      });
    }

    return (<div className="game">
      <h2>{this.state.message}</h2>
      <div>
        <Revision flipped cards={this.state.opponent.revision} />
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
        <Revision cards={this.state.player.revision} onMove={this.handleMove} />
      </div>
    </div>);
  }
}

export default Game;