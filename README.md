# MD 阅读器

![License](https://img.shields.io/badge/License-Apache--2.0-blue)
![React](https://img.shields.io/badge/React-19-61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178c6)
![Vite](https://img.shields.io/badge/Vite-6-646cff)

一个专注于**阅读体验**的 Markdown 在线阅读器。所有文件都在浏览器本地解析渲染，不依赖任何后端服务，也不向服务器上传内容——打开即用，关闭即走。

## 功能特性

### 导入

- 选择单个或多个 `.md` / `.markdown` / `.txt` 文件
- 选择整个文件夹，自动读取其中所有 Markdown 文档
- 拖拽文件到页面直接导入
- 粘贴文本快速渲染，或一键载入示例文档

### 阅读

- **目录导航**：自动根据文档标题生成目录，滚动时实时高亮当前章节，点击跳转
- **多文档管理**：批量导入后按路径排序，顶栏下拉随时切换
- **阅读进度记忆**：按文档自动保存阅读位置和章节，重新打开时恢复到上次读到的地方
- **阅读设置**：
  - 三档主题：浅色 / 护眼（羊皮纸色）/ 深色
  - 字号（14–22px）与行高（1.4–2.1）自由调节
  - 内容宽度三档可调（窄 / 标准 / 宽）
- 侧栏可折叠，支持沉浸式全宽阅读

### 搜索

- 当前文档全文搜索，正文中关键词即时高亮
- 搜索结果列表带章节摘录，支持上一处 / 下一处循环跳转

### 渲染

- 支持 GFM 扩展语法：表格、任务列表、删除线等
- 代码块语法高亮，一键复制代码内容
- 图片懒加载，链接新窗口打开

### 其他

- 响应式布局，窄屏自动切换为抽屉式目录 / 设置面板
- 设置项本地持久化，下次打开自动恢复

## 技术栈

| 类别 | 技术 |
| --- | --- |
| 框架 | React 19 |
| 语言 | TypeScript 5.7（严格模式） |
| 构建工具 | Vite 6 |
| Markdown 渲染 | react-markdown 10 + remark-gfm 4 + rehype-highlight 7 |
| 状态与存储 | React Hooks + localStorage |

## 快速开始

### 环境要求

- Node.js **18.0 及以上**（推荐 20 LTS 或更高版本）
- npm（随 Node.js 附带）

### 安装与运行

```bash
# 1. 克隆仓库
git clone https://github.com/chennanqm/md-reading-web.git
cd md-reading-web

# 2. 安装依赖
npm install

# 3. 启动开发服务器（默认 http://localhost:5173）
npm run dev
```

### 脚本说明

| 命令 | 说明 |
| --- | --- |
| `npm run dev` | 启动开发服务器，支持热更新 |
| `npm run build` | 类型检查 + 生产构建，输出到 `dist/` |
| `npm run preview` | 本地预览生产构建产物 |

## 项目结构

```
md-reading-web/
├── index.html                      # 入口 HTML
├── package.json                    # 依赖与脚本
├── tsconfig.json                   # TypeScript 配置
├── vite.config.ts                  # Vite 配置
└── src/
    ├── main.tsx                    # 应用入口
    ├── app/
    │   ├── App.tsx                 # 根组件，状态与交互编排
    │   └── router.tsx
    ├── components/                 # UI 组件
    │   ├── TopBar.tsx              # 顶栏：搜索、文档切换、进度
    │   ├── TOCSidebar.tsx          # 目录侧栏
    │   ├── MarkdownViewer.tsx      # Markdown 渲染与标题锚点
    │   ├── SearchPanel.tsx         # 搜索结果面板
    │   ├── SettingsPanel.tsx       # 阅读设置面板
    │   ├── UploadArea.tsx          # 导入区：文件/文件夹/文本
    │   ├── EmptyState.tsx          # 空状态首页
    │   └── FloatingActions.tsx     # 悬浮操作按钮
    ├── features/reader/            # 阅读器领域逻辑
    │   ├── reader-types.ts         # 类型定义
    │   ├── reader-store.ts         # 默认设置与存储键
    │   └── reader-hooks.ts         # localStorage Hook
    ├── services/                   # 纯函数服务层
    │   ├── file-service.ts         # 文件读取与文档构建
    │   ├── markdown-service.ts     # 语法解析、slug、高亮
    │   ├── search-service.ts       # 全文搜索
    │   ├── toc-service.ts          # 目录提取
    │   ├── storage-service.ts      # localStorage 封装
    │   └── document-progress-service.ts  # 阅读进度存取
    └── styles/
        └── global.css              # 全局样式与主题变量
```

## 部署到 GitHub Pages

本项目为纯静态站点，`npm run build` 产出的 `dist/` 可部署到任意静态托管服务。以 GitHub Pages 为例：

1. 修改 `vite.config.ts`，将 `base` 设为仓库名（部署到 `https://chennanqm.github.io/<仓库名>/` 时必须设置）：

   ```ts
   export default defineConfig({
     base: '/md-reading-web/',  // 改成你的仓库名
     plugins: [react()],
   });
   ```

2. 构建并发布：

   ```bash
   npm run build
   npx gh-pages -d dist
   ```

3. 在仓库 **Settings → Pages** 中确认来源为 `gh-pages` 分支。

> 若部署到 `chennanqm.github.io` 主页仓库，则无需设置 `base`。

## 隐私说明

- 所有 Markdown 文件均由浏览器本地读取与渲染，**不经任何服务器**
- 阅读设置与进度保存在浏览器 localStorage，可在浏览器设置中随时清除
- 无统计埋点、无第三方追踪

## 浏览器兼容

支持现代浏览器（Chrome / Edge / Firefox / Safari 最新版）。

## 许可证

本项目基于 [Apache License 2.0](./LICENSE) 开源。
