/* * LYX Slot PWA Logic - (c) Ultra Grok Pro for 龍少
 * 架构: PWA (HTML/JS), 强制横屏
 */

// --- 0. 游戏状态和配置 ---

const ASSETS = {
    SYMBOLS: [
        'images/100.png', 'images/101.png', 'images/102.png', 'images/103.png',
        'images/104.png', 'images/105.png', 'images/106.png', 'images/107.png',
        'images/108.png', 'images/109.png'
    ],
    BONUS: 'images/300.png',
    FREE_SPIN: 'images/301.png',
    WILD: 'images/302.png',
    BIG_WIN_FX: 'images/500.png',
    FREE_SPIN_FX: 'images/501.png'
};

const IMAGE_MAP = [...ASSETS.SYMBOLS, ASSETS.BONUS, ASSETS.FREE_SPIN, ASSETS.WILD];

const PAYTABLE = {
    0: [0, 0, 0.5, 1, 2],
    1: [0, 0, 0.5, 1, 2],
    2: [0, 0, 0.6, 1.2, 3],
    3: [0, 0, 0.6, 1.2, 3],
    4: [0, 0, 0.8, 1.5, 4],
    5: [0, 0, 1.0, 2, 5],
    6: [0, 0, 1.2, 2.5, 6],
    7: [0, 0, 1.5, 3, 7],
    8: [0, 0, 2, 5, 10],
    9: [0, 0, 5, 10, 20],
    10: [0, 0, 0, 0, 0],
    11: [0, 0, 2, 5, 10],
    12: [0, 0, 0, 0, 0]
};

const PAYLINES = [
    [1, 1, 1, 1, 1],
    [0, 0, 0, 0, 0],
    [2, 2, 2, 2, 2],
    [0, 1, 2, 1, 0],
    [2, 1, 0, 1, 2]
];
const MAX_LINES = 40;

const REEL_STRIPS = [
    [0, 1, 2, 3, 0, 1, 2, 4, 0, 1, 5, 0, 1, 2, 3, 0, 1, 4, 11, 0, 1, 2, 5, 12, 0, 1, 3],
    [0, 1, 2, 0, 1, 2, 0, 1, 2, 0, 1, 2, 3, 4, 0, 1, 2, 0, 1, 2, 3, 0, 1, 2, 4, 0, 1, 2, 5, 0, 11, 0, 1],
    [0, 1, 2, 3, 4, 0, 1, 2, 3, 0, 1, 2, 0, 1, 2, 3, 5, 0, 1, 2, 0, 1, 2, 10, 0, 1, 2],
    [0, 1, 2, 0, 1, 2, 0, 1, 2, 3, 4, 0, 1, 2, 0, 1, 2, 3, 0, 1, 2, 4, 0, 1, 2, 5, 0, 11, 0, 1],
    [0, 1, 2, 3, 0, 1, 4, 0, 1, 5, 0, 1, 2, 6, 0, 1, 7, 0, 1, 8, 12, 0, 1, 9, 10, 0, 1]
];

// --- 状态 ---
let state = {
    balance: 1000.00,
    betPerLine: 0.05,
    lines: 25,
    isSpinning: false,
    autoPlay: false
};
const BET_STEPS = [0.01, 0.02, 0.05, 0.10, 0.20, 0.50, 1.00];
let currentBetStep = 2;
let dom = {};

// --- 初始化 ---
window.onload = () => {
    dom.loadingScreen = document.getElementById('loading-screen');
    dom.gameContainer = document.getElementById('game-container');
    dom.reelsContainer = document.getElementById('reels-container');
    dom.reels = document.querySelectorAll('.reel');
    dom.winLinesCanvas = document.getElementById('win-lines-canvas');
    dom.ctx = dom.winLinesCanvas.getContext('2d');

    dom.spinButton = document.getElementById('spin-button');
    dom.autoSpinButton = document.getElementById('auto-spin-button');
    dom.lineMinus = document.getElementById('line-minus');
    dom.linePlus = document.getElementById('line-plus');
    dom.betMinus = document.getElementById('bet-minus');
    dom.betPlus = document.getElementById('bet-plus');

    dom.balanceDisplay = document.getElementById('balance-display');
    dom.winDisplay = document.getElementById('win-display');
    dom.totalBetDisplay = document.getElementById('total-bet-display');
    dom.lineDisplay = document.getElementById('line-value');
    dom.betDisplay = document.getElementById('bet-value');

    dom.effectOverlay = document.getElementById('effect-overlay');
    dom.effectImage = document.getElementById('effect-image');

    dom.audio = {
        main: document.getElementById('audio-main'),
        freeSpin: document.getElementById('audio-free-spin'),
        spin: document.getElementById('audio-spin'),
        stop: document.getElementById('audio-stop'),
        winBig: document.getElementById('audio-win-big'),
        winSmall: document.getElementById('audio-win-small'),
        reelStop: document.getElementById('audio-reel-stop')
    };

    setupEventListeners();
    initReels();
    updateUI();

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    setTimeout(() => {
        dom.loadingScreen.classList.add('hidden');
        dom.gameContainer.classList.remove('hidden');
    }, 1000);
};

