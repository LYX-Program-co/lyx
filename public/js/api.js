const API = {
    BASE_URL: (location.hostname === 'localhost' || location.hostname === '127.0.0.1')
        ? "http://127.0.0.1:5000" : "",

    getState: async () => {
        try {
            const res = await fetch(`${API.BASE_URL}/api/getState`);
            return res.ok ? await res.json() : null;
        } catch { return null; }
    },

    postSpin: async (betPerLine, lines) => {
        try {
            const res = await fetch(`${API.BASE_URL}/api/spin`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ betPerLine, lines })
            });
            return res.ok ? await res.json() : null;
        } catch { return null; }
    }
};