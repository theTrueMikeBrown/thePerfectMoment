import React from 'react';
import CardState from '../Domain/cardState';
import Card from './Card';
export class Revision extends React.Component {
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
    return (<fieldset className="revision">
      <legend>Revision</legend>
      {cards.map(card => (<Card key={card.id} rotate={flipped} card={card} onEquip={this.handleEquip} />))}
    </fieldset>);
  }
}