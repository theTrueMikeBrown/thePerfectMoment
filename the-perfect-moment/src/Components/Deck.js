import React from 'react';
import formatImage from "../Domain/formatImage";

class Deck extends React.Component {
  render() {
    var image = this.props.img || formatImage('BackPM');
    return (<fieldset className="deck">
      <legend>Deck</legend>
      <img className="art" src={image} alt="deck" title="deck" />
    </fieldset>);
  }
}

export default Deck;