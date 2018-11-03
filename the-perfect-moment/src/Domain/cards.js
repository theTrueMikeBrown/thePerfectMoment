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
    flowers: new CardAction("Flowers", (gameState, card) => {
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
            card.activationStep = "3";
            return new Update("", true);
        }
    }),
    poetry: new CardAction("Poetry", (gameState, card) => {
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
            card.activationStep = "3";
            return new Update("", true);
        }
    }),
    candy: new CardAction("Candy", () => { }),
    ring: new CardAction("Ring", () => { }),
    map: new CardAction("Map", () => { }),
    disguise: new CardAction("Disguise", () => { }),
    gun: new CardAction("Gun", () => { }),
    armor: new CardAction("Armor", () => { }),
    keys: new CardAction("Keys", () => { }),
    phone: new CardAction("Phone", () => { }),
    wallet: new CardAction("Wallet", () => { }),
    tickets: new CardAction("Tickets", () => { }),
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