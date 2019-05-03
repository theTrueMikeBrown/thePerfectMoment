import React from 'react';
import Deck from './Deck';
import ScorePile from './ScorePile';
import Paradox from './Paradox';
import Equipment from './Equipment';
import Fading from './Fading';
import Erased from './Erased';
import Plan from './Plan';
import Selection from './Selection';
import Cards from '../Domain/cards';
import resetAllStatuses from '../Domain/resetAllStatuses'
import seedrandom from 'seedrandom';

class Game extends React.Component {
  constructor(props) {    
    super(props);

    var timeStamp = new Date().getTime();    
    seedrandom(`${timeStamp}`, { global: true });
    //seedrandom('1556922193626', { global: true });

    this.setMessage = this.setMessage.bind(this);
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
        plan: [],
        equipment: [],
        scorePile: []
      },
      opponent: {
        plan: [],
        equipment: [],
        fading: [],
        erased: []
      },
      activationStack: [],
      selection: [],
      record: [`started at ${timeStamp}`]
    };

    this.state.draw = function () {
      if (this.state.deck.length > 0) {
        var card = this.state.deck.pop();
        card.resetStatus();
        this.state.record.push(`>drew ${card.getName()}`);
        return card;
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

    this.state.record.push(`Setting up game...`);
    this.state.record.push(`Drawing opponent's plan...`);
    this.state.opponent.plan.push(this.state.draw());
    this.state.record.push(`Drawing opponent's starting equipment...`);
    this.state.opponent.equipment.push(this.state.draw());
    this.state.record.push(`Drawing paradox...`);
    this.state.paradox.push(this.state.draw());
    this.state.record.push(`Drawing player's start cards...`);
    this.state.player.plan.push(this.state.draw());
    this.state.player.plan.push(this.state.draw());
    this.state.player.plan.push(this.state.draw());
    this.state.player.plan.push(this.state.draw());
  }

  setMessage(message) {
    this.state.message = message;
    this.state.record.push(`<${message}>`);
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

    if (activateData.reason === "userAction") {
      this.state.record.push(`${activateData.card.getActiveActionName(farside)} on ${activateData.card.getName()} has been activated`);
    }

    var setCopyMessage = function(message) {
      stateCopy.message = message;
      stateCopy.record.push(`<${message}>`);
    };

    if (!result.complete) {
      setCopyMessage(result.message);
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
        setCopyMessage("Select another equipment card to activate.");
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
    var setCopyMessage = function(message) {
      stateCopy.message = message;
      stateCopy.record.push(`<${message}>`);
    };

    if (this.checkGameEnd()) { return; }
    stateCopy.subPhase = "";
    if (this.isAnyCardScorable()) {
      setCopyMessage("Select a card to score.");
      stateCopy.actionAbortable = true;
      stateCopy.phase = "score.card";

      this.state.paradox.forEach(card => {
        if (this.isCardScorable(card)) {
          card.resetStatus();
          card.scorable = true;
        }
      });
      this.state.player.plan.forEach(card => {
        if (this.isCardScorable(card)) {
          card.resetStatus();
          card.scorable = true;
        }
      });
    }
    else {
      this.setMessage("==============It is now the echo's turn==============");
      this.doOpponentsTurn(stateCopy);
    }
  }

  requiresCleanup(stateCopy) {
    return stateCopy.player.plan.length !== 1 || stateCopy.player.equipment.length !== 2 ||
      stateCopy.opponent.plan.length !== 1 || stateCopy.opponent.equipment.length !== 2;
  }

  cleanup(stateCopy) {    
    var setCopyMessage = function(message) {
      stateCopy.message = message;
      stateCopy.record.push(`<${message}>`);
    };

    if (this.checkGameEnd()) { return; }
    if (stateCopy.player.plan.length > 1) {
      setCopyMessage("Equip a card from your hand.");
      stateCopy.actionAbortable = false;
      stateCopy.subPhase = "cleanup";
    }
  }

  echoReveal(state) {
    state.opponent.plan.forEach(card => {
      card.hidden = false;
      card.flippable = true;
      this.messWith(card.action1.name, state);
      this.messWith(card.action2.name, state);
      this.setMessage(`Your Echo reveals its plans: ${card.getName()}`);
    });
    state.actionAbortable = true;
    state.phase = "echo.reveal";
  }

  echoMission(state) {
    // EMBARK ON A MISSION - erase a card if possible (leftmost double match)
    var erased = null;
    state.opponent.plan.forEach(card => {
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
      this.setMessage(`erasing ${erased.getName()}!`);
    }
    else {
      state.opponent.plan.forEach(card => {
        if (!erased && this.canErase(card, state)) {
          state.opponent.erase(card);
          erased = card;
        }
      });
      if (erased) {
        state.opponent.plan = state.opponent.plan.filter(card => card.id !== erased.id);
        this.setMessage(`erasing ${erased.getName()}!`);
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
          this.setMessage(`erasing ${erased.getName()}!`);
        }
        else {
          //this.setMessage(`but fails to erase anything...`);
        }
      }
    }

    state.actionAbortable = true;

    if (!this.checkGameEnd()) {
      state.phase = erased ? "echo.embark.success" : "echo.embark.fail";
    }
    this.refillObjectives(state);
  }

  canErase(card, state) {
    var matches1 = 0;
    var matches2 = 0;
    var array = [];
    state.opponent.equipment.forEach(x => array.push(x));
    state.opponent.plan.forEach(x => array.push(x));
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
    state.opponent.plan.forEach(x => array.push(x));
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
        state.opponent.plan = state.opponent.plan.filter(x => card.id !== x.id);
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
    state.opponent.plan.forEach(x => array.push(x));
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
        state.opponent.plan = state.opponent.plan.filter(x => card.id !== x.id);
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
          this.state.record.push(`${card.getName()} was flipped to face the echo.`);
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
      //          draw a card to replace it, adding it to the plan (shifting things left)
      while (state.opponent.equipment.length < 2) {
        newCard = state.opponent.plan.pop();
        state.opponent.equipment.push(newCard);
      }
      var card = state.draw()
      state.opponent.plan.push(card);

      if (newCard) {
        this.setMessage(`Your Echo discards ${planBCard.getName()}, moves ${newCard.getName()} to its hand, and draws ${card.getName()}`);
      }
      else {
        this.setMessage(`Your Echo discards ${planBCard.getName()}, and draws ${card.getName()}`);
      }
    }
    else {
      this.setMessage(`Your Echo cannot determine which card to discard.`);
    }

    if (!this.checkGameEnd()) {
      state.phase = "echo.plan.b.setup";
    }
  }

  planB(state) {
    //          erase a card if possible (leftmost double match)
    this.echoMission(state);
    if (!this.checkGameEnd()) {
      state.phase = state.phase === "echo.embark.success" ? "echo.plan.b.success" : "echo.plan.b.fail"
    }

    this.setMessage("Your Echo switches to Plan B");
  }

  planBFade(state) {
    //          if not possible: fade leftmost card that matches 1 asset
    var fadeCard = this.grabSingleMatcher(state);
    if (fadeCard) {
      state.opponent.fade(fadeCard);
      this.setMessage(`Your Echo fades ${fadeCard.getName()}!`);

      if (!this.checkGameEnd()) {
        state.phase = "echo.plan.b.fade.success";
      }
    }
    else {

      if (!this.checkGameEnd()) {
        state.phase = "echo.plan.b.fade.fail";
      }
      this.setMessage(`Your Echo doesn't even fade anything... How ineffectual!`);
    }
  }

  doOpponentsTurn(state) {
    if (this.checkGameEnd()) { return; }
    resetAllStatuses(state);

    if (state.deck.length === 0) {
      this.state.phase = "finished";
      this.setMessage("The deck is empty. Game over.");
      return;
    }
    else if (!state.phase.startsWith("echo")) {
      state.turns++;
      this.echoReveal(state);
    }
    else if (state.phase === "echo.reveal") {
      this.echoMission(state);
      this.setMessage("Your Echo embarks on a mission, " + state.message);
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
      var plan = state.opponent.plan.pop();
      state.discard(plan);
      this.setMessage("==============It is now the player's turn==============");
      this.setMessage("Your echo discards its plan. It is your turn. Select an equipment card to activate.");
      this.state.record.push("Your echo draws a new plan...");
      state.actionAbortable = true;
      state.phase = "action.select.1";
    }

    while (state.opponent.plan.length < 1) { state.opponent.plan.push(this.state.draw()); }
    while (state.opponent.equipment.length < 2) { state.opponent.equipment.push(this.state.draw()); }
    while (state.paradox.length < 1) { state.paradox.push(this.state.draw()); }
  }

  isAnyCardScorable() {
    for (var i = 0; i < this.state.paradox.length; i++) {
      if (this.isCardScorable(this.state.paradox[i])) {
        return true;
      }
    }
    for (i = 0; i < this.state.player.plan.length; i++) {
      if (this.isCardScorable(this.state.player.plan[i])) {
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
    this.setMessage(`${card.getName()} is scored for ${points} points.`);
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
    if (state.player.plan.length < 1) { state.player.plan.push(state.draw()); }
    if (state.opponent.plan.length < 1) { state.opponent.plan.push(state.draw()); }
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
          this.state.record.push(`${cardState.getName()} rotates`);
        }
        return cardState;
      }

      if (target !== "none") {
        state.player.plan = state.player.plan.filter(card => card.id !== cardState.id);
        state.player.equipment = state.player.equipment.filter(card => card.id !== cardState.id);
        state.player.scorePile = state.player.scorePile.filter(card => card.id !== cardState.id);
        state.opponent.plan = state.opponent.plan.filter(card => card.id !== cardState.id);
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
        this.state.record.push(`Player equips ${cardState.getName()}`);
        cleanEmpties(state.player.equipment, 2);
      }
      else if (target === "give") {
        cardState.flipped = !cardState.flipped;
        if (state.opponent.equipment.filter(x => x.name !== "empty").length < 2) {
          state.opponent.equipment.push(cardState);
          cleanEmpties(state.opponent.equipment, 2);
          this.state.record.push(`${cardState.getName()} is given to echo`);
        }
        else {
          state.opponent.plan.push(cardState);
        }
      }
      else if (target === "discard") {
        state.discard(cardState);
        this.state.record.push(`${cardState.getName()} is discarded`);
      }
      else if (target === "return") {
        state.return(cardState);
        this.state.record.push(`${cardState.getName()} is returned`);
      }
      else if (target === "score") {
        this.state.record.push(`${cardState.getName()} is about to be scored`);
        this.scoreCard(cardState);
        if (this.checkGameEnd()) {
          debugger;
          return state;
        }
      }
      else if (target === "swap") {
        if (cardState.metadata === "player.plan") {
          this.state.record.push(`${cardState.getName()} is about to be swapped with the player's plan`);
          var temp = state.player.plan.pop();
          state.player.plan.push(cardState);
          state.player.equipment.push(temp);
        }
      }
      else if (target === "trade") {
        if (cardState.metadata.startsWith("selection")) {
          this.state.record.push(`${cardState.getName()} is about to be traded`);
          state.selection.push(cardState);
        }
      }
      else if (target === "take") {
        if (cardState.metadata === "selection.player.plan") {
          this.state.record.push(`${cardState.getName()} is about to be taken`);
          state.player.plan.push(cardState);
        }
      }

      if (state.phase === "setup.equip") {
        state.phase = "setup.give";
        this.setMessage("Select a card to give to your opponent.");
      }
      else if (this.state.phase === "setup.give") {
        state.player.equipment.push(this.state.draw());
        cleanEmpties(state.player.equipment, 2);
        state.phase = "setup.discard";
        this.setMessage("Select a card to return to the top of the deck or discard.");
      }
      else if (this.state.phase === "setup.discard") {
        state.phase = "action.select.1";
        this.setMessage("==============It is now the player's turn==============");
        this.setMessage("Select an equipment card to activate.");
        state.actionAbortable = true;
      }
      else if (this.state.phase.startsWith("action.select") &&
        (this.state.subPhase === "activate.card" || this.state.subPhase === "cleanup")) {
        state = this.activate(state.activationStack.pop());
      }
      else if (this.state.phase === "score.card") {
        this.setMessage("==============It is now the echo's turn==============");
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
      this.state.message = "";
      this.doOpponentsTurn(this.state);
      this.setState(stateCopy);
    }
  }

  render() {
    var phase = this.state.phase;
    var subPhase = this.state.subPhase;
    this.state.opponent.plan.forEach(card => {
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
      this.state.record.push(`Player is selecting a card to equip...`);
      this.state.player.plan.forEach(card => {
        if (card) {
          card.resetStatus();
          card.flippable = true;
          card.equipable = true;
        }
      });
    }
    else if (this.state.phase === "setup.give") {
      this.state.record.push(`Player is selecting a card to give to echo...`);
      this.state.player.plan.forEach(card => {
        if (card) {
          card.resetStatus();
          card.flippable = true;
          card.giveable = true;
        }
      });
    }
    else if (this.state.phase === "setup.discard") {
      this.state.record.push(`Player is selecting a card to discard...`);
      this.state.player.plan.forEach(card => {
        if (card) {
          card.resetStatus();
          card.discardable = true;
        }
      });
    }
    else if (this.state.phase.startsWith("action.select")) {
      if (this.state.subPhase === "activate.card") {
        /// the card should have done any state changes already
      }
      else if (this.state.subPhase === "cleanup") {
        this.state.player.plan.forEach(card => {
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
        this.state.player.plan.forEach(card => {
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
      this.state.player.plan.forEach(card => {
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
      abortArea = <img className="bigAbort actionButton" src="/img/abort.png" alt="done" title="Done" />;
    }

    var popup = null;
    var message = "What???";
    var fullText = "";
    var encoded = "";
    if (this.checkGameEnd()) {
      this.setMessage("==============Game over!==============");
      var points = this.state.player.scorePile.reduce((ac, x) => ac + x.scoredFor, 0);

      this.setMessage(`Game Over - The final score was ${points}`);
      if (points <= 0) {
        message = "You wake up in your bed. It was only a dream. You lose.";
      }
      else if (points <= 14) {
        message = "Existence was unmade. You lose.";
      }
      else if (points <= 17) {
        message = "You saved reality by sacrificing yourself. You lose, but not so badly.";
      }
      else if (points <= 20) {
        message = "It worked! Everything is as it should be. You win.";
      }
      else if (points <= 27) {
        message = "You are a master of space and time. You win completely.";
      }
      else if (points <= 32) {
        message = "How is this possible? Such a good score!";
      }
      else if (points === 33) {
        message = "You played a perfect game of the Perfect Moment.";
      }
      else {
        message = "You cheated.";
      }

      popup = "Score: " + points;
      fullText = this.state.record.join("\n");
      encoded = btoa(fullText);
    }

    //TODO: change setup to use Selection instead of plan
    return (<div className="game">
      <h2 onClick={this.abort}>{this.state.message}&nbsp;&nbsp;{abortArea}</h2>
      <div>
        <Erased flipped cards={this.state.opponent.erased} onMove={this.handleMove} />
        <Fading flipped cards={this.state.opponent.fading} onMove={this.handleMove} />
        <Equipment flipped cards={this.state.opponent.equipment} onActivate={this.handleActivate} onMove={this.handleMove} />
        <Plan flipped cards={this.state.opponent.plan} onMove={this.handleMove} />
      </div>
      <div>
        <Deck cards={this.state.deck} />
        <Paradox cards={this.state.paradox} onActivate={this.handleActivate} onMove={this.handleMove} />
      </div>
      <div>
        <ScorePile cards={this.state.player.scorePile} onMove={this.handleMove} />
        <Plan cards={this.state.player.plan} onMove={this.handleMove} />
        <Equipment cards={this.state.player.equipment} onActivate={this.handleActivate} onMove={this.handleMove} />
        <Selection cards={this.state.selection} onMove={this.handleMove} />
      </div>
      <div className="debuginfo">
        <h3>DebugInfo:</h3>
        <div>Phase: {this.state.phase}, Subphase: {this.state.subPhase}, Turns: {this.state.turns}</div>
        <div>Opponents plan:
          {this.state.opponent.plan.map(card => (<span key={card.name}>{card.getName()}, </span>))}
        </div>
        <div>Deck:
          {this.state.deck.map(card => (<span key={card.name}>{card.getName()}, </span>))}
        </div>
        <div>Activation Stack:
          {this.state.activationStack.map(x => (<span key={x.card.name}>{x.card && x.card.getName ? x.card.getName() : "-"}, </span>))}
        </div>
        <div>Record
          <ul>
          {this.state.record.slice(-25).map((x, index) => (<li key={index}>{x}, </li>))}
          </ul>
        </div>
      </div>
      <div className={popup ? "modal target" : "modal"} id="modal-one" aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-header">
            <h2>{this.state.message}</h2>
          </div>
          <div className="modal-body">
            <h3>{popup}</h3>
            <p>{message}</p>
            <a href={`data:application/octet-stream;charset=utf-16le;base64,${encoded}`} download="log.txt">Download log</a>
          </div>
        </div>
      </div>
    </div>);
  }
}

export default Game;