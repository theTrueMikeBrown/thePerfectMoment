import CardState from './cardState';
import CardAction from './cardAction';
import Update from './update';

function resetAllStatuses(state) {
    state.player.revision.forEach(card => { card.resetStatus(); });
    state.player.equipment.forEach(card => { card.resetStatus(); });
    state.opponent.equipment.forEach(card => { card.resetStatus(); });
    state.paradox.forEach(card => { card.resetStatus(); });
}

var CardActions = {
    flowers: new CardAction("Flowers", (gameState, card) => { //up to 2 times: swap an equipped card with your revision.
        resetAllStatuses(gameState);
        gameState.player.equipment.forEach(equipmentCard => {
            if (card.activationStep === "0" || card.activationStep === "1") {
                equipmentCard.swapable = true;
                equipmentCard.swapTarget = "player.revision";
            }
        });
        gameState.player.revision.forEach(revisionCard => {
            if (card.activationStep === "0" || card.activationStep === "1") {
                revisionCard.flippable = true;
            }
        });

        if (card.activationStep === "0") {
            card.activationStep = "1";
            return new Update("Select an equipped card to swap with your revision.", false, true);
        }
        else if (card.activationStep === "1") {
            card.activationStep = "2";
            return new Update("Select another equipped card to swap with your revision.", false, true);
        }
        else if (card.activationStep === "2") {
            card.activationStep = "99";
        }
        return new Update("", true);
    }),
    poetry: new CardAction("Poetry", (gameState, card) => { //draw 2 cards. Return 2 cards.
        resetAllStatuses(gameState);

        var markReturnable = function () {
            gameState.player.equipment.forEach(equipmentCard => {
                equipmentCard.returnable = true;
            });
            gameState.player.revision.forEach(revisionCard => {
                revisionCard.returnable = true;
            });
        };

        if (card.activationStep === "0") {
            card.activationStep = "1";

            gameState.player.revision.push(gameState.deck.pop());
            gameState.player.revision.push(gameState.deck.pop());

            markReturnable();
            return new Update("Select a card to return.", false, false);
        }
        else if (card.activationStep === "1") {
            card.activationStep = "2";
            markReturnable();
            return new Update("Select another card to return.", false, false);
        }
        else if (card.activationStep === "2") {
            card.activationStep = "99";
        }
        return new Update("", true);
    }),
    candy: new CardAction("Candy", (gameState, card) => { }), //Draw 2 cards: equip 1, discard the other. Return an equipped card.
    ring: new CardAction("Ring", (gameState, card) => { //You and your opponent each select and trade a card.
        resetAllStatuses(gameState);
    
        if (card.activationStep === "0") {
            card.activationStep = "1";
    
            gameState.opponent.equipment.forEach(equipmentCard => {
                equipmentCard.tradeable = true;
                equipmentCard.swapTarget = "selection.player.revision";
            });
            gameState.opponent.revision.forEach(revisionCard => {
                revisionCard.tradeable = true;
                revisionCard.swapTarget = "selection.player.revision";
            });
            return new Update("Select a card for your opponent to trade with you.", false, true);
        }
        else if (card.activationStep === "1") {
            card.activationStep = "2";

            var target = (gameState.opponent.equipment.length < 2) ? "selection.opponent.equipment" : "selection.opponent.revision";

            gameState.player.equipment.forEach(equipmentCard => {
                equipmentCard.tradeable = true;
                equipmentCard.swapTarget = target;
            });
            gameState.player.revision.forEach(revisionCard => {
                revisionCard.tradeable = true;
                revisionCard.swapTarget = target;
            });    
            return new Update("Select a card to trade with your opponent.", false, true);
        }
        else if (card.activationStep === "2") {
//allow selection cards to be rotated and then sent along.

            card.activationStep = "99";
        }
        return new Update("", true);
    }),
    map: new CardAction("Map", (gameState, card) => { //Rotate 1 or 2 of your equipment cards
        resetAllStatuses(gameState);
        gameState.player.equipment.forEach(equipmentCard => {
            if (card.activationStep === "0" || card.activationStep === "1") {
                equipmentCard.flippable = true;
            }
        });

        if (card.activationStep === "0") {
            card.activationStep = "1";
            return new Update("Select an equipped card to rotate.", false, true);
        }
        if (card.activationStep === "1") {
            card.activationStep = "2";
            return new Update("Select another equipped card to rotate.", false, true);
        }
        else if (card.activationStep === "2") {
            card.activationStep = "99";
        }
        return new Update("", true);
    }),
    disguise: new CardAction("Disguise", (gameState, card) => { //Draw a card. Discard a card.
        resetAllStatuses(gameState);

        var markDiscardable = function () {
            gameState.player.equipment.forEach(equipmentCard => {
                equipmentCard.discardable = true;
            });
            gameState.player.revision.forEach(revisionCard => {
                revisionCard.discardable = true;
            });
        };

        if (card.activationStep === "0") {
            card.activationStep = "1";

            gameState.player.revision.push(gameState.deck.pop());

            markDiscardable();
            return new Update("Select a card to discard.", false, false);
        }
        else if (card.activationStep === "1") {
            card.activationStep = "99";
        }
        return new Update("", true);
    }),
    gun: new CardAction("Gun", (gameState, card) => { }), //Look at the top two cards of the deck. Return or discard them
    armor: new CardAction("Armor", (gameState, card) => { }), //Your opponent may score their revision for 1 point. Activate one of their items 2x.
    keys: new CardAction("Keys", (gameState, card) => { }), //Draw a card. Return an equipped card. Equip a card and activate it.
    phone: new CardAction("Phone", (gameState, card) => { //Discard 2 cards. Draw 2 cards.
        resetAllStatuses(gameState);

        var markDiscardable = function () {
            gameState.player.equipment.forEach(equipmentCard => {
                equipmentCard.discardable = true;
            });
            gameState.player.revision.forEach(revisionCard => {
                revisionCard.discardable = true;
            });
        };

        if (card.activationStep === "0") {
            card.activationStep = "1";
            markDiscardable();
            return new Update("Select a card to discard.", false, false);
        }
        else if (card.activationStep === "1") {
            card.activationStep = "2";
            markDiscardable();
            return new Update("Select another card to discard.", false, false);
        }
        else if (card.activationStep === "2") {
            card.activationStep = "99";

            gameState.player.revision.push(gameState.deck.pop());
            gameState.player.revision.push(gameState.deck.pop());
        }
        return new Update("", true);
    }),
    wallet: new CardAction("Wallet", (gameState, card) => {      //Rotate one of your opponent's equipment.   
        resetAllStatuses(gameState);
        gameState.opponent.equipment.forEach(equipmentCard => {
            if (card.activationStep === "0" || card.activationStep === "1") {
                equipmentCard.flippable = true;
            }
        });

        if (card.activationStep === "0") {
            card.activationStep = "1";
            return new Update("Select an opponent's equipped card to rotate.", false, true);
        }
        else if (card.activationStep === "1") {
            card.activationStep = "99";
        }
        return new Update("", true);
    }),
    tickets: new CardAction("Tickets", (gameState, card) => { }), //Look at the top 4 cards of the deck. Return them in any order.
};