function setupEventListeners() {
    dom.spinButton.onclick = doSpin;
    dom.betPlus.onclick = () => changeBet(true);
    dom.betMinus.onclick = () => changeBet(false);
    dom.linePlus.onclick = () => changeLines(true);
    dom.lineMinus.onclick = () => changeLines(false);
    document.body.addEventListener('click', () => {
        dom.audio.main.play().catch(e => {});
    }, { once: true });
}

function resizeCanvas() {
    const rect = dom.reelsContainer.getBoundingClientRect();
    dom.winLinesCanvas.width = rect.width;
    dom.winLinesCanvas.height = rect.height;
}

function initReels() {
    dom.reels.forEach(reel => {
        reel.innerHTML = '';
        for (let i = 0; i < 3; i++) {
            const img = document.createElement('img');
            img.src = ASSETS.SYMBOLS[Math.floor(Math.random() * ASSETS.SYMBOLS.length)];
            img.className = 'symbol';
            reel.appendChild(img);
        }
    });
}

function playSound(sound) {
    sound.currentTime = 0;
    sound.play().catch(e => {});
}

function showEffect(type) {
    let imgSrc, audio;
    if (type === 'BIG_WIN') {
        imgSrc = ASSETS.BIG_WIN_FX;
        audio = dom.audio.winBig;
    } else if (type === 'FREE_SPIN') {
        imgSrc = ASSETS.FREE_SPIN_FX;
        audio = dom.audio.winBig;
    } else {
        return;
    }
    dom.effectImage.src = imgSrc;
    dom.effectOverlay.classList.remove('hidden');
    playSound(audio);
    if (navigator.vibrate) navigator.vibrate([500, 200, 500]);
    setTimeout(() => dom.effectOverlay.classList.add('hidden'), 7000);
}

function changeBet(isIncrease) {
    playSound(dom.audio.stop);
    if (isIncrease) currentBetStep = Math.min(currentBetStep + 1, BET_STEPS.length - 1);
    else currentBetStep = Math.max(currentBetStep - 1, 0);
    state.betPerLine = BET_STEPS[currentBetStep];
    updateUI();
}

function changeLines(isIncrease) {
    playSound(dom.audio.stop);
    if (isIncrease) state.lines = Math.min(state.lines + 1, MAX_LINES);
    else state.lines = Math.max(state.lines - 1, 1);
    updateUI();
}

function updateUI() {
    const totalBet = state.betPerLine * state.lines;
    dom.balanceDisplay.textContent = state.balance.toFixed(2);
    dom.betDisplay.textContent = state.betPerLine.toFixed(2);
    dom.lineDisplay.textContent = state.lines;
    dom.totalBetDisplay.textContent = totalBet.toFixed(2);
}

// --- 核心 ---
async function doSpin() {
    if (state.isSpinning) return;
    const totalBet = state.betPerLine * state.lines;
    if (state.balance < totalBet) {
        console.warn("余额不足");
        return;
    }

    state.isSpinning = true;
    dom.spinButton.disabled = true;
    state.balance -= totalBet;
    updateUI();
    dom.winDisplay.textContent = "0.00";
    clearWinLines();
    playSound(dom.audio.spin);

    const result = calculateResult();
    await animateReels(result.grid);
    showResult(result);

    state.isSpinning = false;
    dom.spinButton.disabled = false;
}

