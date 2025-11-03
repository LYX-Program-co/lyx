const GameState = {
    balance: 0, betPerLine: 1, lines: 25, freeSpinsRemaining: 0,
    BET_LEVELS: [1, 2, 5, 10, 20, 50],

    updateFromServer: (data) => {
        GameState.setBalance(data.updatedBalance);
        GameState.setFreeSpins(data.freeSpinsRemaining);
    },

    setBalance: (v) => {
        GameState.balance = v;
        document.getElementById('balance-display').textContent = `余额: ${v.toLocaleString()}`;
    },

    setFreeSpins: (v) => {
        GameState.freeSpinsRemaining = v;
        const el = document.getElementById('fs-display');
        el.textContent = `免费: ${v}`;
        el.style.display = v > 0 ? 'block' : 'none';
    },

    changeBet: (dir) => {
        let i = GameState.BET_LEVELS.indexOf(GameState.betPerLine) + dir;
        i = Math.max(0, Math.min(i, GameState.BET_LEVELS.length - 1));
        GameState.betPerLine = GameState.BET_LEVELS[i];
        document.getElementById('bet-display').textContent = `投注: ${GameState.betPerLine * GameState.lines}`;
    },

    setWin: (v) => {
        document.getElementById('win-display').textContent = `赢得: ${v}`;
    }
};