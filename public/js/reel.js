const Reel = {
    symbolHeight: 0,
    ROLL_DISTANCE: 12, // 滚动循环次数（越大越长、越明显旋转）

    // 视觉卷轴 (11符号循环)
    REEL_STRIPS_VISUAL: [
        [100, 302, 101, 300, 102, 301, 103, 104, 105, 106, 107],
        [100, 101, 102, 300, 103, 104, 105, 106, 107, 301, 100],
        [100, 101, 102, 301, 103, 104, 105, 106, 107, 302, 300],
        [100, 300, 101, 102, 103, 104, 105, 106, 107, 302, 301],
        [100, 101, 102, 300, 103, 104, 105, 106, 107, 301, 302]
    ],

    SPIN_DURATION: 2500, // 2.5s滚动
    STAGGER_DELAY: 200,

    init: () => {
        const grid = document.getElementById('reel-grid');
        Reel.symbolHeight = grid.clientHeight / 3; 
        for (let i = 0; i < 5; i++) {
            const reel = document.getElementById(`reel${i}`);
            reel.innerHTML = '';
            const strip = document.createElement('div');
            strip.className = 'symbol-strip';
            const visual = Reel.REEL_STRIPS_VISUAL[i];
            // 重复循环：足够长以支持长滚动
            for (let k = 0; k < Reel.ROLL_DISTANCE * 2; k++) { // 双倍确保覆盖
                visual.forEach(id => {
                    const sym = document.createElement('div');
                    sym.className = 'symbol';
                    sym.dataset.symbolId = id; // 用于动态背景
                    sym.style.backgroundImage = `url(/assets/symbols/${id}.png)`; 
                    strip.appendChild(sym);
                });
            }
            reel.appendChild(strip);
        }
        // 初始设置背景（如果需要动态）
        document.querySelectorAll('.symbol').forEach(sym => {
            const id = sym.dataset.symbolId;
            sym.style.backgroundImage = `url(/assets/symbols/${id}.png)`;
        });
    },

    spinAnimation: (matrix) => {
        return new Promise(resolve => {
            let maxDuration = 0;
            for (let i = 0; i < 5; i++) {
                const reel = document.getElementById(`reel${i}`);
                const strip = reel.querySelector('.symbol-strip');
                const target = matrix[i]; // [top, mid, bottom]
                let targetIdx = -1;

                // 查找匹配3符号的位置（从strip children中）
                const symbols = Array.from(strip.children);
                for (let k = 0; k < symbols.length - 2; k++) {
                    if (
                        parseInt(symbols[k].dataset.symbolId) === target[0] &&
                        parseInt(symbols[k + 1].dataset.symbolId) === target[1] &&
                        parseInt(symbols[k + 2].dataset.symbolId) === target[2]
                    ) {
                        targetIdx = k;
                        break;
                    }
                }
                
                if (targetIdx === -1) {
                    console.error(`Reel ${i} 无法定位: ${target}`);
                    targetIdx = Math.floor(Math.random() * (symbols.length - 2)); // 随机降级
                }

                // 计算偏移：随机起始长距离 + 目标
                const symbolsPerCycle = Reel.REEL_STRIPS_VISUAL[i].length;
                const randomCycles = Math.floor(Math.random() * 3) + Reel.ROLL_DISTANCE; // 随机12-14循环，增强随机感
                const startOffset = 0; // 从0开始（column-reverse已反转）
                const finalOffset = -(targetIdx + randomCycles * symbolsPerCycle) * Reel.symbolHeight;

                // 设置CSS变量
                strip.style.setProperty('--final-offset', `${finalOffset}px`);

                // 添加滚动类：触发动画
                const delay = i * Reel.STAGGER_DELAY;
                const duration = Reel.SPIN_DURATION + delay;
                if (duration > maxDuration) maxDuration = duration;

                setTimeout(() => {
                    // 瞬移到起始（实际从0开始，无需瞬移）
                    strip.classList.add('spinning');
                    // 滚动中添加旋转类到所有符号
                    symbols.forEach(sym => sym.classList.add('spinning'));
                }, 50); // 微延迟重绘
            }
            
            setTimeout(() => { 
                AudioManager.play('stop');
                // 结束：移除旋转类，添加震动
                document.querySelectorAll('.symbol').forEach(sym => {
                    sym.classList.remove('spinning');
                });
                document.getElementById('reel-grid').classList.add('shake');
                setTimeout(() => {
                    document.getElementById('reel-grid').classList.remove('shake');
                }, 500);
                resolve(); 
            }, maxDuration);
        });
    }
};
