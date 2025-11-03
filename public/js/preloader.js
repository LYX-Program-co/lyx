const Preloader = {
    // 资源路径已统一为绝对路径 /assets/...
    ASSET_LIST: [
        // 核心图片 (在 public/assets/ 目录下)
        '/assets/8888.png', 
        '/assets/9999.png', 
        '/assets/500.png', 
        '/assets/501.png',

        // 卷轴符号图片 (在 public/assets/symbols/ 目录下, 补全 104-110)
        '/assets/symbols/100.png', 
        '/assets/symbols/101.png', 
        '/assets/symbols/102.png',
        '/assets/symbols/103.png',
        '/assets/symbols/104.png', 
        '/assets/symbols/105.png', 
        '/assets/symbols/106.png', 
        '/assets/symbols/107.png', 
        '/assets/symbols/108.png', 
        '/assets/symbols/109.png', 
        '/assets/symbols/110.png', 
        '/assets/symbols/300.png',
        '/assets/symbols/301.png',
        '/assets/symbols/302.png',
        
        // 音频文件 (在 public/assets/audio/ 目录下, 路径已修正)
        '/assets/audio/spin.wav', 
        '/assets/audio/stop.wav', 
        '/assets/audio/ui-click.wav',
        '/assets/audio/win-big.wav', 
        '/assets/audio/free-spin.wav', 
        '/assets/audio/jingle-trigger.wav',
        '/assets/audio/main.wav', 
        '/assets/audio/win-small.wav'
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
                        console.error('Audio load failed (continuing preloader):', url);
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
                        console.error('Image load failed (404 likely, continuing preloader):', url);
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
