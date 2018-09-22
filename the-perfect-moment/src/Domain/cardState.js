var _currentCardId = 0;
class CardState {
  constructor(name = "empty") {
    this.name = name;
    this.flipped = false;
    this.hidden = false;
    this.id = _currentCardId++;
  }
}

export default CardState;