import React from 'react';
import CardState from '../Domain/cardState';
import formatImage from "../Domain/formatImage";

class Card extends React.Component {
  constructor(props) {
    super(props);
    this.state = { card: new CardState() };
    this.activationStep = "0";
    this.flip = this.flip.bind(this);
    this.move = this.move.bind(this);
    this.equip = this.equip.bind(this);
    this.give = this.give.bind(this);
    this.discard = this.discard.bind(this);
    this.return = this.return.bind(this);
    this.swap = this.swap.bind(this);
    this.activate = this.activate.bind(this);
    this.state.card.resetStatus();
  }

  flip(e) {
    e.preventDefault();
    this.setState(state => {
      state.card.flipped = !state.card.flipped;
      return state;
    });
  }

  activateCard(card) {
    this.props.onActivate({
      card: this.state.card
    });
  }

  move(target) {
    this.props.onMove({
      card: this.state.card,
      target: target
    });
  }
  equip(e) { e.preventDefault(); this.move("equip"); }
  give(e) { e.preventDefault(); this.move("give"); }
  discard(e) { e.preventDefault(); this.move("discard"); }
  return(e) { e.preventDefault(); this.move("return"); }
  swap(e) { e.preventDefault(); this.move("swap"); }
  activate(e) { e.preventDefault(); this.activateCard(); }

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
        {this.state.card.giveable &&
          <img className="actionButton" src={formatImage("give")} onClick={this.give} />}
        {this.state.card.discardable &&
          <img className="actionButton" src={formatImage("discard")} onClick={this.discard} />}
        {this.state.card.returnable &&
          <img className="actionButton" src={formatImage("return")} onClick={this.return} />}
        {this.state.card.swapable &&
          <img className="actionButton" src={formatImage("swap")} onClick={this.swap} />}
        {this.state.card.activatable &&
            <img className="actionButton" src={formatImage("activate")} onClick={this.activate} />}
      </div>
    </div>);
  }
}

export default Card;