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

  handleMove(moveData) {
    var cardState = moveData.card
    this.setState(state => {
      if (this.state.phase === "setup.equip") {
        state.player.equipment.push(cardState);
        state.player.revision = state.player.revision.filter(card => card.id !== cardState.id);
        cardState.equipable = false;
        cardState.flippable = false;
        this.state.phase = "setup.give";
        this.state.message = "Select a card to give to your opponent";
      }
      else if (this.state.phase === "setup.give") {
        state.opponent.equipment.push(cardState);
        state.player.revision = state.player.revision.filter(card => card.id !== cardState.id);
        cardState.giveable = false;
        cardState.flippable = false;
        cardState.flipped = !cardState.flipped;
        this.state.phase = "setup.discardOrReturn";
      }
      else if (this.state.phase === "setup.discardOrReturn" && moveData.target === "discard") {
        state.deck.unshift(cardState);
        state.player.revision = state.player.revision.filter(card => card.id !== cardState.id);        
        cardState.discardable = false;
        cardState.returnable = false;
        this.state.phase = "action.select";
      }
      else if (this.state.phase === "setup.discardOrReturn" && moveData.target === "return") {
        state.deck.push(cardState);
        state.player.revision = state.player.revision.filter(card => card.id !== cardState.id);        
        cardState.discardable = false;
        cardState.returnable = false;
        this.state.phase = "action.select";
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