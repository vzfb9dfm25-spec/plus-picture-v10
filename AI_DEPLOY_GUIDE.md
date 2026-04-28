# AI_DEPLOY_GUIDE（V5.1 Gemini 免费 API 版）

## 你现在从哪里开始？
你可以直接从“上传到 GitHub”开始。

---

## 第1步：注册 / 登录 GitHub
如果你已经有 GitHub，直接跳到下一步。

---

## 第2步：新建一个仓库
1. 打开 GitHub
2. 点击右上角 `+`
3. 选择 `New repository`
4. 仓库名称建议填：`plus-live-generator-v51`
5. 点击 `Create repository`

---

## 第3步：上传这个压缩包解压后的全部文件
你会看到这些文件：
- index.html
- style.css
- script.js
- package.json
- README.md
- AI_DEPLOY_GUIDE.md
- api 文件夹

把它们全部上传到刚才新建的仓库里，然后点击 `Commit changes`

---

## 第4步：注册 / 登录 Vercel
建议直接用 GitHub 账号登录 Vercel。

---

## 第5步：在 Vercel 导入项目
1. 打开 Vercel
2. 点击 `Add New Project`
3. 选择你刚才上传的 GitHub 仓库
4. 点击 `Import`
5. 直接点击 `Deploy`

等待项目首次部署完成。

---

## 第6步：获取 Gemini 免费 API Key
1. 打开 Google AI Studio
2. 登录你的 Google 账号
3. 找到 `Get API key` 或 `Create API key`
4. 创建一个新的 Key
5. 复制保存好

---

## 第7步：把 API Key 配到 Vercel
1. 打开你的 Vercel 项目
2. 点击 `Settings`
3. 点击左侧 `Environment Variables`
4. 新增一个变量：
   - Name：`GEMINI_API_KEY`
   - Value：填你刚才复制的 API Key
5. 保存

---

## 第8步：重新部署
因为你刚添加了环境变量，所以要重新部署一次：
1. 点击 `Deployments`
2. 找到最近一次部署
3. 点击右侧菜单
4. 选择 `Redeploy`

---

## 第9步：开始测试
1. 打开 Vercel 给你的访问链接
2. 上传 1-3 张模板图
3. 点击 `AI生成背景图`
4. 等待生成完成
5. 生成的新图会自动进入缩略图列表，并显示在右侧预览区

---

## 第10步：如果失败了，优先检查这些地方
### 情况1：按钮点了没反应
- 看页面是不是最新部署版本
- 看 GitHub 上传的文件是否完整

### 情况2：提示未配置 GEMINI_API_KEY
- 说明 Vercel 里没有加环境变量
- 或者加完没有重新部署

### 情况3：提示 Gemini 生图失败
可能原因：
- Key 没创建成功
- Key 没有权限
- 模型暂时不可用
- 上传图片太大

建议先用 1 张较小的模板图测试。

---

## 最后提醒
- 本地双击打开 HTML，只能测试普通页面，不会调用 Vercel 的 API。
- AI 生图一定要在部署后的线上页面里测试。
