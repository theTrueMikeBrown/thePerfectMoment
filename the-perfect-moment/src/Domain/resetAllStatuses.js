function resetAllStatuses(state) {
    state.player.plan.forEach(card => { card.resetStatus(); });
    state.player.equipment.forEach(card => { card.resetStatus(); });
    state.opponent.equipment.forEach(card => {
        card.resetStatus();
    });
    state.paradox.forEach(card => { card.resetStatus(); });
}

export default resetAllStatuses;