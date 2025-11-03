const Preloader = {
    ASSET_LIST: [
        // 核心图片
        '/assets/8888.png', 
        '/assets/9999.png', 
        '/assets/500.png', 
        '/assets/501.png',

        // 卷轴符号图片 (已确认 100-107, 300-302)
        '/assets/symbols/100.png', 
        '/assets/symbols/101.png', 
        '/assets/symbols/102.png',
        '/assets/symbols/103.png',
        '/assets/symbols/104.png', 
        '/assets/symbols/105.png', 
        '/assets/symbols/106.png', 
        '/assets/symbols/107.png', 
        '/assets/symbols/300.png',
        '/assets/symbols/301.png',
        '/assets/symbols/302.png',
        
        // 音频文件 (路径 /assets/audios/ )
        '/assets/audios/spin.wav', 
        '/assets/audios/stop.wav', 
        '/assets/audios/ui-click.wav',
        '/assets/audios/win-big.wav', 
        '/assets/audios/free-spin.wav', 
        '/assets/audios/jingle-trigger.wav',
        '/assets/audios/main.wav', 
        '/assets/audios/win-small.wav' // 路径已修正
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
                    // 修正: 即使音频加载失败，也 resolve，防止预加载器卡死
                    audio.addEventListener('error', () => {
                        console.error('Audio load failed (continuing):', url);
                        onProgress(++loaded, total);
                        resolve(); 
                    });
                    audio.src = url;
                } else {
                    const img = new Image();
                    img.onload = () => {
                        Preloader.preloadedAssets.set(url, img);
                        onProgress(++loaded, total);
                        resolve();
                    };
                    // 修正: 即使图片加载失败，也 resolve，防止预加载器卡死
                    img.onerror = () => {
                        console.error('Image load failed (continuing):', url);
                        onProgress(++loaded, total);
                        resolve(); 
                    };
                    img.src = url;
                }
            });
        });

        await Promise.all(promises);
    },
    get: (url) => Preloader.preloadedAssets.get(url)
};
