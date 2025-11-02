# ===============================
# 🎰 LYX Slot Game v3.0 Dockerfile
# ===============================

# 1️⃣ 选择轻量级 Python 运行环境
FROM python:3.10-slim

# 2️⃣ 设置工作目录
WORKDIR /app

# 3️⃣ 环境变量配置（生产优化）
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    FLASK_ENV=production \
    PORT=5000

# 4️⃣ 复制依赖清单并安装
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 5️⃣ 复制后端和前端文件
COPY app.py .
COPY slot_math.py .
COPY public ./public

# 6️⃣ 暴露端口（Render 使用此端口）
EXPOSE 5000

# 7️⃣ 使用 gunicorn 启动 Flask 应用
# gunicorn 是生产级 WSGI 服务器，比 flask run 更稳定
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "4", "--timeout", "120", "app:app"]