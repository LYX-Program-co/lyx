const Preloader = {
    // 资源路径统一使用 /assets/ 作为前缀，这是因为 app.py 将 public 文件夹作为根目录
    // 并且符号列表已更新为 100-110, 300-302
    ASSET_LIST: [
        // 核心图片 (在 public/assets/ 目录下)
        '/assets/8888.png', 
        '/assets/9999.png', 
        '/assets/500.png', 
        '/assets/501.png',

        // 卷轴符号图片 (在 public/assets/symbols/ 目录下)
        '/assets/symbols/100.png', 
        '/assets/symbols/101.png', 
        '/assets/symbols/102.png',
        '/assets/symbols/103.png',
        '/assets/symbols/104.png', // 新增 104
        '/assets/symbols/105.png', // 新增 105
        '/assets/symbols/106.png', // 新增 106
        '/assets/symbols/107.png', // 新增 107
        '/assets/symbols/108.png', // 新增 108
        '/assets/symbols/109.png', // 新增 109
        '/assets/symbols/110.png', // 新增 110
        '/assets/symbols/300.png',
        '/assets/symbols/301.png',
        '/assets/symbols/302.png',
        
        // 音频文件 (在 public/assets/audios/ 目录下)
        '/assets/audios/spin.wav',        // 路径修正：添加 /assets/audios/
        '/assets/audios/stop.wav',        // 路径修正：添加 /assets/audios/
        '/assets/audios/ui-click.wav',    // 路径修正：添加 /assets/audios/
        '/assets/audios/win-big.wav',     // 路径修正：添加 /assets/audios/
        '/assets/audios/free-spin.wav',   // 路径修正：添加 /assets/audios/
        '/assets/audios/jingle-trigger.wav', // 路径修正：添加 /assets/audios/
        '/assets/audios/main.wav',        // 路径修正：添加 /assets/audios/
        '/assets/audios/win-small.wav'    // 路径修正：添加 /assets/audios/
    ],
    preloadedAssets: new Map(),

    load: async (onProgress) => {
        const total = Preloader.ASSET_LIST.length;
        let loaded = 0;

        const promises = Preloader.ASSET_LIST.map(url => {
            return new Promise((resolve, reject) => {
                // 检查文件扩展名（支持 .wav, .mp3 等，尽管您的列表只有 .wav）
                if (url.endsWith('.wav') || url.endsWith('.mp3')) {
                    const audio = new Audio();
                    audio.addEventListener('canplaythrough', () => {
                        Preloader.preloadedAssets.set(url, audio);
                        onProgress(++loaded, total);
                        resolve();
                    });
                    // Audio 无法加载或出错也应 resolve，避免卡住 preloader
                    audio.addEventListener('error', () => {
                        console.error('Audio load failed or could not play:', url);
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
                    // 图片加载出错会导致 reject，是卡住 preloader 的原因，将其改为 resolve
                    img.onerror = () => {
                        console.error('Image load failed (404 likely):', url);
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
