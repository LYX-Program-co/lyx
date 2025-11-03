const Reel = {
    reelElements: [], symbolHeight: 0,
    REEL_STRIPS_VISUAL: [
        [100, 302, 101, 300, 102, 301, 103, 100, 101, 102, 300, 103],
        [100, 101, 102, 300, 103, 101, 100, 301, 102, 103, 100, 101],
        [100, 101, 102, 301, 103, 100, 101, 302, 102, 300, 103, 100],
        [100, 300, 101, 102, 103, 302, 100, 301, 101, 102, 103, 300],
        [100, 101, 102, 300, 103, 301, 100, 101, 102, 302, 103, 100]
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
                    // --- 修正：使用绝对路径 /assets/ ---
                    sym.style.backgroundImage = `url(/assets/symbols/${id}.png)`;
                    // --- 修正结束 ---
                    strip.appendChild(sym);
                });
            }
            reel.appendChild(strip);
        }
    },

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
                    ) { targetIdx = k; break; }
                }
                if (targetIdx === -1) targetIdx = 60;
                const finalY = -targetIdx * Reel.symbolHeight;
                const startY = -Reel.symbolHeight * 12;
                strip.style.transition = 'none';
                strip.style.transform = `translateY(${startY}px)`;
                void strip.offsetWidth;
                const delay = i * Reel.STAGGER_DELAY;
                const duration = Reel.SPIN_DURATION + delay;
                strip.style.transition = `transform ${duration}ms cubic-bezier(0.25, 1, 0.5, 1)`;
                strip.style.transform = `translateY(${finalY}px)`;
                if (duration > maxDuration) maxDuration = duration;
            }
            setTimeout(() => { AudioManager.play('stop'); resolve(); }, maxDuration);
        });
    }
};
