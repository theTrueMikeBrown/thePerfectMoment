import React from 'react';

class ScorePile extends React.Component {
  render() {
    var flipped = this.props.flipped;
    if (flipped) {
      flipped = '180';
    }
    else {
      flipped = '';
    }
    return (<fieldset className="scorePile">
      <legend>Score Pile</legend>
    </fieldset>);
  }
}

export default ScorePile;