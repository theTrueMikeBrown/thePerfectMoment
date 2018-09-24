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
        debugger;
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
    new CardState('0.1', CardActions.flowers, CardActions.poetry),
    new CardState('0.2', CardActions.flowers, CardActions.candy),
    new CardState('0.3', CardActions.flowers, CardActions.ring),
    new CardState('0.4', CardActions.poetry, CardActions.candy),
    new CardState('0.5', CardActions.poetry, CardActions.ring),
    new CardState('0.6', CardActions.candy, CardActions.ring),
    new CardState('1.1', CardActions.map, CardActions.disguise),
    new CardState('1.2', CardActions.map, CardActions.gun),
    new CardState('1.3', CardActions.map, CardActions.armor),
    new CardState('1.4', CardActions.disguise, CardActions.gun),
    new CardState('1.5', CardActions.disguise, CardActions.armor),
    new CardState('1.6', CardActions.gun, CardActions.armor),
    new CardState('2.1', CardActions.keys, CardActions.phone),
    new CardState('2.2', CardActions.keys, CardActions.wallet),
    new CardState('2.3', CardActions.keys, CardActions.tickets),
    new CardState('2.4', CardActions.phone, CardActions.wallet),
    new CardState('2.5', CardActions.phone, CardActions.tickets),
    new CardState('2.6', CardActions.wallet, CardActions.tickets),
];

export default Cards;