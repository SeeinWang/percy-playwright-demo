# Percy + Playwright demo

一个 React（Vite + TypeScript）订阅表单页面，用来练习视觉回归测试：默认状态、按钮 hover、键盘 focus、错误态、成功态。

## 两种截图

| | Playwright `toHaveScreenshot` | Percy `percySnapshot` |
|---|---|---|
| 在哪对比 | 本地，和 `tests/signup.spec.ts-snapshots/` 里的基准图比 | Percy 云端，和上一次 approve 的 build 比 |
| 需要账号 | 不需要 | 需要 `PERCY_TOKEN` |
| 怎么 review | 测试失败 → `npm run report` 看 diff | Percy 网页上逐张看 diff，Approve / Request changes |

## 本地运行

```bash
npm install
npx playwright install chromium
npm run dev              # 开发服务器 http://localhost:5173
npm test                 # 先 vite build，再对打包结果跑测试 + 本地截图对比
npm run report           # 打开 HTML 报告（失败时有 Expected / Actual / Diff 三张图）
npm run test:update      # 改了 UI 且确认是对的 → 更新本地基准图
```

## Percy

1. 在 https://percy.io 新建一个 **Web** 项目，复制 token。
2. 本地：`export PERCY_TOKEN=xxx && npm run percy`
3. CI：仓库 Settings → Secrets → Actions 加 `PERCY_TOKEN`，之后每次 push / PR 自动上传。

第一次 build 是基准（全部自动通过）；之后每个 build 只把有变化的截图标出来。

## hover / focus 的注意点

Percy 不是直接截你浏览器的图，而是把 DOM 发到它的浏览器重新渲染——那边没有鼠标。
所以 hover 要用 `pseudoClassEnabledElements` 告诉 Percy 强制哪个元素处于 hover：

```js
await percySnapshot(page, '主按钮 hover', {
  pseudoClassEnabledElements: { selectors: ['#primary-btn'] },
});
```

Percy 支持 `:hover` `:focus` `:focus-within` `:active`，**不支持 `:focus-visible`**，所以 CSS 里用的是 `:focus`。
