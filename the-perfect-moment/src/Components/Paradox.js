import React from 'react';
import Card from './Card';
import ensureMinArraySize from '../Domain/ensureMinArraySize';

class Paradox extends React.Component {
  render() {
    var cards = ensureMinArraySize(this.props.cards || [], 1);

    return (<fieldset className="paradox">
      <legend>Paradox</legend>
      {cards.map(card => (<Card key={card.id} rotate="90" card={card} />))}
    </fieldset>);
  }
}

export default Paradox;