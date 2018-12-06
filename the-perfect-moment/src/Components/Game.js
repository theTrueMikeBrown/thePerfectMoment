import React from 'react';
import Deck from './Deck';
import ScorePile from './ScorePile';
import Paradox from './Paradox';
import Equipment from './Equipment';
import Fading from './Fading';
import Erased from './Erased';
import Revision from './Revision';
import Selection from './Selection';
import Cards from '../Domain/cards';
import resetAllStatuses from '../Domain/resetAllStatuses'

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.handleMove = this.handleMove.bind(this);
    this.handleActivate = this.handleActivate.bind(this);
    this.activate = this.activate.bind(this);
    this.abort = this.abort.bind(this);
    this.isCardScorable = this.isCardScorable.bind(this);
    this.isAnyCardScorable = this.isAnyCardScorable.bind(this);
    this.isCardStealable = this.isCardStealable.bind(this);
    this.endActionPhase = this.endActionPhase.bind(this);
    this.doOpponentsTurn = this.doOpponentsTurn.bind(this);
    this.requiresCleanup = this.requiresCleanup.bind(this);
    this.cleanup = this.cleanup.bind(this);
    this.determinePoints = this.determinePoints.bind(this);
    this.scoreCard = this.scoreCard.bind(this);
    this.getInnerNames = this.getInnerNames.bind(this);
    this.checkGameEnd = this.checkGameEnd.bind(this);

    this.state = {
      phase: "setup.equip",
      subPhase: "",
      message: "Select a card to equip.",
      actionAbortable: false,
      deck: Cards,
      paradox: [],
      turns: 0,
      player: {
        revision: [],
        equipment: [],
        scorePile: []
      },
      opponent: {
        revision: [],
        equipment: [],
        fading: [],
        erased: []
      },
      activationStack: [],
      selection: []
    };

    this.state.draw = function () {
      if (this.state.deck.length > 0) {
        return this.state.deck.pop();
      }
      this.state.phase = "finished";
    }
    this.state.draw = this.state.draw.bind(this);

    this.state.discard = function (card) {
      this.state.deck.unshift(card);
    };
    this.state.discard = this.state.discard.bind(this);

    this.state.return = function (card) {
      this.state.deck.push(card);
    };
    this.state.return = this.state.return.bind(this);

    this.state.opponent.fade = function (card) {
      while (this.state.opponent.fading.length > 0) {
        var faded = this.state.opponent.fading.pop();
        faded.hidden = true;
        this.state.opponent.erased.push(faded);
      }
      card.hidden = false;
      this.state.opponent.fading.push(card)
    }
    this.state.opponent.fade = this.state.opponent.fade.bind(this);

    this.state.opponent.erase = function (card) {
      card.hidden = true;
      this.state.opponent.erased.push(card);
    }
    this.state.opponent.erase = this.state.opponent.erase.bind(this);

    this.shuffle(this.state.deck);

    this.state.opponent.revision.push(this.state.draw());
    this.state.opponent.equipment.push(this.state.draw());
    this.state.paradox.push(this.state.draw());
    this.state.player.revision.push(this.state.draw());
    this.state.player.revision.push(this.state.draw());
    this.state.player.revision.push(this.state.draw());
    this.state.player.revision.push(this.state.draw());
  }

  handleActivate(activateData) {
    activateData.card.activationStep = "0";

    var cardCopy = {};
    Object.assign(cardCopy, activateData.card);
    cardCopy.action = activateData.card.action;
    activateData.card = cardCopy;

    var stateCopy = this.activate(activateData);

    this.setState(stateCopy);
  }

  checkGameEnd() {
    return this.state.phase === "finished";
  }

  activate(activateData) {
    if (this.checkGameEnd()) { return this.state; }
    if (!activateData.card) {
      debugger;
      return;
    }

    var farside = (activateData.option.includes("farside")) !== (activateData.option.includes("opponents"));
    var result = activateData.card.action(this.state, activateData, farside)
    var stateCopy = this.state;
    stateCopy.subPhase = "";
    if (!result) {
      debugger;
      return;
    }
    if (!result.complete) {
      stateCopy.message = result.message;
      stateCopy.actionAbortable = result.abortable;
      stateCopy.subPhase = "activate.card";
      stateCopy.activationStack.push(activateData);
    }
    else {
      if (this.requiresCleanup(stateCopy)) {
        this.cleanup(stateCopy);
        activateData.reason = "requiresCleanup";
        stateCopy.activationStack.push(activateData);
      }
      else if (stateCopy.activationStack.length > 0) {
        var activation = stateCopy.activationStack.pop();
        activation.card.activationStep = "0";
        stateCopy = this.activate(activation);
      }
      else if (this.state.phase === "action.select.1") {
        stateCopy.message = "Select another equipment card to activate."
        stateCopy.actionAbortable = true;
        stateCopy.phase = "action.select.2";
      }
      else if (this.state.phase === "action.select.2") {
        this.endActionPhase(stateCopy);
      }
    }
    return stateCopy;
  }

  endActionPhase(stateCopy) {
    if (this.checkGameEnd()) { return; }
    stateCopy.subPhase = "";
    if (this.isAnyCardScorable()) {
      stateCopy.message = "Select a card to score.";
      stateCopy.actionAbortable = true;
      stateCopy.phase = "score.card";

      this.state.paradox.forEach(card => {
        if (this.isCardScorable(card)) {
          card.resetStatus();
          card.scorable = true;
        }
      });
      this.state.player.revision.forEach(card => {
        if (this.isCardScorable(card)) {
          card.resetStatus();
          card.scorable = true;
        }
      });
    }
    else {
      this.doOpponentsTurn(stateCopy);
    }
  }

  requiresCleanup(stateCopy) {
    return stateCopy.player.revision.length !== 1 || stateCopy.player.equipment.length !== 2 ||
      stateCopy.opponent.revision.length !== 1 || stateCopy.opponent.equipment.length !== 2;
  }

  cleanup(stateCopy) {
    if (this.checkGameEnd()) { return; }
    if (stateCopy.player.revision.length > 1) {
      stateCopy.message = "Equip a card from your hand."
      stateCopy.actionAbortable = false;
      stateCopy.subPhase = "cleanup";
    }
  }

  echoReveal(state) {
    state.opponent.revision.forEach(card => {
      card.hidden = false;
      card.flippable = true;
      this.messWith(card.action1.name, state);
      this.messWith(card.action2.name, state);
      state.message = `Your Echo reveals its plans: ${card.action1.name}/${card.action2.name}`;
    });
    state.actionAbortable = true;
    state.phase = "echo.reveal";
  }

  echoMission(state) {
    // EMBARK ON A MISSION - erase a card if possible (leftmost double match)
    var erased = null;
    state.opponent.revision.forEach(card => {
      card.flippable = false;
    });
    state.opponent.equipment.forEach(card => {
      if (!erased && this.canErase(card, state)) {
        state.opponent.erase(card);
        erased = card;
      }
    });
    if (erased) {
      state.opponent.equipment = state.opponent.equipment.filter(card => card.id !== erased.id);
      state.message = `erasing ${erased.action1.name}/${erased.action2.name}!`;
    }
    else {
      state.opponent.revision.forEach(card => {
        if (!erased && this.canErase(card, state)) {
          state.opponent.erase(card);
          erased = card;
        }
      });
      if (erased) {
        state.opponent.revision = state.opponent.revision.filter(card => card.id !== erased.id);
        state.message = `erasing ${erased.action1.name}/${erased.action2.name}!`;
      }
      else {
        state.paradox.forEach(card => {
          if (!erased && this.canErase(card, state)) {
            state.opponent.erase(card);
            erased = card;
          }
        });
        if (erased) {
          state.paradox = state.paradox.filter(card => card.id !== erased.id);
          state.message = `erasing ${erased.action1.name}/${erased.action2.name}!`;
        }
        else {
          state.message = `but fails to erase anything...`;
        }
      }
    }

    state.actionAbortable = true;
    state.phase = erased ? "echo.embark.success" : "echo.embark.fail";
    this.refillObjectives(state);
  }

  canErase(card, state) {
    var matches1 = 0;
    var matches2 = 0;
    var array = [];
    state.opponent.equipment.forEach(x => array.push(x));
    state.opponent.revision.forEach(x => array.push(x));
    state.paradox.forEach(x => array.push(x));

    array.forEach(x => {
      if (card.action1.name === x.action1.name || card.action1.name === x.action2.name) { matches1++; }
      if (card.action2.name === x.action1.name || card.action2.name === x.action2.name) { matches2++; }
    });

    return matches1 > 1 && matches2 > 1
  }

  grabPlanBCard(state) {
    //get leftmost no-single-match card,   
    var array = [];
    state.opponent.equipment.forEach(x => array.push(x));
    state.opponent.revision.forEach(x => array.push(x));
    state.paradox.forEach(x => array.push(x));

    for (let i = 0; i < array.length; i++) {
      const card = array[i];

      var matchCount = array.filter(x => {
        return card.action1.name === x.action1.name ||
          card.action1.name === x.action2.name ||
          card.action2.name === x.action1.name ||
          card.action2.name === x.action2.name;
      }).length;

      if (matchCount === 1) {
        state.opponent.revision = state.opponent.revision.filter(x => card.id !== x.id);
        state.opponent.equipment = state.opponent.equipment.filter(x => card.id !== x.id);
        state.paradox = state.paradox.filter(x => card.id !== x.id);
        return card;
      }
    }
  }

  grabSingleMatcher(state) {
    //get leftmost card that matches 1 or more asset
    var array = [];
    state.opponent.equipment.forEach(x => array.push(x));
    state.opponent.revision.forEach(x => array.push(x));
    state.paradox.forEach(x => array.push(x));

    for (let i = 0; i < array.length; i++) {
      const card = array[i];

      var matchCount = array.filter(x => {
        return card.action1.name === x.action1.name ||
          card.action1.name === x.action2.name ||
          card.action2.name === x.action1.name ||
          card.action2.name === x.action2.name;
      }).length;

      if (matchCount >= 2) {
        state.opponent.revision = state.opponent.revision.filter(x => card.id !== x.id);
        state.opponent.equipment = state.opponent.equipment.filter(x => card.id !== x.id);
        state.paradox = state.paradox.filter(x => card.id !== x.id);
        return card;
      }
    }
  }

  messWith(cardName, state) {
    //rotate all player squipment to face the opponent if it matches name
    state.player.equipment.forEach(card => {
      if ((card.action1.name === cardName && card.flipped) ||
        (card.action2.name === cardName && !card.flipped)) {
        card.flipped = !card.flipped;
      }
    });
  }

  planBSetup(state) {
    // PLAN B - discard leftmost no-single-match card,
    var planBCard = this.grabPlanBCard(state);
    var newCard;
    if (planBCard) {
      state.discard(planBCard);
      //          draw a card to replace it, adding it to the revision (shifting things left)
      while (state.opponent.equipment.length < 2) {
        newCard = state.opponent.revision.pop();
        state.opponent.equipment.push(newCard);
      }
      var card = state.draw()
      state.opponent.revision.push(card);
      state.message = `Your Echo discards ${planBCard.action1.name}/${planBCard.action2.name}, moves ${newCard.action1.name}/${newCard.action2.name} to its hand, and draws ${card.action1.name}/${card.action2.name}`;
    }
    else {
      state.message = `Your Echo cannot determine which card to discard.`;
    }
    state.phase = "echo.plan.b.setup";
  }

  planB(state) {
    //          erase a card if possible (leftmost double match)
    this.echoMission(state);
    state.phase = state.phase === "echo.embark.success" ? "echo.plan.b.success" : "echo.plan.b.fail"

    state.message = "Your Echo switches to Plan B, " + state.message;
  }

  planBFade(state) {
    //          if not possible: fade leftmost card that matches 1 asset
    var fadeCard = this.grabSingleMatcher(state);
    if (fadeCard) {
      state.opponent.fade(fadeCard);
      state.message = `Your Echo fades ${fadeCard.action1.name}/${fadeCard.action2.name}!`;
      state.phase = "echo.plan.b.fade.success";
    }
    else {
      state.phase = "echo.plan.b.fade.fail";
      state.message = `Your Echo doesn't even fade anything... How ineffectual!`;
    }
  }

  doOpponentsTurn(state) {
    if (this.checkGameEnd()) { return; }
    resetAllStatuses(state);

    if (!state.phase.startsWith("echo")) {
      state.turns++;

      this.echoReveal(state);
    }
    else if (state.phase === "echo.reveal") {
      this.echoMission(state);
      state.message = "Your Echo embarks on a mission, " + state.message;
    }
    else if (state.phase === "echo.embark.fail") {
      this.planBSetup(state);
    }
    else if (state.phase === "echo.plan.b.setup") {
      this.planB(state);
    }
    else if (state.phase === "echo.plan.b.fail") {
      this.planBFade(state);
    }
    else {
      state.message = "Select an equipment card to activate.";
      state.actionAbortable = true;
      state.phase = "action.select.1";
    }

    while (state.opponent.revision.length < 1) { state.opponent.revision.push(this.state.draw()); }
    while (state.opponent.equipment.length < 2) { state.opponent.equipment.push(this.state.draw()); }
    while (state.paradox.length < 1) { state.paradox.push(this.state.draw()); }
  }

  isAnyCardScorable() {
    for (var i = 0; i < this.state.paradox.length; i++) {
      if (this.isCardScorable(this.state.paradox[i])) {
        return true;
      }
    }
    for (i = 0; i < this.state.player.revision.length; i++) {
      if (this.isCardScorable(this.state.player.revision[i])) {
        return true;
      }
    }
    for (i = 0; i < this.state.player.scorePile.length; i++) {
      if (this.isCardStealable(this.state.player.scorePile[i])) {
        return true;
      }
    }
    for (i = 0; i < this.state.opponent.fading.length; i++) {
      if (this.isCardStealable(this.state.opponent.fading[i])) {
        return true;
      }
    }
    return false;
  }

  isCardStealable(card) {
    return !card.hidden && this.determinePoints(card) > 1;
  }
  
  isCardScorable(card) {
    return !card.hidden && this.state.player.equipment.some(equipmentCard =>
      equipmentCard.action1 === card.action1 ||
      equipmentCard.action1 === card.action2 ||
      equipmentCard.action2 === card.action1 ||
      equipmentCard.action2 === card.action2);
  }

  getOuterNames(cards) {
    var output = [];
    cards.filter(x => x).forEach(card => {
      output.push((card.flipped) ? card.action1.name : card.action2.name);
    });
    return output;
  }

  getInnerNames(cards) {
    var output = [];
    cards.filter(x => x).forEach(card => {
      output.push(!(card.flipped) ? card.action1.name : card.action2.name);
    });
    return output;
  }

  determinePoints(card) {
    var outerNames = this.getOuterNames(this.state.player.equipment);
    var innerNames = this.getInnerNames(this.state.player.equipment);
    var allnames = outerNames.concat(innerNames);

    if ((outerNames.includes(card.action1.name) && outerNames.includes(card.action2.name)) ||
      (innerNames.includes(card.action1.name) && innerNames.includes(card.action2.name))) {
      return 3;
    }
    if (allnames.includes(card.action1.name) && allnames.includes(card.action2.name)) {
      return 2;
    }
    if (allnames.includes(card.action1.name) || allnames.includes(card.action2.name)) {
      return 1;
    }
    else {
      return 0;
    }
  }

  scoreCard(card, points = null) {
    points = points || this.determinePoints(card);
    if (points === 3) {
      card.hidden = true;
      card.rotate = 90;
      card.flipped = false;
      card.scoredFor = 3;
      this.state.player.scorePile.push(card);
    }
    else if (points === 2) {
      card.hidden = true;
      card.rotate = 270;
      card.flipped = false;
      this.state.player.scorePile.push(card);
      card.scoredFor = 2;
    }
    else {
      card.hidden = false;
      card.rotate = 270;
      card.flipped = false;
      this.state.player.scorePile.push(card);
      card.scoredFor = 1;
    }

    this.refillObjectives(this.state);
  }

  refillObjectives(state) {
    if (state.paradox.length < 1) { state.paradox.push(state.draw()); }
    if (state.player.revision.length < 1) { state.player.revision.push(state.draw()); }
    if (state.opponent.revision.length < 1) { state.opponent.revision.push(state.draw()); }
  }

  handleMove(moveData) {
    if (this.checkGameEnd()) { return; }

    const cardState = moveData.card
    const target = moveData.target;

    this.setState(state => {
      var metadata = cardState.metadata;
      cardState.resetStatus();
      cardState.metadata = metadata;

      if (state.activationStack.length !== 0) {
        var activation = state.activationStack[state.activationStack.length - 1];
        activation.reason = activation.oldReason || "???";
      }

      if (target === "flip") {
        cardState.flipped = !cardState.flipped;
        if (this.state.phase.startsWith("action.select") &&
          (this.state.subPhase === "activate.card" || this.state.subPhase === "cleanup")) {
          var activation = state.activationStack.pop();
          activation.oldReason = activation.reason;
          activation.reason = "flipped";
          state = this.activate(activation);
        }
        return cardState;
      }

      if (target !== "none") {
        state.player.revision = state.player.revision.filter(card => card.id !== cardState.id);
        state.player.equipment = state.player.equipment.filter(card => card.id !== cardState.id);
        state.player.scorePile = state.player.scorePile.filter(card => card.id !== cardState.id);
        state.opponent.revision = state.opponent.revision.filter(card => card.id !== cardState.id);
        state.opponent.equipment = state.opponent.equipment.filter(card => card.id !== cardState.id);
        state.opponent.fading = state.opponent.fading.filter(card => card.id !== cardState.id);
        state.opponent.erased = state.opponent.erased.filter(card => card.id !== cardState.id);
        state.selection = state.selection.filter(card => card.id !== cardState.id);
        state.paradox = state.paradox.filter(card => card.id !== cardState.id);
        state.deck = state.deck.filter(card => card.id !== cardState.id);
      }

      var cleanEmpties = function (collection, count) {
        while (collection.length > count) {
          var index = collection.findIndex(x => x.name === "empty");
          if (index !== -1) {
            collection.splice(index, 1);
          }
          else {
            break;
          }
        }
      }

      if (target === "equip") {
        state.player.equipment.push(cardState);
        cleanEmpties(state.player.equipment, 2);
      }
      else if (target === "give") {
        cardState.flipped = !cardState.flipped;
        if (state.opponent.equipment.filter(x => x.name !== "empty").length < 2) {
          state.opponent.equipment.push(cardState);
          cleanEmpties(state.opponent.equipment, 2);
        }
        else {
          state.opponent.revision.push(cardState);
        }
      }
      else if (target === "discard") {
        state.discard(cardState);
      }
      else if (target === "return") {
        state.return(cardState);
      }
      else if (target === "score") {
        this.scoreCard(cardState);
        if(this.checkGameEnd()) {
          return state;
        }
      }
      else if (target === "swap") {
        if (cardState.metadata === "player.revision") {
          var temp = state.player.revision.pop();
          state.player.revision.push(cardState);
          state.player.equipment.push(temp);
        }
      }
      else if (target === "trade") {
        if (cardState.metadata.startsWith("selection")) {
          state.selection.push(cardState);
        }
      }
      else if (target === "take") {
        if (cardState.metadata === "selection.player.revision") {
          state.player.revision.push(cardState);
        }
      }

      if (state.phase === "setup.equip") {
        state.phase = "setup.give";
        state.message = "Select a card to give to your opponent.";
      }
      else if (this.state.phase === "setup.give") {
        state.player.equipment.push(this.state.draw());
        cleanEmpties(state.player.equipment, 2);
        state.phase = "setup.discardOrReturn";
        state.message = "Select a card to return to the top of the deck or discard.";
      }
      else if (this.state.phase === "setup.discardOrReturn") {
        state.phase = "action.select.1";
        state.message = "Select an equipment card to activate.";
        state.actionAbortable = true;
      }
      else if (this.state.phase.startsWith("action.select") &&
        (this.state.subPhase === "activate.card" || this.state.subPhase === "cleanup")) {
        state = this.activate(state.activationStack.pop());
      }
      else if (this.state.phase === "score.card") {
        this.doOpponentsTurn(this.state);
      }
      return state;
    });
  }

  shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;
    while (0 !== currentIndex) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
      temporaryValue.flipped = (Math.random() >= 0.5);
    }
    return array;
  }

  abort(e) {
    e.preventDefault();
    var stateCopy = this.state;
    if (this.state.subPhase === "activate.card") {
      var activation = this.state.activationStack.pop();
      activation.card.activationStep = "99";
      var stateCopy = this.activate(activation);
      this.setState(stateCopy);
    }
    else if (this.state.phase.startsWith("action.select")) {
      this.endActionPhase(stateCopy);
      this.setState(stateCopy);
    }
    else if (this.state.phase === "score.card" ||
      this.state.phase.startsWith("echo.")) {
      this.doOpponentsTurn(this.state);
      this.setState(stateCopy);
    }
  }

  render() {
    var phase = this.state.phase;
    var subPhase = this.state.subPhase;
    this.state.opponent.revision.forEach(card => {
      if (card) {
        if (!(phase.startsWith("action.select") && subPhase === "activate.card")) {
          card.resetStatus();
        }
        card.hidden = phase.startsWith("echo.") ? false : true;
      }
    });

    this.state.player.scorePile.forEach(card => {
      if (card) {
        card.scorable = false;
      }
    });

    if (this.state.phase === "setup.equip") {
      this.state.player.revision.forEach(card => {
        if (card) {
          card.resetStatus();
          card.flippable = true;
          card.equipable = true;
        }
      });
    }
    else if (this.state.phase === "setup.give") {
      this.state.player.revision.forEach(card => {
        if (card) {
          card.resetStatus();
          card.flippable = true;
          card.giveable = true;
        }
      });
    }
    else if (this.state.phase === "setup.discardOrReturn") {
      this.state.player.revision.forEach(card => {
        if (card) {
          card.resetStatus();
          card.discardable = true;
          card.returnable = true;
        }
      });
    }
    else if (this.state.phase.startsWith("action.select")) {
      if (this.state.subPhase === "activate.card") {
        /// the card should have done any state changes already
      }
      else if (this.state.subPhase === "cleanup") {
        this.state.player.revision.forEach(card => {
          if (card) {
            card.resetStatus();
            card.equipable = true;
            card.flippable = true;
          }
        });
        this.state.player.equipment.forEach(card => {
          if (card) {
            card.resetStatus();
          }
        });
        this.state.opponent.equipment.forEach(card => {
          if (card) {
            card.resetStatus();
          }
        });
        this.state.paradox.forEach(card => {
          if (card) {
            card.resetStatus();
          }
        });
      }
      else {
        this.state.player.revision.forEach(card => {
          if (card) {
            card.resetStatus();
          }
        });
        this.state.player.equipment.forEach(card => {
          if (card) {
            card.resetStatus();
            card.activatable = true;
          }
        });
        this.state.opponent.equipment.forEach(card => {
          if (card) {
            card.resetStatus();
            card.activatable = true;
          }
        });
        this.state.paradox.forEach(card => {
          if (card) {
            card.resetStatus();
            card.activatable = true;
          }
        });
      }
    }
    else if (this.state.phase === "score.card") {
      this.state.player.revision.forEach(card => {
        if (card) {
          card.resetStatus();
          if (this.isCardScorable(card, this.state)) { card.scorable = true; }
        }
      });
      this.state.opponent.fading.forEach(card => {
        if (card) {
          card.resetStatus();
          if (this.isCardStealable(card, this.state)) { card.scorable = true; }
        }
      });
      this.state.player.scorePile.forEach(card => {
        if (card) {
          if (this.isCardStealable(card, this.state)) { card.scorable = true; }
        }
      });
      this.state.player.equipment.forEach(card => {
        if (card) {
          card.resetStatus();
        }
      });
      this.state.opponent.equipment.forEach(card => {
        if (card) {
          card.resetStatus();
        }
      });
      this.state.paradox.forEach(card => {
        if (card) {
          card.resetStatus();
          if (this.isCardScorable(card)) { card.scorable = true; }
        }
      });
    }

    var abortArea = <div />;
    if (this.state.actionAbortable) {
      abortArea = <img className="bigAbort actionButton" src="/img/abort.png" onClick={this.abort} alt="done" title="Done" />;
    }

    var popup = null;
    if (this.checkGameEnd()) {
      this.state.message = "Game Over!";
      var points = this.state.player.scorePile.reduce((ac, x) => ac + x.scoredFor, 0);
      popup = "Score: " + points;
    }

    //TODO: change setup to use Selection instead of revision
    return (<div className="game">
      <h2>{this.state.message}&nbsp;&nbsp;{abortArea}</h2>
      <div>
        <Erased flipped cards={this.state.opponent.erased} onMove={this.handleMove} />
        <Fading flipped cards={this.state.opponent.fading} onMove={this.handleMove} />
        <Equipment flipped cards={this.state.opponent.equipment} onActivate={this.handleActivate} onMove={this.handleMove} />
        <Revision flipped cards={this.state.opponent.revision} onMove={this.handleMove} />
      </div>
      <div>
        <Deck />
        <Paradox cards={this.state.paradox} onActivate={this.handleActivate} onMove={this.handleMove} />
      </div>
      <div>
        <ScorePile cards={this.state.player.scorePile} onMove={this.handleMove} />
        <Revision cards={this.state.player.revision} onMove={this.handleMove} />
        <Equipment cards={this.state.player.equipment} onActivate={this.handleActivate} onMove={this.handleMove} />
        <Selection cards={this.state.selection} onMove={this.handleMove} />
      </div>
      <div>DebugInfo: {this.state.phase}, {this.state.subPhase}, {this.state.turns}</div>
      <div>revision:
        {this.state.opponent.revision.map(card => (<span key={card.name}>{card.name}, </span>))}
      </div>
      <div>deck:
        {this.state.deck.map(card => (<span key={card.name}>{card.name}, </span>))}
      </div>
      <div>activationStack:
        {this.state.activationStack.map(x => (<span key={x.card.name}>{x.card.name}, </span>))}
      </div>
      <div className={popup ? "modal target" : "modal"} id="modal-one" aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-header">
            <h2>{this.state.message}</h2>
          </div>
          <div className="modal-body">
            <p>{popup}</p>
          </div>
        </div>
      </div>
    </div>);
  }
}

export default Game;