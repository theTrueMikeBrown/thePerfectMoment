import React from 'react';
import Card from './Card';
import ensureMinArraySize from '../Domain/ensureMinArraySize';

class Paradox extends React.Component {
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
    var cards = ensureMinArraySize(this.props.cards || [], 1);

    return (<fieldset className="paradox">
      <legend>Paradox</legend>
      {cards.map(card => (<Card key={card.id} rotate="90" card={card} onActivate={this.handleActivate} onMove={this.handleMove} />))}
    </fieldset>);
  }
}

export default Paradox;