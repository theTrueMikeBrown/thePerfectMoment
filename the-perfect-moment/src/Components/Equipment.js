import React from 'react';
import CardState from '../Domain/cardState';
import Card from './Card';

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
    return (<fieldset className="equipment">
      <legend>Equipment</legend>
      {cards.map(card => (<Card key={card.id} rotate={flipped} card={card} />))}
    </fieldset>);
  }
}

export default Equipment;