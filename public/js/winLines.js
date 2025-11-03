const WinLines = {
    canvas: null, ctx: null, symbolWidth: 0, symbolHeight: 0,
    PAYLINE_COORDS: [
        [1,1,1,1,1], [0,0,0,0,0], [2,2,2,2,2], [0,1,1,1,2], [2,1,1,1,0],
        [1,0,1,0,1], [0,0,1,2,2], [2,2,1,0,0], [1,2,1,0,1], [0,1,2,1,0],
        [2,1,0,1,2], [1,0,2,0,1], [0,2,0,2,0], [2,0,2,0,2], [1,1,2,1,1],
        [0,0,2,0,0], [2,2,0,2,2], [1,2,0,2,1], [0,1,0,1,0], [2,1,2,1,2],
        [1,0,1,2,1], [0,2,1,0,2], [2,0,1,2,0], [1,1,0,1,1], [0,2,2,0,2]
    ],

    init: () => {
        WinLines.canvas = document.getElementById('win-line-canvas');
        WinLines.ctx = WinLines.canvas.getContext('2d');
        WinLines.resize();
        window.addEventListener('resize', WinLines.resize);
    },

    resize: () => {
        const grid = document.getElementById('reel-grid');
        WinLines.canvas.width = grid.clientWidth;
        WinLines.canvas.height = grid.clientHeight;
        WinLines.symbolWidth = WinLines.canvas.width / 5;
        WinLines.symbolHeight = WinLines.canvas.height / 3;
    },

    clearLines: () => {
        document.querySelectorAll('.symbol').forEach(sym => sym.classList.remove('winning'));
        WinLines.ctx.clearRect(0, 0, WinLines.canvas.width, WinLines.canvas.height);
    },

    drawLines: (wins) => {
        if (!wins?.length) return;
        WinLines.ctx.strokeStyle = 'rgba(255, 255, 0, 0.7)';
        WinLines.ctx.lineWidth = 5;
        wins.forEach(w => {
            const coords = WinLines.PAYLINE_COORDS[w.line];
            // 简化：加到所有符号的前3个（初始可见）
            for (let i = 0; i < w.count; i++) {
                const reelId = `reel${i}`;
                const symbols = Array.from(document.getElementById(reelId).querySelector('.symbol-strip').children);
                const visible = symbols.slice(0, 3); // 前3个作为可见
                const row = coords[i];
                if (visible[row]) visible[row].classList.add('winning');
            }

            WinLines.ctx.beginPath();
            for (let i = 0; i < w.count; i++) {
                const x = i * WinLines.symbolWidth + WinLines.symbolWidth / 2;
                const y = coords[i] * WinLines.symbolHeight + WinLines.symbolHeight / 2;
                i === 0 ? WinLines.ctx.moveTo(x, y) : WinLines.ctx.lineTo(x, y);
            }
            WinLines.ctx.stroke();
        });
    }
};
