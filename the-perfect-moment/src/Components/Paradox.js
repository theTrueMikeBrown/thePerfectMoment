import React from 'react';
import CardState from '../Domain/cardState';
import Card from './Card';

class Paradox extends React.Component {
  render() {
    var cards = this.props.cards || [];
    if (cards.length > 1) {
      cards = cards.filter(card => card.name !== "empty");
    }
    while (cards.length < 1) {
      cards.push(new CardState());
    }
    return (<fieldset className="paradox">
      <legend>Paradox</legend>
      {cards.map(card => (<Card key={card.id} rotate="90" card={card} />))}
    </fieldset>);
  }
}

export default Paradox;