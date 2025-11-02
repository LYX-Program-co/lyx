# slot_math.py
import random

REEL_STRIPS = [
    [100]*20 + [101]*15 + [102]*10 + [300]*3 + [301]*1 + [302]*1,
    [100]*18 + [101]*16 + [102]*12 + [300]*3 + [301]*1 + [302]*0,
    [100]*15 + [101]*15 + [102]*15 + [300]*4 + [301]*1 + [302]*0,
    [100]*12 + [101]*12 + [102]*12 + [300]*10 + [301]*2 + [302]*2,
    [100]*18 + [101]*14 + [102]*10 + [300]*5 + [301]*2 + [302]*1
]

PAYTABLE = {
    100: [0, 0, 2, 5, 10],
    101: [0, 0, 4, 8, 18],
    102: [0, 0, 5, 10, 25],
    300: [0, 0, 11, 28, 55],
    301: [0, 0, 0, 0, 0],
    302: [0, 0, 15, 40, 80]
}

PAYLINES_25 = [
    [1,1,1,1,1], [0,0,0,0,0], [2,2,2,2,2], [0,1,1,1,2], [2,1,1,1,0],
    [1,0,1,0,1], [0,0,1,2,2], [2,2,1,0,0], [1,2,1,0,1], [0,1,2,1,0],
    [2,1,0,1,2], [1,0,2,0,1], [0,2,0,2,0], [2,0,2,0,2], [1,1,2,1,1],
    [0,0,2,0,0], [2,2,0,2,2], [1,2,0,2,1], [0,1,0,1,0], [2,1,2,1,2],
    [1,0,1,2,1], [0,2,1,0,2], [2,0,1,2,0], [1,1,0,1,1], [0,2,2,0,2]
]

WILD_SYMBOL = 302
SCATTER_SYMBOL = 301

def generate_spin_and_eval(total_bet, lines):
    bet_per_line = total_bet // lines
    matrix = [[0]*3 for _ in range(5)]
    wins = []
    features = []

    # 生成矩阵
    stops = [random.randint(0, len(REEL_STRIPS[i])-1) for i in range(5)]
    for col in range(5):
        strip = REEL_STRIPS[col]
        for row in range(3):
            matrix[col][row] = strip[(stops[col] + row) % len(strip)]

    # 评估 Paylines
    total_win = 0
    for line_idx, line in enumerate(PAYLINES_25[:lines]):
        symbols = [matrix[c][line[c]] for c in range(5)]
        count, win = evaluate_line(symbols, bet_per_line)
        if win > 0:
            total_win += win
            wins.append({"line": line_idx, "count": count, "symbol": symbols[0], "win": win})

    # Scatter 触发 Free Spins
    scatter_count = sum(1 for col in matrix for sym in col if sym == SCATTER_SYMBOL)
    if scatter_count >= 3:
        spins_won = {3: 8, 4: 12, 5: 20}.get(scatter_count, 0)
        features.append({"type": "FreeSpins", "spins_won": spins_won})

    # Big Win 特效
    if total_win >= total_bet * 15:
        features.append({"type": "BigWin", "duration_sec": 7})

    return matrix, total_win, wins, features

def evaluate_line(symbols, bet):
    first = symbols[0]
    if first == SCATTER_SYMBOL:
        return 0, 0
    count = 1
    for sym in symbols[1:]:
        if sym == first or sym == WILD_SYMBOL:
            count += 1
        else:
            break
    payout = PAYTABLE.get(first, [0]*5)[count] if count >= 2 else 0
    return count, payout * bet