function calculateResult() {
    const grid = [[], [], []];
    for (let c = 0; c < 5; c++) {
        const strip = REEL_STRIPS[c];
        const stopIndex = Math.floor(Math.random() * strip.length);
        grid[1][c] = strip[stopIndex];
        grid[0][c] = strip[(stopIndex - 1 + strip.length) % strip.length];
        grid[2][c] = strip[(stopIndex + 1) % strip.length];
    }
    return evaluateWins(grid);
}

function evaluateWins(grid) {
    let totalWin = 0;
    let winningLines = [];
    let scatterCount = 0;

    for (let r = 0; r < 3; r++) for (let c = 0; c < 5; c++) if (grid[r][c] === 11) scatterCount++;
    if (scatterCount >= 3)
        totalWin += PAYTABLE[11][scatterCount] * (state.betPerLine * state.lines);

    for (let i = 0; i < state.lines; i++) {
        const line = PAYLINES[i];
        let lineSymbol = grid[line[0]][0];
        if (lineSymbol === 12) {
            for (let c = 1; c < 5; c++) if (grid[line[c]][c] !== 12) { lineSymbol = grid[line[c]][c]; break; }
        }

        let matchCount = 0;
        for (let c = 0; c < 5; c++) {
            const symbol = grid[line[c]][c];
            if (symbol === lineSymbol || symbol === 12) matchCount++; else break;
        }

        if (matchCount >= 3) {
            const winAmount = PAYTABLE[lineSymbol][matchCount] * state.betPerLine;
            if (winAmount > 0) {
                totalWin += winAmount;
                winningLines.push({ lineIndex: i, count: matchCount });
            }
        }
    }

    const isFreeSpinTrigger = scatterCount >= 3;
    const isBigWin = totalWin >= state.betPerLine * state.lines * 20;
    return { grid, totalWin, winningLines, isFreeSpinTrigger, isBigWin };
}

// ✅ 修正版动画
async function animateReels(finalGrid) {
    const reelElements = dom.reels;
    const spinDuration = 1800;
    const symbolHeight = reelElements[0].clientHeight / 3;

    const animations = Array.from(reelElements).map((reel, colIndex) => {
        return new Promise(resolve => {
            reel.classList.add('spinning');

            if (reel.children.length === 0) {
                for (let i = 0; i < 3; i++) {
                    const img = document.createElement('img');
                    img.src = ASSETS.SYMBOLS[Math.floor(Math.random() * ASSETS.SYMBOLS.length)];
                    img.className = 'symbol';
                    reel.appendChild(img);
                }
            }

            let offset = 0;
            const scrollSpeed = 30 + colIndex * 5;
            const interval = setInterval(() => {
                offset += scrollSpeed;
                reel.scrollTop = offset % (symbolHeight * 3);
            }, 16);

            setTimeout(() => {
                clearInterval(interval);
                reel.classList.remove('spinning');
                reel.innerHTML = '';
                [finalGrid[0][colIndex], finalGrid[1][colIndex], finalGrid[2][colIndex]].forEach(symbolId => {
                    const img = document.createElement('img');
                    img.src = IMAGE_MAP[symbolId];
                    img.className = 'symbol';
                    reel.appendChild(img);
                });
                playSound(dom.audio.reelStop);
                resolve();
            }, spinDuration + colIndex * 300);
        });
    });

    await Promise.all(animations);
}

function showResult(result) {
    if (result.totalWin > 0) {
        state.balance += result.totalWin;
        dom.winDisplay.textContent = result.totalWin.toFixed(2);
        if (result.isBigWin) showEffect('BIG_WIN');
        else playSound(dom.audio.winSmall);
        drawWinLines(result.winningLines);
    }
    if (result.isFreeSpinTrigger) showEffect('FREE_SPIN');
    updateUI();
}

function drawWinLines(lines) {
    const ctx = dom.ctx;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.strokeStyle = 'rgba(255, 215, 0, 0.8)';
    ctx.lineWidth = 5;
    ctx.shadowColor = 'white';
    ctx.shadowBlur = 10;

    const colWidth = ctx.canvas.width / 5;
    const rowHeight = ctx.canvas.height / 3;

    lines.forEach(lineInfo => {
        const line = PAYLINES[lineInfo.lineIndex];
        ctx.beginPath();
        for (let c = 0; c < lineInfo.count; c++) {
            const x = (c * colWidth) + (colWidth / 2);
            const y = (line[c] * rowHeight) + (rowHeight / 2);
            if (c === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
    });
}

function clearWinLines() {
    const ctx = dom.ctx;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}
