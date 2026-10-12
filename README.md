# Percy + Playwright demo

一个 React（Vite + TypeScript）订阅表单页面，用来练习视觉回归测试：默认状态、按钮 hover、键盘 focus、错误态、成功态。

## 分工

| | Playwright | Percy |
|---|---|---|
| 负责 | 行为：hover 后颜色变没变（`toHaveCSS`）、Tab 焦点顺序（`toBeFocused`）、提交后的提示（`toBeVisible`） | 外观：4 个浏览器 × 2 个宽度渲染截图，团队在线 review |
| 基准图 | 没有——断言不依赖图片，换浏览器 / 系统都能跑 | 存在 Percy 云端，不进 git |
| 出问题时 | 测试变红 | build 里出现 diff，等人 Approve / Request changes |

## 本地运行

```bash
npm install
npx playwright install chromium
npm run dev       # 开发服务器 http://localhost:5173
npm test          # 先 vite build，再对打包结果跑 Playwright 断言
npm run report    # 打开 HTML 报告
```

## Percy

1. 在 https://percy.io 新建一个 **Web** 项目，复制 token。
2. 本地：`export PERCY_TOKEN=xxx && npm run percy`
3. CI：仓库 Settings → Secrets → Actions 加 `PERCY_TOKEN`，之后每次 push / PR 自动上传。

第一次 build 是基准；之后每个 build 只把有变化的截图标出来。在 Percy 上 Approve 的 build 就是新的基准。

## hover / focus

Percy 把 DOM 拿到它自己的浏览器重新渲染，鼠标和焦点不会跟过去，所以要显式告诉它：

| 状态 | 写法 | 说明 |
|---|---|---|
| hover | `pseudoClassEnabledElements: { selectors: ['#primary-btn'] }` | 官方文档的方式（CLI ≥ 1.31.5）。会把元素的计算样式抄成 `!important`，所以尺寸在各浏览器里会被固定成 Chrome 的值 |
| focus | `enablePseudoClassSerialization: true` | CLI ≥ 1.32.8（[percy/cli#2399](https://github.com/percy/cli/pull/2399)），网页文档还没写。只改写 `:focus` 规则，不抄样式——用 `pseudoClassEnabledElements` 拍 focus 会把 input 的 placeholder 拍成黑字 |

Percy 支持 `:hover` `:focus` `:focus-within` `:active`，**不支持 `:focus-visible`**，所以 CSS 里用的是 `:focus`。

点击之后鼠标和焦点会留在按钮上，拍"结果"类截图前先 `clearInteraction(page)`。
