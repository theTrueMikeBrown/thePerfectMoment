import React from 'react';
import Card from './Card';
import ensureMinArraySize from '../Domain/ensureMinArraySize';

class Paradox extends React.Component {
  constructor(props) {
    super(props);
    this.handleActivate = this.handleActivate.bind(this);
  }
  
  handleActivate(activateData) {
    this.props.onActivate(activateData);
  }

  render() {
    var cards = ensureMinArraySize(this.props.cards || [], 1);

    return (<fieldset className="paradox">
      <legend>Paradox</legend>
      {cards.map(card => (<Card key={card.id} rotate="90" card={card} onActivate={this.handleActivate} />))}
    </fieldset>);
  }
}

export default Paradox;