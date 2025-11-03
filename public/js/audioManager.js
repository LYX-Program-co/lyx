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
    }
};