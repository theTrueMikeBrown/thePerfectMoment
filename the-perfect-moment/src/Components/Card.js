import React from 'react';
import CardState from '../Domain/cardState';
import formatImage from "../Domain/formatImage";

class Card extends React.Component {
  constructor(props) {
    super(props);
    this.state = { card: new CardState() };
    this.flip = this.flip.bind(this);
    this.move = this.move.bind(this);
    this.equip = this.equip.bind(this);
    this.score = this.score.bind(this);
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

  activateCard(e) {
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
  score(e) { e.preventDefault(); this.move("score"); }
  give(e) { e.preventDefault(); this.move("give"); }
  discard(e) { e.preventDefault(); this.move("discard"); }
  return(e) { e.preventDefault(); this.move("return"); }
  swap(e) { e.preventDefault(); this.move("swap"); }
  activate(e) { e.preventDefault(); this.activateCard(); }

  render() {
    var getName = (card) => card.hidden ? 'BackPM' : card.name;
    var rotate = parseInt(this.props.rotate, 10) || 0;

    var stateCopy = this.state;
    stateCopy.card = this.props.card || new CardState();
    //vvvvvvvvvvvvvvvvvvvvvvvvv - this is unnecessary, since it will get called elsewhere
    //this.setState(stateCopy);

    if (this.state.card.flipped) {
      rotate = (rotate + 180) % 360;
    }
    rotate = `rotate${rotate}`;
    return (<div className="inline relative">
      <div className={"card " + rotate}>
        <img className="art" src={formatImage(getName(this.state.card))} alt={getName(this.state.card)} />
      </div>
      <div className="actionButtons">
        {this.state.card.flippable &&
          <img className="actionButton" src={formatImage("flip")} onClick={this.flip} alt="flip card" title="flip card" />}
        {this.state.card.equipable &&
          <img className="actionButton" src={formatImage("equip")} onClick={this.equip} alt="equip card" title="equip card" />}
        {this.state.card.scorable &&
          <img className="actionButton" src={formatImage("score")} onClick={this.score} alt="score card" title="score card" />}
        {this.state.card.giveable &&
          <img className="actionButton" src={formatImage("give")} onClick={this.give} alt="give card" title="give card" />}
        {this.state.card.discardable &&
          <img className="actionButton" src={formatImage("discard")} onClick={this.discard} alt="discard card" title="discard card" />}
        {this.state.card.returnable &&
          <img className="actionButton" src={formatImage("return")} onClick={this.return} alt="return card" title="return card" />}
        {this.state.card.swapable &&
          <img className="actionButton" src={formatImage("swap")} onClick={this.swap} alt="swap card" title="swap card" />}
        {this.state.card.activatable &&
          <img className="actionButton" src={formatImage("activate")} onClick={this.activate} alt="activate card" title="activate card" />}
      </div>
    </div>);
  }
}

export default Card;