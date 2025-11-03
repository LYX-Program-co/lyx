document.addEventListener('DOMContentLoaded', () => {
    const btnSpin = document.getElementById('btn-spin');
    const btnUp = document.getElementById('btn-bet-up');
    const btnDown = document.getElementById('btn-bet-down');
    let spinning = false;

    async function init() {
        const status = document.getElementById('loading-status');
        await Preloader.load((l, t) => status.textContent = `正在加载资源... (${Math.round(l/t*100)}%)`);
        
        // --- 修正 ---
        // 仅初始化音频管理器
        AudioManager.init(); 
        
        const state = await API.getState();
        if (state) {
            GameState.setBalance(state.balance);
            GameState.setFreeSpins(state.freeSpinsRemaining);
        }
        
        // 先显示容器
        document.getElementById('preloader').style.display = 'none';
        document.getElementById('game-container').style.display = 'flex';
        
        // --- 修正 ---
        // 在容器显示后，再初始化卷轴和线条，以确保 clientHeight 不为 0
        Reel.init(); 
        WinLines.init();
        // --- 修正结束 ---
    }

    btnSpin.addEventListener('click', async () => {
        if (spinning) return;
        spinning = true; lock(true); AudioManager.play('spin');
        WinLines.clearLines();
        const res = await API.postSpin(GameState.betPerLine, GameState.lines);
        if (!res) { spinning = false; lock(false); return; }
        GameState.updateFromServer(res); GameState.setWin(res.winAmount);
        await Reel.spinAnimation(res.matrix);
        WinLines.drawLines(res.wins);
        res.featuresTriggered?.forEach(f => {
            if (f.type === 'BigWin') { AudioManager.play('win-big'); show('effect-big-win', 7000); }
            if (f.type === 'FreeSpins') { AudioManager.play('free-spin'); show('effect-free-spins', 5000); }
        });
        spinning = false; lock(false);
    });

    btnUp.onclick = () => { if (!spinning) { GameState.changeBet(1); AudioManager.play('ui-click'); }};
    btnDown.onclick = () => { if (!spinning) { GameState.changeBet(-1); AudioManager.play('ui-click'); }};

    function lock(l) {
        btnSpin.disabled = l; btnUp.disabled = l; btnDown.disabled = l;
        btnSpin.textContent = l ? "SPINNING..." : (GameState.freeSpinsRemaining > 0 ? "FREE SPIN" : "SPIN");
    }
    function show(id, ms) {
        const el = document.getElementById(id);
        el.style.display = 'block';
        setTimeout(() => el.style.display = 'none', ms);
    }

    init();
});
