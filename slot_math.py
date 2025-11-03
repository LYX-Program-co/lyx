# slot_math.py
import random

# --- 卷轴已更新 (11 符号) ---
# 移除了 108, 109, 110
# 增加了 100, 101, 102 的数量
REEL_STRIPS = [
    # 卷轴 1
    [100]*13 + [101]*10 + [102]*8 + \
    [103]*5 + [104]*5 + [105]*4 + [106]*4 + [107]*3 + \
    [300]*3 + [301]*1 + [302]*1,
    
    # 卷轴 2
    [100]*14 + [101]*10 + [102]*8 + \
    [103]*6 + [104]*6 + [105]*5 + [106]*5 + [107]*2 + \
    [300]*3 + [301]*1 + [302]*0,
    
    # 卷轴 3
    [100]*13 + [101]*10 + [102]*8 + \
    [103]*5 + [104]*5 + [105]*4 + [106]*4 + [107]*3 + \
    [300]*4 + [301]*1 + [302]*0,
    
    # 卷轴 4
    [100]*14 + [101]*10 + [102]*8 + \
    [103]*6 + [104]*6 + [105]*5 + [106]*5 + [107]*2 + \
    [300]*10 + [301]*2 + [302]*2,
    
    # 卷轴 5
    [100]*13 + [101]*10 + [102]*8 + \
    [103]*5 + [104]*5 + [105]*4 + [106]*4 + [107]*3 + \
    [300]*5 + [301]*2 + [302]*1
]

# --- 赔率表已更新 (11 符号) ---
# 移除了 108, 109, 110
PAYTABLE = {
    # 基础符号
    100: [0, 0, 2, 5, 10],
    101: [0, 0, 4, 8, 18],
    102: [0, 0, 5, 10, 25],
    
    # 中级符号
    103: [0, 0, 6, 12, 30],
    104: [0, 0, 6, 12, 30],
    105: [0, 0, 7, 15, 35],
    106: [0, 0, 7, 15, 35],
    107: [0, 0, 8, 20, 40],

    # 高级/特殊符号
    300: [0, 0, 11, 28, 55],
    301: [0, 0, 0, 0, 0], # Scatter 靠数量触发
    302: [0, 0, 15, 40, 80]
}

PAYLINES_25 = [
    [1,1,1,1,1], [0,0,0,0,0], [2,2,2,2,2], [0,1,1,1,2], [2,1,1,1,0],
    [1_0,1,0,1], [0,0,1,2,2], [2,2,1,0,0], [1,2,1,0,1], [0,1,2,1,0],
    [2,1,0,1,2], [1,0,2,0,1], [0,2,0,2,0], [2,0,2,0,2], [1,1,2,1,1],
    [0,0,2,0,0], [2,2,0,2,2], [1,2,0,2,1], [0,1,0,1,0], [2,1,2,1,2],
    [1_0,1,2,1], [0,2,1,0,2], [2,0,1,2,0], [1,1,0,1,1], [0,2,2,0,2]
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
        
        # 查找赔付符号 (处理 WILD 在第一位的情况)
        first_symbol = symbols[0]
        if first_symbol == WILD_SYMBOL:
            non_wild_symbols = [s for s in symbols if s != WILD_SYMBOL and s != SCATTER_SYMBOL]
            if non_wild_symbols:
                first_symbol = non_wild_symbols[0]
            else:
                first_symbol = WILD_SYMBOL
        
        count, win = evaluate_line(symbols, first_symbol, bet_per_line)
        if win > 0:
            total_win += win
            wins.append({"line": line_idx, "count": count, "symbol": first_symbol, "win": win})

    # Scatter 触发 Free Spins
    scatter_count = sum(1 for col in matrix for sym in col if sym == SCATTER_SYMBOL)
    if scatter_count >= 3:
        spins_won = {3: 8, 4: 12, 5: 20}.get(scatter_count, 0)
        features.append({"type": "FreeSpins", "spins_won": spins_won})

    # Big Win 特效
    if total_win >= total_bet * 15:
        features.append({"type": "BigWin", "duration_sec": 7})

    return matrix, total_win, wins, features

def evaluate_line(symbols, pay_symbol, bet):
    if pay_symbol == SCATTER_SYMBOL:
        return 0, 0
    
    count = 0
    # 从左到右计算
    for sym in symbols:
        if sym == pay_symbol or sym == WILD_SYMBOL:
            count += 1
        else:
            break
    
    # 赔率表是 5 个元素的列表，索引 0-4 对应 1-5 个符号
    # PAYTABLE.get(...)[count-1] 确保 3 个符号时，取索引 2
    payout = PAYTABLE.get(pay_symbol, [0]*5)[count-1] if count > 0 else 0
    return count, payout * bet
