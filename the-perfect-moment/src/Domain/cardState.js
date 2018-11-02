var _currentCardId = 0;
class CardState {
  constructor(name = "empty", action1 = null, action2 = null) {
    this.name = name;
    this.flipped = false;
    this.hidden = false;
    this.action1 = action1;
    this.action2 = action2;
    this.activationStep = "0";
    this.id = _currentCardId++;
    this.resetStatus = this.resetStatus.bind(this);
  }

  resetStatus() {
    this.hidden = false;
    this.flippable = false;
    this.equipable = false;
    this.giveable = false;
    this.discardable = false;
    this.returnable = false;
    this.activatable = false;
    this.swapable = false;
    this.scorable = false;
    this.swapTarget = "";
  }

  action(gameState, card) {
    if (this.flipped) {
      return this.action1.action(gameState, card);
    }
    else {
      return this.action2.action(gameState, card);
    }
  }
}

export default CardState;