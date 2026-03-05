# ApplyAlberta Frontend - 设置指南

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量（可选）

如果需要修改后端 API 地址，创建 `.env` 文件：

```bash
# 复制示例文件
cp .env.example .env

# 编辑 .env 文件，修改后端地址（如果需要）
VITE_API_BASE_URL=http://localhost:8080
```

### 3. 启动开发服务器

```bash
npm run dev
```

前端会在 `http://localhost:5173` 启动（如果端口被占用，会自动选择 5174、5175 等）

## 常见问题

### CORS 错误（无法登录）

**问题：** 登录时出现 "Network Error" 或 CORS 错误

**原因：** 后端 CORS 配置没有包含前端运行的端口

**解决方案：**

1. **确保后端已启动** 并运行在 `http://localhost:8080`

2. **检查后端 CORS 配置**：
   - 后端会自动允许 `localhost:5173` 到 `localhost:5200` 的所有端口
   - 如果仍有问题，检查后端 `application.properties` 中的 `app.cors.allowed-origins` 配置

3. **重启后端服务**：
   - 如果修改了后端 CORS 配置，需要重启后端服务

4. **检查前端端口**：
   - 查看终端输出，确认前端运行在哪个端口
   - 例如：`Local: http://localhost:5174/`
   - 确保后端允许该端口

### 后端连接失败

**问题：** 所有 API 请求都失败

**解决方案：**

1. 确认后端服务正在运行（`http://localhost:8080`）

2. 检查 `.env` 文件中的 `VITE_API_BASE_URL` 是否正确

3. 检查防火墙设置，确保端口 8080 未被阻止

## 开发环境要求

- Node.js 20.19+ 或 22.12+
- npm 或 yarn
- 后端服务运行在 `http://localhost:8080`

## 构建生产版本

```bash
npm run build
```

构建产物在 `dist/` 目录
