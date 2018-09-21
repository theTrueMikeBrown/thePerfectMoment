var _currentCardId = 0;
class CardState {
  constructor(name = "empty", flipped = false, hidden = false) {
    this.name = name;
    this.flipped = flipped;
    this.hidden = hidden;
    this.id = _currentCardId++;
  }
}

export default CardState;