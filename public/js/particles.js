const Particles = {
    canvas: null,
    ctx: null,
    particles: [],

    init: () => {
        Particles.canvas = document.createElement('canvas');
        Particles.canvas.id = 'particles-canvas';
        document.body.appendChild(Particles.canvas);
        Particles.ctx = Particles.canvas.getContext('2d');
        Particles.resize();
        window.addEventListener('resize', () => Particles.resize());
    },

    resize: () => {
        Particles.canvas.width = window.innerWidth;
        Particles.canvas.height = window.innerHeight;
    },

    // 爆炸粒子：类型(gold/fireworks/stars)，数量
    explode: (type, count) => {
        for (let i = 0; i < count; i++) {
            Particles.particles.push({
                x: Math.random() * Particles.canvas.width,
                y: Math.random() * Particles.canvas.height,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                life: 1,
                decay: Math.random() * 0.02 + 0.01,
                size: Math.random() * 5 + 2,
                color: type === 'gold' ? '#ffd700' : type === 'fireworks' ? `hsl(${Math.random()*360}, 100%, 50%)` : '#00ffff',
                type: type
            });
        }
    },

    clear: () => {
        Particles.particles = [];
        Particles.ctx.clearRect(0, 0, Particles.canvas.width, Particles.canvas.height);
    },

    update: () => {
        Particles.ctx.clearRect(0, 0, Particles.canvas.width, Particles.canvas.height);
        Particles.particles.forEach((p, i) => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.1; // 重力
            p.life -= p.decay;
            p.size *= 0.99;

            if (p.life <= 0 || p.size < 0.1) {
                Particles.particles.splice(i, 1);
                return;
            }

            // 绘制粒子：圆形 + 辉光
            Particles.ctx.save();
            Particles.ctx.globalAlpha = p.life;
            Particles.ctx.fillStyle = p.color;
            Particles.ctx.shadowBlur = 20;
            Particles.ctx.shadowColor = p.color;
            Particles.ctx.beginPath();
            Particles.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            Particles.ctx.fill();
            Particles.ctx.restore();
        });
        requestAnimationFrame(Particles.update);
    }
};

// 启动粒子循环
Particles.update();
