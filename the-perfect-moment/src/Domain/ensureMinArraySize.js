import CardState from './cardState';

function ensureMinArraySize(array, size) {
    if (array.length > size) {
        array = array.filter(x => x).filter(card => card.name !== "empty");
      }
      while (array.length < size) {
        array.push(new CardState());
      }
      return array;
 }

export default ensureMinArraySize;