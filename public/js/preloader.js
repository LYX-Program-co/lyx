const Preloader = {
    ASSET_LIST: [
        'assets/8888.png', 'assets/9999.png', 'assets/500.png', 'assets/501.png',
        'assets/symbols/100.png', 'assets/symbols/101.png', 'assets/symbols/102.png',
        'assets/symbols/103.png', 'assets/symbols/300.png', 'assets/symbols/301.png',
        'assets/symbols/302.png',
        'assets/audio/spin.wav', 'assets/audio/stop.wav', 'assets/audio/ui-click.wav',
        'assets/audio/win-big.wav', 'assets/audio/free-spin.wav', 'assets/audio/jingle-trigger.wav',
        'assets/audio/main.wav', 'assets/audio/win-small.wav'
    ],
    preloadedAssets: new Map(),

    load: async (onProgress) => {
        const total = Preloader.ASSET_LIST.length;
        let loaded = 0;

        const promises = Preloader.ASSET_LIST.map(url => {
            return new Promise((resolve, reject) => {
                if (url.endsWith('.wav') || url.endsWith('.mp3')) {
                    const audio = new Audio();
                    audio.addEventListener('canplaythrough', () => {
                        Preloader.preloadedAssets.set(url, audio);
                        onProgress(++loaded, total);
                        resolve();
                    });
                    audio.addEventListener('error', reject);
                    audio.src = url;
                } else {
                    const img = new Image();
                    img.onload = () => {
                        Preloader.preloadedAssets.set(url, img);
                        onProgress(++loaded, total);
                        resolve();
                    };
                    img.onerror = reject;
                    img.src = url;
                }
            });
        });

        await Promise.all(promises);
    },
    get: (url) => Preloader.preloadedAssets.get(url)
};