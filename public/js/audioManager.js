const AudioManager = {
    sounds: {},
    init: () => {
        Preloader.ASSET_LIST.filter(u => u.endsWith('.wav')).forEach(url => {
            const name = url.split('/').pop().split('.')[0];
            AudioManager.sounds[name] = Preloader.get(url);
        });
    },
    play: (name) => {
        const s = AudioManager.sounds[name];
        if (s) { s.currentTime = 0; s.play().catch(() => {}); }
    },

    // --- 新增：BGM 循环播放功能 ---
    playLoop: (name) => {
        const s = AudioManager.sounds[name];
        if (s) {
            s.loop = true; // 设置为循环
            s.volume = 0.5; // 设置音量 (0.0 到 1.0)
            s.play().catch((e) => {
                // 浏览器可能需要用户交互才能播放
                console.warn('BGM 播放失败，等待用户交互...', e);
                // 添加一个一次性点击事件来解锁音频
                document.body.addEventListener('click', () => s.play(), { once: true });
            });
        }
    }
    // --- 新增结束 ---
};
