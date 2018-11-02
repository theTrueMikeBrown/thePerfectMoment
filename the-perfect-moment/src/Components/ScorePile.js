import React from 'react';
import Card from './Card';

class ScorePile extends React.Component {
  constructor(props) {
    super(props);
    this.handleMove = this.handleMove.bind(this);
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
    var cards = this.props.cards || [];

    return (<fieldset className="scorePile">
      <legend>Score Pile</legend>
      {cards.map(card => (<Card key={card.id} rotate={flipped} card={card} onMove={this.handleMove}  />))}
    </fieldset>);
  }
}

export default ScorePile;