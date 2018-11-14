import React from 'react';
import Card from './Card';

class Erased extends React.Component {
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
      flipped = 180;
    }
    else {
      flipped = 0;
    }
    var cards = this.props.cards || [];

    return (<fieldset className="erased">
      <legend>Erased</legend>
      {cards.map(card => {
        var rotate = card.rotate + flipped;
        return (<div key={card.id} className="spacer"><Card rotate={rotate} card={card} onMove={this.handleMove}  /></div>);
      })}
    </fieldset>);
  }
}

export default Erased;