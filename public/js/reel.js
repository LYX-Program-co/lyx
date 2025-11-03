const Reel = {
    ROLL_DISTANCE: 8, // 简化循环，够长

    REEL_STRIPS_VISUAL: [
        [100, 302, 101, 300, 102, 301, 103, 104, 105, 106, 107],
        [100, 101, 102, 300, 103, 104, 105, 106, 107, 301, 100],
        [100, 101, 102, 301, 103, 104, 105, 106, 107, 302, 300],
        [100, 300, 101, 102, 103, 104, 105, 106, 107, 302, 301],
        [100, 101, 102, 300, 103, 104, 105, 106, 107, 301, 302]
    ],

    SPIN_DURATION: 2000, // 2s
    STAGGER_DELAY: 150, // 错开快点

    init: () => {
        const grid = document.getElementById('reel-grid');
        const symbolHeightPct = 100 / 3; // 33.333%
        for (let i = 0; i < 5; i++) {
            const reel = document.getElementById(`reel${i}`);
            reel.innerHTML = '';
            const strip = document.createElement('div');
            strip.className = 'symbol-strip';
            const visual = Reel.REEL_STRIPS_VISUAL[i];
            // 循环生成符号
            for (let k = 0; k < Reel.ROLL_DISTANCE * 2; k++) {
                visual.forEach(id => {
                    const sym = document.createElement('div');
                    sym.className = 'symbol';
                    sym.dataset.symbolId = id;
                    // 修复：颜色fallback（基于ID）
                    const colors = {100: '#ff0000', 101: '#00ff00', 102: '#0000ff', 103: '#ffff00', 104: '#ff00ff', 105: '#00ffff', 106: '#ffa500', 107: '#800080', 300: '#gold', 301: '#purple', 302: '#orange'};
                    sym.style.backgroundColor = colors[id] || '#gray';
                    sym.textContent = id; // 数字显示
                    sym.style.backgroundImage = `url(/assets/symbols/${id}.png)`; // 图片叠加
                    strip.appendChild(sym);
                });
            }
            reel.appendChild(strip);
            // 初始：偏移33.33%（1个高度），显示中3个
            strip.style.transform = `translateY(-${symbolHeightPct}%)`;
            console.log(`Reel ${i} init: 初始显示中3符号`);
        }
    },

    spinAnimation: (matrix) => {
        return new Promise(resolve => {
            let maxDuration = 0;
            for (let i = 0; i < 5; i++) {
                const reel = document.getElementById(`reel${i}`);
                const strip = reel.querySelector('.symbol-strip');
                const target = matrix[i]; // [0:上,1:中,2:下]
                let targetIdx = -1;

                const symbols = Array.from(strip.children);
                for (let k = 0; k < symbols.length - 2; k++) {
                    if (
                        parseInt(symbols[k].dataset.symbolId) === target[0] &&
                        parseInt(symbols[k+1].dataset.symbolId) === target[1] &&
                        parseInt(symbols[k+2].dataset.symbolId) === target[2]
                    ) {
                        targetIdx = k;
                        break;
                    }
                }
                
                if (targetIdx === -1) {
                    console.error(`Reel ${i} 未找到: ${target}`);
                    targetIdx = 3; // 默认中位
                }

                // 简化偏移：百分比，起始长滚（-800% = 24符号），目标- (targetIdx + 循环) %
                const symbolsPerCycle = Reel.REEL_STRIPS_VISUAL[i].length;
                const randomCycles = Math.floor(Math.random() * 2) + Reel.ROLL_DISTANCE; // 8-9循环
                const startOffset = -(randomCycles * symbolsPerCycle * 100 / 3) + '%'; // 粗算，长负
                const finalOffset = -((targetIdx + 1) * 100 / 3 + '%'); // +1 居中上中下

                console.log(`Reel ${i} spin: start=${startOffset}, final=${finalOffset}, targetIdx=${targetIdx}`);

                strip.style.setProperty('--start-offset', startOffset);
                strip.style.setProperty('--final-offset', finalOffset);

                const delay = i * Reel.STAGGER_DELAY;
                const duration = Reel.SPIN_DURATION + delay;
                if (duration > maxDuration) maxDuration = duration;

                setTimeout(() => {
                    strip.classList.add('spinning');
                    symbols.forEach(sym => sym.classList.add('spinning'));
                }, 50);
            }
            
            setTimeout(() => { 
                AudioManager.play('stop');
                document.querySelectorAll('.symbol').forEach(sym => sym.classList.remove('spinning'));
                document.getElementById('reel-grid').classList.add('shake');
                setTimeout(() => document.getElementById('reel-grid').classList.remove('shake'), 500);
                console.log('Spin结束：符号应停在中3行');
                resolve(); 
            }, maxDuration);
        });
    }
}
