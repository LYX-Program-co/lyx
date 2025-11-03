const Reel = {
    reelElements: [], symbolHeight: 0,

    // 11 符号视觉卷轴 (保持不变)
    REEL_STRIPS_VISUAL: [
        [100, 302, 101, 300, 102, 301, 103, 104, 105, 106, 107, 100],
        [100, 101, 102, 300, 103, 104, 105, 106, 107, 301, 100, 101],
        [100, 101, 102, 301, 103, 104, 105, 106, 107, 302, 300, 100],
        [100, 300, 101, 102, 103, 104, 105, 106, 107, 302, 301, 100],
        [100, 101, 102, 300, 103, 104, 105, 106, 107, 301, 302, 100]
    ],

    SPIN_DURATION: 2000, STAGGER_DELAY: 200,

    init: () => {
        const grid = document.getElementById('reel-grid');
        Reel.symbolHeight = grid.clientHeight / 3; 
        for (let i = 0; i < 5; i++) {
            const reel = document.getElementById(`reel${i}`);
            reel.innerHTML = '';
            const strip = document.createElement('div');
            strip.className = 'symbol-strip';
            const visual = Reel.REEL_STRIPS_VISUAL[i];
            for (let k = 0; k < 5; k++) {
                visual.forEach(id => {
                    const sym = document.createElement('div');
                    sym.className = 'symbol';
                    sym.style.height = `${Reel.symbolHeight}px`;
                    sym.style.backgroundImage = `url(/assets/symbols/${id}.png)`; 
                    strip.appendChild(sym);
                });
            }
            reel.appendChild(strip);
        }
    },

    // --- 冰妹: 重构 spinAnimation 以修复动画时序 (逻辑死锁) ---
    spinAnimation: (matrix) => {
        return new Promise(resolve => {
            let maxDuration = 0;
            for (let i = 0; i < 5; i++) {
                const reel = document.getElementById(`reel${i}`);
                const strip = reel.querySelector('.symbol-strip');
                const target = matrix[i]; 
                let targetIdx = -1;

                for (let k = 0; k < strip.children.length - 2; k++) {
                    if (
                        strip.children[k].style.backgroundImage.includes(`${target[0]}.png`) &&
                        strip.children[k+1].style.backgroundImage.includes(`${target[1]}.png`) &&
                        strip.children[k+2].style.backgroundImage.includes(`${target[2]}.png`)
                    ) { 
                        targetIdx = k; 
                        break; 
                    }
                }
                
                if (targetIdx === -1) {
                    console.error(`无法在卷轴 ${i} 上定位矩阵 ${target}。`);
                    targetIdx = 48; // 降级处理
                }

                const finalY = -targetIdx * Reel.symbolHeight;
                const startY = -Reel.symbolHeight * 12; 

                // 1. 设置瞬移到起始位置 (无动画)
                strip.style.transition = 'none';
                strip.style.transform = `translateY(${startY}px)`;
                
                const delay = i * Reel.STAGGER_DELAY;
                const duration = Reel.SPIN_DURATION + delay;
                if (duration > maxDuration) maxDuration = duration;

                // 2. 强制浏览器在“下一帧”才应用动画
                // 这是解决“瞬移”问题的 100% 可靠方法
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => { 
                        strip.style.transition = `transform ${duration}ms cubic-bezier(0.25, 1, 0.5, 1)`;
                        strip.style.transform = `translateY(${finalY}px)`;
                    });
                });
            }
            
            setTimeout(() => { AudioManager.play('stop'); resolve(); }, maxDuration);
        });
    }
    // --- 重构结束 ---
};
