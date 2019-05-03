import CardState from './cardState';
import CardAction from './cardAction';
import Update from './update';
import resetAllStatuses from './resetAllStatuses'

var ifNoFlip = function(activateData, action) {
    if (activateData.reason === "flipped") {
        activateData.reason = activateData.oldReason;
    }
    else {
        action();
    }
 };

var CardActions = {
    flowers: new CardAction("Flowers", (gameState, activateData) => { //up to 2 times: swap an equipped card with your plan.
        var card = activateData.card;

        resetAllStatuses(gameState);
        gameState.player.equipment.forEach(equipmentCard => {
            if (card.activationStep === "0" || card.activationStep === "1" || activateData.reason === "flipped") {
                equipmentCard.swapable = true;
                equipmentCard.metadata = "player.plan";
            }
        });
        gameState.player.plan.forEach(planCard => {
            if (card.activationStep === "0" || card.activationStep === "1" || activateData.reason === "flipped") {
                planCard.flippable = true;
            }
        });

        if (card.activationStep === "0" ||
            (card.activationStep === "1" && activateData.reason === "flipped")) {
            card.activationStep = "1";
            return new Update("Select an equipped card to swap with your plan.", false, true);
        }
        else if (card.activationStep === "1" ||
             (card.activationStep === "2" && activateData.reason === "flipped")) {
            card.activationStep = "2";
            return new Update("Select another equipped card to swap with your plan.", false, true);
        }
        else if (card.activationStep === "2") {
            card.activationStep = "99";
        }
        return new Update("", true);
    }),
    poetry: new CardAction("Poetry", (gameState, activateData) => { //draw 2 cards. Return 2 cards.
        var card = activateData.card;
        resetAllStatuses(gameState);

        var markReturnable = function () {
            gameState.player.equipment.forEach(equipmentCard => {
                equipmentCard.returnable = true;
            });
            gameState.player.plan.forEach(planCard => {
                planCard.returnable = true;
            });
        };

        if (card.activationStep === "0") {
            card.activationStep = "1";

            gameState.player.plan.push(gameState.draw());
            gameState.player.plan.push(gameState.draw());
            if (gameState.phase === "finished") { return new Update("Game over!", true) }

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
    candy: new CardAction("Chocolates", (gameState, activateData) => { //Draw 2 cards: equip 1, discard the other. Return an equipped card.
        var card = activateData.card;
        resetAllStatuses(gameState);

        if (card.activationStep === "0") {
            ifNoFlip(activateData, () => card.activationStep = "1");
            
            gameState.selection.push(gameState.draw());
            gameState.selection.push(gameState.draw());
            if (gameState.phase === "finished") { return new Update("Game over!", true) }

            gameState.selection.forEach(card => {
                card.equipable = true;
                card.flippable = true;
            });
            return new Update("Equip one of the selected cards. The other will be discarded.", false, false);
        }
        else if (card.activationStep === "1") {
            if (gameState.selection.length === 1) {
                gameState.deck.unshift(gameState.selection.pop());
                ifNoFlip(activateData, () => card.activationStep = "2");
            }
            else {
                gameState.selection.forEach(card => {
                    card.equipable = true;
                    card.flippable = true;
                });
                return new Update("Equip one of the selected cards. The other will be discarded.", false, false);
            }
        } if (card.activationStep === "2") {
            gameState.player.equipment.forEach(card => {
                card.returnable = true;
            });
            ifNoFlip(activateData, () => card.activationStep = "99");
            return new Update("Return an equipped card.", false, false);
        }
        return new Update("", true);
    }),
    ring: new CardAction("Ring", (gameState, activateData) => { //You and your opponent each select and trade a card.
        var card = activateData.card;
        resetAllStatuses(gameState);

        if (card.activationStep === "0") {
            card.activationStep = "1";

            var target = (gameState.opponent.equipment.length < 2) ?
                "selection.opponent.equipment" :
                "selection.opponent.plan";

            gameState.player.equipment.forEach(equipmentCard => {
                equipmentCard.tradeable = true;
                equipmentCard.metadata = target;
            });
            gameState.player.plan.forEach(planCard => {
                planCard.tradeable = true;
                planCard.metadata = target;
            });
            return new Update("Select a card to trade with your opponent.", false, false);
        }
        else if (card.activationStep === "1") {
            card.activationStep = "2";

            gameState.opponent.equipment.forEach(equipmentCard => {
                equipmentCard.tradeable = true;
                equipmentCard.metadata = "selection.player.plan";
            });
            gameState.opponent.plan.forEach(planCard => {
                planCard.tradeable = true;
                planCard.metadata = "selection.player.plan";
            });
            return new Update("Select a card for your opponent to trade with you.", false, false);
        }
        else if (card.activationStep === "2") {
            gameState.selection.forEach(equipmentCard => {
                equipmentCard.flippable = true;
                if (equipmentCard.metadata.startsWith("selection.opponent")) {
                    equipmentCard.giveable = true;
                }
                else {
                    equipmentCard.takeable = true;
                }
            });

            if (gameState.selection.length > 0) {
                return new Update("Rotate the cards if necessary, and then return them to their new homes.", false, false);
            }

            ifNoFlip(activateData, () => card.activationStep = "99");
        }
        return new Update("", true);
    }),
    map: new CardAction("Map", (gameState, activateData) => { //Rotate 1 or 2 of your equipment cards
        var card = activateData.card;
        resetAllStatuses(gameState);
        gameState.player.equipment.forEach(equipmentCard => {
            if (card.activationStep === "0" || card.activationStep === "1") {
                equipmentCard.flippable = true;
            }
        });

        if (card.activationStep === "0") {
            card.activationStep = "1";
            return new Update("Select an equipped card to rotate.", false, false);
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
    disguise: new CardAction("Mask", (gameState, activateData) => { //Draw a card. Discard a card.
        var card = activateData.card;
        resetAllStatuses(gameState);

        if (card.activationStep === "0") {
            card.activationStep = "1";

            gameState.player.plan.push(gameState.draw());
            if (gameState.phase === "finished") { return new Update("Game over!", true) }

            gameState.player.equipment.forEach(equipmentCard => {
                equipmentCard.discardable = true;
            });
            gameState.player.plan.forEach(planCard => {
                planCard.discardable = true;
            });
            return new Update("Select a card to discard.", false, false);
        }
        else if (card.activationStep === "1") {
            card.activationStep = "99";
        }
        return new Update("", true);
    }),
    gun: new CardAction("Gun", (gameState, activateData) => { //Look at the top two cards of the deck. Return or discard them
        var card = activateData.card;
        resetAllStatuses(gameState);

        if (card.activationStep === "0") {
            card.activationStep = "1";

            gameState.selection.push(gameState.draw());
            gameState.selection.push(gameState.draw());
            if (gameState.phase === "finished") { return new Update("Game over!", true) }

            gameState.selection.forEach(card => {
                card.returnable = true;
                card.discardable = true;
            });
            return new Update("Return or discard the selected cards.", false, false);
        }
        else if (card.activationStep === "1") {
            if (gameState.selection.length > 0) {
                gameState.selection.forEach(card => {
                    card.returnable = true;
                    card.discardable = true;
                });
                return new Update("Return or discard the selected cards.", false, false);
            }
            card.activationStep = "99";
        }
        return new Update("", true);
    }),
    armor: new CardAction("Armor", (gameState, activateData) => { //Your opponent may score their plan for 1 point. Activate one of their items facing them 2x.
        var card = activateData.card;
        var cardToActivate = gameState.opponent.equipment.find(x => x.metadata === "activate this!");
        resetAllStatuses(gameState);
        if (card.activationStep === "0") {
            card.activationStep = "1";


            gameState.opponent.fade(gameState.opponent.plan.pop());
            gameState.opponent.plan.push(gameState.draw());
            if (gameState.phase === "finished") { return new Update("Game over!", true) }

            gameState.opponent.equipment.forEach(equipmentCard => {
                equipmentCard.farsideActivatable = true;
            });
            return new Update("Select an opponent's equiptment to activate the far side of.", false, false);
        }
        else if (card.activationStep === "1") {
            if (!cardToActivate) {
                debugger;
                gameState.opponent.equipment.forEach(equipmentCard => {
                    equipmentCard.farsideActivatable = true;
                });
                new Update("Error, You didn't pick a card to activate!", true);
            }
            var cardCopy = {};
            Object.assign(cardCopy, cardToActivate);
            cardCopy.action = cardToActivate.action;
            gameState.activationStack.push({ card: cardCopy, option: ["farside", "opponents"], reason: "armor2x.1" });
            gameState.activationStack.push({ card: cardCopy, option: ["farside", "opponents"], reason: "armor2x.2" });
            card.activationStep = "99";
        }
        return new Update("", true);
    }),
    keys: new CardAction("Keys", (gameState, activateData) => { //Draw a card. Return an equipped card. Equip a card and activate it.
        var card = activateData.card;
        var cardToActivate = gameState.player.equipment.find(x => x.metadata === "activate this!");
        resetAllStatuses(gameState);
        if (card.activationStep === "0") {
            card.activationStep = "1";

            gameState.player.plan.push(gameState.draw());
            if (gameState.phase === "finished") { return new Update("Game over!", true) }

            gameState.player.equipment.forEach(equipmentCard => {
                equipmentCard.returnable = true;
            });
            return new Update("Return an equipped card.", false, false);
        }
        else if (card.activationStep === "1") {
            if (gameState.player.plan.length === 1) {
                card.activationStep = "2";
            }
            else {
                gameState.player.plan.forEach(planCard => {
                    planCard.equipable = true;
                    planCard.flippable = true;
                    planCard.metadata = "activate this!";
                });
                return new Update("Select a card to equip and activate", false, false);
            }
        }

        if (card.activationStep === "2") {
            if (!cardToActivate) {
                debugger;
                new Update("", true);
            }
            
            var cardCopy = {};
            Object.assign(cardCopy, cardToActivate);
            cardCopy.action = cardToActivate.action;

            gameState.activationStack.push({ card: cardCopy, option: [], reason: "keys" });
            ifNoFlip(activateData, () => card.activationStep = "99");
        }
        return new Update("", true);
    }),
    phone: new CardAction("Phone", (gameState, activateData) => { //Discard 2 cards. Draw 2 cards.
        var card = activateData.card;
        resetAllStatuses(gameState);

        var markDiscardable = function () {
            gameState.player.equipment.forEach(equipmentCard => {
                equipmentCard.discardable = true;
            });
            gameState.player.plan.forEach(planCard => {
                planCard.discardable = true;
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

            gameState.player.plan.push(gameState.draw());
            gameState.player.plan.push(gameState.draw());
            if (gameState.phase === "finished") { return new Update("Game over!", true) }
        }
        return new Update("", true);
    }),
    wallet: new CardAction("Wallet", (gameState, activateData) => {      //Rotate one of your opponent's equipment.   
        var card = activateData.card;
        resetAllStatuses(gameState);
        gameState.opponent.equipment.forEach(equipmentCard => {
            if (card.activationStep === "0" || card.activationStep === "1") {
                equipmentCard.flippable = true;
            }
        });

        if (card.activationStep === "0") {
            card.activationStep = "1";
            return new Update("Select an opponent's equipped card to rotate.", false, false);
        }
        else if (card.activationStep === "1") {
            card.activationStep = "99";
        }
        return new Update("", true);
    }),
    tickets: new CardAction("Tickets", (gameState, activateData) => { //Look at the top 4 cards of the deck. Return them in any order.
        var card = activateData.card;
        resetAllStatuses(gameState);

        if (card.activationStep === "0") {
            card.activationStep = "1";

            gameState.selection.push(gameState.draw());
            gameState.selection.push(gameState.draw());
            gameState.selection.push(gameState.draw());
            gameState.selection.push(gameState.draw());
            if (gameState.phase === "finished") { return new Update("Game over!", true) }

            gameState.selection.forEach(card => {
                card.returnable = true;
            });
            return new Update("Return the selected cards in any order.", false, false);
        }
        else if (card.activationStep === "1") {
            if (gameState.selection.length > 0) {
                gameState.selection.forEach(card => {
                    card.returnable = true;
                });
                return new Update("Return the selected cards in any order.", false, false);
            }
            card.activationStep = "99";
        }
        return new Update("", true);
    }),
};

var Cards = [
    new CardState('0.1', CardActions.poetry, CardActions.flowers),
    new CardState('0.2', CardActions.candy, CardActions.flowers),
    new CardState('0.3', CardActions.ring, CardActions.flowers),
    new CardState('0.4', CardActions.poetry, CardActions.candy),
    new CardState('0.5', CardActions.poetry, CardActions.ring),
    new CardState('0.6', CardActions.candy, CardActions.ring),
    new CardState('1.1', CardActions.disguise, CardActions.map),
    new CardState('1.2', CardActions.gun, CardActions.map),
    new CardState('1.3', CardActions.armor, CardActions.map),
    new CardState('1.4', CardActions.gun, CardActions.disguise),
    new CardState('1.5', CardActions.armor, CardActions.disguise),
    new CardState('1.6', CardActions.armor, CardActions.gun),
    new CardState('2.1', CardActions.keys, CardActions.phone),
    new CardState('2.2', CardActions.keys, CardActions.wallet),
    new CardState('2.3', CardActions.keys, CardActions.tickets),
    new CardState('2.4', CardActions.wallet, CardActions.phone),
    new CardState('2.5', CardActions.tickets, CardActions.phone),
    new CardState('2.6', CardActions.tickets, CardActions.wallet),
];

export default Cards;