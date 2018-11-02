import React from 'react';
import Card from './Card';
import ensureMinArraySize from '../Domain/ensureMinArraySize';

class Equipment extends React.Component {
  constructor(props) {
    super(props);
    this.handleActivate = this.handleActivate.bind(this);
    this.handleMove = this.handleMove.bind(this);
  }

  handleActivate(activateData) {
    this.props.onActivate(activateData);
  }

  handleMove(moveData) {
    this.props.onMove(moveData);
  }

  render() {
    var flipped = this.props.flipped;
    if (flipped) {
      flipped = '180';
    }
    else {
      flipped = '';
    }
    var cards = ensureMinArraySize(this.props.cards || [], 2);

    var hidden = this.props.hidden || false;
    if (hidden) {
      cards.forEach(card => card.hidden = true);
    }
    return (<fieldset className="equipment">
      <legend>Equipment</legend>
      {cards.map(card => (<Card key={card.id} rotate={flipped} card={card} onActivate={this.handleActivate} onMove={this.handleMove}  />))}
    </fieldset>);
  }
}

export default Equipment;