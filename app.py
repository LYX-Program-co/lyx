# app.py
from flask import Flask, send_from_directory, request, jsonify
from flask_cors import CORS
import slot_math as math

app = Flask(__name__, static_folder='public', static_url_path='')
CORS(app)

# 模拟用户状态
USER_DATA = {
    "default": {
        "balance": 1000000,
        "freeSpinsRemaining": 0,
        "lastResult": None
    }
}
CURRENT_USER = "default"

@app.route('/')
def index():
    return send_from_directory('public', 'index.html')

@app.route('/<path:path>')
def static_files(path):
    return send_from_directory('public', path)

@app.route('/api/spin', methods=['POST'])
def spin():
    try:
        user = USER_DATA[CURRENT_USER]
        data = request.get_json() or {}
        bet_per_line = data.get('betPerLine', 1)
        lines = data.get('lines', 25)
        total_bet = bet_per_line * lines
        is_free = user["freeSpinsRemaining"] > 0

        if not is_free and user["balance"] < total_bet:
            return jsonify({"error": "Insufficient funds"}), 400

        if is_free:
            user["freeSpinsRemaining"] -= 1
        else:
            user["balance"] -= total_bet

        matrix, win, wins, features = math.generate_spin_and_eval(total_bet, lines)
        user["balance"] += win

        for f in features:
            if f["type"] == "FreeSpins":
                user["freeSpinsRemaining"] += f.get("spins_won", 0)

        resp = {
            "matrix": matrix,
            "winAmount": win,
            "updatedBalance": user["balance"],
            "wins": wins,
            "featuresTriggered": features,
            "freeSpinsRemaining": user["freeSpinsRemaining"]
        }
        user["lastResult"] = resp
        return jsonify(resp)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/getState')
def get_state():
    user = USER_DATA[CURRENT_USER]
    return jsonify({
        "balance": user["balance"],
        "freeSpinsRemaining": user["freeSpinsRemaining"],
        "lastResult": user["lastResult"]
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)