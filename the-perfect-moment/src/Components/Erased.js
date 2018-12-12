import React from 'react';
import formatImage from "../Domain/formatImage";

class Erased extends React.Component {
  constructor(props) {
    super(props);
    this.handleMove = this.handleMove.bind(this);
  }

  handleMove(moveData) {
    this.props.onMove(moveData);
  }

  render() {
    var image = this.props.img || formatImage('BackPM');
    var cards = this.props.cards || [];

    return (<fieldset className="erased">
      <legend>Erased</legend>
      {cards.map(card => {
        return (<div key={card.id} className="spacer"><img className="card" src={image} alt="erased" title="erased" /></div>);
      })}
    </fieldset>);
  }
}

export default Erased;