import React from 'react';
import CardState from '../Domain/cardState';
import { formatImage } from '../App';
export class Card extends React.Component {
  constructor(props) {
    super(props);
    this.state = { card: new CardState() };
    this.flip = this.flip.bind(this);
    this.equip = this.equip.bind(this);
  }
  flip(e) {
    e.preventDefault();
    this.setState(state => {
      state.card.flipped = !state.card.flipped;
      return state;
    });
  }
  equip(e) {
    e.preventDefault();
    this.props.onEquip(this.state.card);
  }
  render() {
    var getName = (card) => card.hidden ? 'BackPM' : card.name;
    var rotate = parseInt(this.props.rotate) || 0;
    this.state.card = this.props.card || new CardState();
    if (this.state.card.flipped) {
      rotate = (rotate + 180) % 360;
    }
    rotate = `rotate${rotate}`;
    return (<div className="inline relative">
      <div className={"card " + rotate}>
        <img className="art" src={formatImage(getName(this.state.card))} />
      </div>
      <div className="actionButtons">
        {this.state.card.flippable &&
          <img className="actionButton" src={formatImage("flip")} onClick={this.flip} />}
        {this.state.card.equipable &&
          <img className="actionButton" src={formatImage("equip")} onClick={this.equip} />}
      </div>
    </div>);
  }
}