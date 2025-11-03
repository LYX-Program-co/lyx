document.addEventListener('DOMContentLoaded', () => {
    const btnSpin = document.getElementById('btn-spin');
    const btnUp = document.getElementById('btn-bet-up');
    const btnDown = document.getElementById('btn-bet-down');
    let spinning = false;

    // --- 新增：初始化粒子系统 ---
    Particles.init();
    // --- 新增结束 ---

    async function init() {
        const status = document.getElementById('loading-status');
        await Preloader.load((l, t) => status.textContent = `正在加载资源... (${Math.round(l/t*100)}%)`);
        
        AudioManager.init(); 
        
        const state = await API.getState();
        if (state) {
            GameState.setBalance(state.balance);
            GameState.setFreeSpins(state.freeSpinsRemaining);
        }
        
        document.getElementById('preloader').style.display = 'none';
        document.getElementById('game-container').style.display = 'flex';
        
        Reel.init(); 
        WinLines.init();
        
        // --- 新增：启动背景音乐 ---
        AudioManager.playLoop('main');
        // --- 新增结束 ---
    }

    btnSpin.addEventListener('click', async () => {
        if (spinning) return;
        spinning = true; lock(true); AudioManager.play('spin');
        
        // --- 新增：spin开始，满屏粒子喷射（金币爆炸） ---
        Particles.explode('gold', 100); // 100个金币粒子
        // --- 新增结束 ---

        WinLines.clearLines();
        const res = await API.postSpin(GameState.betPerLine, GameState.lines);
        if (!res) { spinning = false; lock(false); return; }
        GameState.updateFromServer(res); GameState.setWin(res.winAmount);
        await Reel.spinAnimation(res.matrix);
        WinLines.drawLines(res.wins);
        res.featuresTriggered?.forEach(f => {
            if (f.type === 'BigWin') { 
                AudioManager.play('win-big'); 
                show('effect-big-win', 7000);
                // --- 新增：BigWin超爆特效 ---
                Particles.explode('fireworks', 200); // 烟花满屏
                document.body.classList.add('shake'); // 屏幕震动
                setTimeout(() => document.body.classList.remove('shake'), 1000);
                // --- 新增结束 ---
            }
            if (f.type === 'FreeSpins') { 
                AudioManager.play('free-spin'); 
                show('effect-free-spins', 5000);
                // --- 新增：FreeSpins辉光粒子 ---
                Particles.explode('stars', 150); // 星星粒子
                // --- 新增结束 ---
            }
        });

        // --- 新增：spin结束，残留粒子淡出 ---
        setTimeout(() => Particles.clear(), 3000);
        // --- 新增结束 ---

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
