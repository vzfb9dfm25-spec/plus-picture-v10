# PLUS Live Generator V5.2 (Gemini 免费 API 修正版)

这是一个可部署到 GitHub + Vercel 的直播间视觉图生成器。

## 已支持功能
- 上传模板图并切换缩略图预览
- 上传品牌 Logo，右侧预览区可拖拽 / 缩放
- 输入红包雨时间、主播名，并在预览区继续拖拽 / 编辑
- 生成直播标题，并支持“换一批”
- 上传产品贴片
- 一键导出 PNG
- 新增：接入 Gemini 免费 API，基于模板图生成“全新的直播间背景图”

## 部署前你需要准备
1. GitHub 账号
2. Vercel 账号
3. Google AI Studio 创建的 Gemini API Key

## 关键环境变量
在 Vercel 中添加：
- `GEMINI_API_KEY`

## 目录说明
- `index.html`：页面结构
- `style.css`：样式
- `script.js`：前端交互逻辑
- `api/generate-background.js`：Vercel Serverless API，调用 Gemini 做风格分析和背景图生成
- `AI_DEPLOY_GUIDE.md`：小白版部署说明

## 注意
- 本地双击 `index.html` 可以看静态页面，但 AI 生图接口只有部署到 Vercel 后才能使用。
- 建议一次上传 1-3 张模板图。
