/* 龍少核彈版 · 100% 完美 */
const ASSETS = { SYMBOLS: Array.from({length:10},(_,i)=>`images/10${i}.png`), BONUS:'images/300.png', FREE_SPIN:'images/301.png', WILD:'images/302.png', BIG_WIN_FX:'images/500.png', FREE_SPIN_FX:'images/501.png' };
const IMAGE_MAP = [...ASSETS.SYMBOLS, ASSETS.BONUS, ASSETS.FREE_SPIN, ASSETS.WILD];

const PAYTABLE = { 0:[0,0,0.5,1,2], 1:[0,0,0.5,1,2], 2:[0,0,0.6,1.2,3], 3:[0,0,0.6,1.2,3], 4:[0,0,0.8,1.5,4], 5:[0,0,1,2,5], 6:[0,0,1.2,2.5,6], 7:[0,0,1.5,3,7], 8:[0,0,2,5,10], 9:[0,0,5,10,20], 10:[0,0,0,0,0], 11:[0,0,2,5,10], 12:[0,0,0,0,9999] }; // WILD 核彈

const PAYLINES = [[1,1,1,1,1],[0,0,0,0,0],[2,2,2,2,2],[0,1,2,1,0],[2,1,0,1,2]];
const REEL_STRIPS = [[0,1,2,3,0,1,2,4,0,1,5,0,1,2,3,0,1,4,11,0,1,2,5,12,0,1,3],[0,1,2,0,1,2,0,1,2,0,1,2,3,4,0,1,2,0,1,2,3,0,1,2,4,0,1,2,5,0,11,0,1],[0,1,2,3,4,0,1,2,3,0,1,2,0,1,2,3,5,0,1,2,0,1,2,10,0,1,2],[0,1,2,0,1,2,0,1,2,3,4,0,1,2,0,1,2,3,0,1,2,4,0,1,2,5,0,11,0,1],[0,1,2,3,0,1,4,0,1,5,0,1,2,6,0,1,7,0,1,8,12,0,1,9,10,0,1]];

let state = { balance:999999999, betPerLine:0.05, lines:25, isSpinning:false, autoPlay:false, cheatMode:false };
let dom = {}, seed = Date.now();

window.onload = () => {
    Object.assign(dom, {
        loadingScreen: $('loading-screen'), gameContainer: $('game-container'), reelsContainer: $('reels-container'),
        reels: $all('.reel'), winLinesCanvas: $('win-lines-canvas'), ctx: $('win-lines-canvas').getContext('2d'),
        spinButton: $('spin-button'), autoSpinButton: $('auto-spin-button'),
        lineMinus: $('line-minus'), linePlus: $('line-plus'), betMinus: $('bet-minus'), betPlus: $('bet-plus'),
        balanceDisplay: $('balance-display'), winDisplay: $('win-display'), totalBetDisplay: $('total-bet-display'),
        lineDisplay: $('line-value'), betDisplay: $('bet-value'),
        effectOverlay: $('effect-overlay'), effectImage: $('effect-image'),
        audio: { main:$('audio-main'), winBig:$('audio-win-big'), reelStop:$('audio-reel-stop') }
    });

    // 初始化
    initReels(); resizeCanvas(); updateUI();
    window.addEventListener('resize', resizeCanvas);

    // 事件
    dom.spinButton.onclick = spin;
    dom.autoSpinButton.onclick = () => { state.autoPlay = !state.autoPlay; if(state.autoPlay) spin(); };
    dom.lineMinus.onclick = () => { state.lines = Math.max(1, state.lines-1); updateUI(); };
    dom.linePlus.onclick  = () => { state.lines = Math.min(40, state.lines+1); updateUI(); };
    dom.betMinus.onclick  = () => { state.betPerLine = Math.max(0.01, (state.betPerLine/2).toFixed(2)); updateUI(); };
    dom.betPlus.onclick   = () => { state.betPerLine = Math.min(100, (state.betPerLine*2).toFixed(2)); updateUI(); };

    // 龍少密語：敲三下開作弊
    let taps = 0; document.addEventListener('click', () => { if(++taps===3){ state.cheatMode=!state.cheatMode; alert(state.cheatMode?'龍少作弊已開':'作弊已關'); taps=0; }});

    // 加载完成
    setTimeout(() => { dom.loadingScreen.classList.add('hidden'); dom.gameContainer.classList.remove('hidden'); dom.audio.main.play().catch(()=>{}); }, 1500);
};

function $(id){return document.getElementById(id);}
function $all(s){return document.querySelectorAll(s);}
function rng(){ seed = (seed * 1664525 + 1013904223) % 2**32; return seed / 2**32; }

function initReels(){
    dom.reels.forEach(reel => {
        reel.innerHTML = '';
        for(let i=0;i<3;i++){
            const img = document.createElement('img');
            img.src = ASSETS.SYMBOLS[Math.floor(rng()*10)];
            img.className = 'symbol';
            reel.appendChild(img);
        }
    });
}

