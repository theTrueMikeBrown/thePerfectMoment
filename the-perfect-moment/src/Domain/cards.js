import CardState from './cardState';
import CardAction from './cardAction';
import Update from './update';

var CardActions = {
    flowers: new CardAction("Flowers", (gameState, card) => {
        ///1 game gives control over to action
        ///2 action checks card status to see where it currently is
        ///3 action performs update on game to relenquish control
        ///4 game does stuff
        ///5 go to 1 if not done
        gameState.player.equipment.forEach(card => {
            card.resetStatus();
            if (card.activationStep === "0" || card.activationStep === "1") { card.swapable = true; }
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
            card.activationStep = "0";
            return new Update("", true);
        }
    }),
    poetry: new CardAction("Poetry", () => { }),
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