var Cards = [
    new CardState('0.1', CardActions.poetry, CardActions.flowers),
    new CardState('0.2', CardActions.candy, CardActions.flowers),
    new CardState('0.3', CardActions.ring, CardActions.flowers),
    new CardState('0.4', CardActions.candy, CardActions.poetry),
    new CardState('0.5', CardActions.poetry, CardActions.ring),
    new CardState('0.6', CardActions.candy, CardActions.ring),
    new CardState('1.1', CardActions.disguise, CardActions.map),
    new CardState('1.2', CardActions.gun, CardActions.map),
    new CardState('1.3', CardActions.armor, CardActions.map),
    new CardState('1.4', CardActions.gun, CardActions.disguise),
    new CardState('1.5', CardActions.armor, CardActions.disguise),
    new CardState('1.6', CardActions.gun, CardActions.armor),
    new CardState('2.1', CardActions.keys, CardActions.phone),
    new CardState('2.2', CardActions.keys, CardActions.wallet),
    new CardState('2.3', CardActions.keys, CardActions.tickets),
    new CardState('2.4', CardActions.wallet, CardActions.phone),
    new CardState('2.5', CardActions.tickets, CardActions.phone),
    new CardState('2.6', CardActions.tickets, CardActions.wallet),
];

export default Cards;