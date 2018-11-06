import React from 'react';
import Card from './Card';

class Selection extends React.Component {
  constructor(props) {
    super(props);
    this.handleMove = this.handleMove.bind(this);
  }

  handleMove(moveData) {
    this.props.onMove(moveData);
  }

  render() {
    var cards = this.props.cards;
    var visible = cards.length > 0

    return (<fieldset className={"selection" + (visible ? "visible" : "")}>
      <legend>Selection</legend>
      {cards.map(card => (<Card key={card.id} card={card} onMove={this.handleMove} />))}
    </fieldset>);
  }
}

export default Selection;