function resizeCanvas(){
    const rect = dom.reelsContainer.getBoundingClientRect();
    dom.winLinesCanvas.width = rect.width;
    dom.winLinesCanvas.height = rect.height;
}

async function spin(){
    if(state.isSpinning) return;
    state.isSpinning = true; updateUI();
    const totalBet = state.lines * state.betPerLine;
    if(state.balance < totalBet){ alert('餘額不足，龍少已自動充值 999999'); state.balance += 999999; updateUI(); }

    state.balance -= totalBet;
    const result = state.cheatMode ? cheatSpin() : calculateResult();
    await animateReels(result.grid);
    showResult(result);
    state.isSpinning = false;
    if(state.autoPlay) setTimeout(spin, 300);
}

function cheatSpin(){
    // 龍少專屬：永遠 5 野 + 3 SCATTER
    const grid = [[12,12,12,12,12],[11,11,11,0,0],[0,0,0,0,0]];
    return { grid, totalWin: 999999, winningLines:[{lineIndex:0,count:5}], isFreeSpinTrigger:true, isBigWin:true };
}

function calculateResult(){
    const grid = [[],[],[]];
    let scatterCount = 0;
    for(let col=0; col<5; col++){
        const strip = REEL_STRIPS[col];
        const stop = Math.floor(rng() * strip.length);
        for(let row=0; row<3; row++){
            const symbol = strip[(stop + row) % strip.length];
            grid[row][col] = symbol;
            if(symbol === 11) scatterCount++;
        }
    }

    let totalWin = 0;
    const winningLines = [];
    for(let i=0; i<state.lines && i<PAYLINES.length; i++){
        const line = PAYLINES[i];
        let symbol = grid[line[0]][0];
        if(symbol === 12) symbol = grid[line[0]][1]; // WILD 通吃
        let count = 1;
        for(let c=1; c<5; c++){
            const s = grid[line[c]][c];
            if(s !== symbol && s !== 12) break;
            count++;
        }
        if(count >= 3 && PAYTABLE[symbol][count]){
            const win = PAYTABLE[symbol][count] * state.betPerLine;
            totalWin += win;
            winningLines.push({lineIndex:i, count});
        }
    }
    if(scatterCount >= 3) totalWin += [0,0,2,5,10][scatterCount] * state.betPerLine;

    return { grid, totalWin, winningLines, isFreeSpinTrigger:scatterCount>=3, isBigWin:totalWin >= totalBet*20 };
}

async function animateReels(finalGrid){
    const symbolH = dom.reels[0].clientHeight / 3;
    await Promise.all(Array.from(dom.reels).map((reel, col) => new Promise(res => {
        reel.classList.add('spinning');
        let offset = 0;
        const int = setInterval(() => {
            offset += 40 + col*8;
            reel.scrollTop = offset % (symbolH*3);
        }, 16);
        setTimeout(() => {
            clearInterval(int);
            reel.classList.remove('spinning');
            reel.innerHTML = '';
            [0,1,2].forEach(r => {
                const img = document.createElement('img');
                img.src = IMAGE_MAP[finalGrid[r][col]];
                img.className = 'symbol';
                reel.appendChild(img);
            });
            play(dom.audio.reelStop);
            res();
        }, 1800 + col*300);
    })));
}

function showResult(r){
    if(r.totalWin>0){
        state.balance += r.totalWin;
        dom.winDisplay.textContent = r.totalWin.toFixed(2);
        if(r.isBigWin) showEffect('BIG_WIN');
        else play(dom.audio.winBig);
        drawWinLines(r.winningLines);
    }
    if(r.isFreeSpinTrigger) showEffect('FREE_SPIN');
    updateUI();
}

function showEffect(type){
    dom.effectImage.src = type==='BIG_WIN' ? ASSETS.BIG_WIN_FX : ASSETS.FREE_SPIN_FX;
    dom.effectOverlay.classList.remove('hidden');
    setTimeout(() => dom.effectOverlay.classList.add('hidden'), 7000);
}

function drawWinLines(lines){
    const ctx = dom.ctx; ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);
    ctx.strokeStyle = 'gold'; ctx.lineWidth = 6; ctx.shadowBlur = 15; ctx.shadowColor = 'white';
    const w = ctx.canvas.width/5, h = ctx.canvas.height/3;
    lines.forEach(l => {
        ctx.beginPath();
        PAYLINES[l.lineIndex].forEach((row, c) => {
            const x = c*w + w/2, y = row*h + h/2;
            c===0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y);
        });
        ctx.stroke();
    });
}

function updateUI(){
    dom.balanceDisplay.textContent = state.balance.toFixed(2);
    dom.totalBetDisplay.textContent = (state.lines * state.betPerLine).toFixed(2);
    dom.lineDisplay.textContent = state.lines;
    dom.betDisplay.textContent = state.betPerLine.toFixed(2);
}

function play(audio){ if(window.audioUnlocked) audio.currentTime=0, audio.play().catch(()=>{}); }
