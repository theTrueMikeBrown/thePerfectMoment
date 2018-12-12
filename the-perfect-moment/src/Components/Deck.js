import React from 'react';
import formatImage from "../Domain/formatImage";

class Deck extends React.Component {
  render() {
    var image = this.props.img || formatImage('BackPM');
    
    var cards = this.props.cards || [];

    return (<fieldset className="deck">
      <legend>Deck</legend>
      
      {cards.map(card => {
        return (<div key={card.id} className="spacer"><div className="inline relative"><img className="card" src={image} alt="deck" title="deck" /></div></div>);
      })}
    </fieldset>);
  }
}

export default Deck;