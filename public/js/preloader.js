const Preloader = {
    ASSET_LIST: [
        // 核心图片 (4 张)
        '/assets/8888.png', 
        '/assets/9999.png', 
        '/assets/500.png', 
        '/assets/501.png',

        // 卷轴符号 (11 张)
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
        
        // --- 已添加 BGM: 必须要有音乐 ---
        '/assets/audios/main.wav', // BGM (背景音乐)
        
        // 音效 (5 个)
        '/assets/audios/spin.wav', 
        '/assets/audios/stop.wav', 
        '/assets/audios/ui-click.wav',
        '/assets/audios/win-big.wav', 
        '/assets/audios/free-spin.wav',
        
        // (jingle-trigger.wav 和 win-small.wav 仍未被使用，保持移除)
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
