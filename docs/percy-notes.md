# Percy 学习笔记

这份笔记记录的是在这个 repo 里实际试过、看到过结果的东西。每条结论后面标了是从哪个 PR 或 build 学到的，方便回头查。

## 1. Percy 是怎么工作的

- Percy **不在你的浏览器里截图**。`percySnapshot()` 会把当前页面的 DOM 和 CSS 序列化后上传，Percy 再在它自己的浏览器里重新渲染。
- 每个 snapshot 会渲染 **4 个浏览器 × 2 个宽度**：Chrome、Firefox、Edge、Safari，宽度 375 和 1280（见 `.percy.yml`）。所以一个 snapshot 在 Percy 上显示成 8 张图，例如 "8/8 有变化"。
- 因为是重新渲染，**鼠标位置和焦点不会跟着过去**，所以 hover 和 focus 要专门处理（见第 5 节）。
- 只有用 `percy exec -- <测试命令>` 包着跑、并且设置了 `PERCY_TOKEN`，`percySnapshot()` 才会真的上传；否则它什么都不做，测试照常跑。

## 2. Percy 和 Playwright 怎么分工

| | Playwright | Percy |
|---|---|---|
| 负责 | **行为**：点了有没有反应、焦点顺序、颜色值对不对（`toHaveCSS`） | **外观**：整页长什么样，多浏览器、多宽度 |
| 基准 | 写在断言里，不需要图片 | 存在 Percy 云端，不进 git |
| 出问题时 | 测试变红，CI 失败 | build 里出现 diff，等人 review |

最早我们也用过 Playwright 自带的截图对比（`toHaveScreenshot`），后来去掉了：截图交给 Percy，Playwright 只管行为。

## 3. 基准（baseline）规则

- **PR 的 build 跟目标分支（main）上最近的 build 比。**
- **只有合并进 main 的改动才会成为新基准。** 在 Percy 上 approve 一个 PR 的 build，只是让这个 PR 通过检查，不会改变基准；PR 不合并，下一个 PR 还是跟 main 比。
- 一开始我们在 CI 里设过 `PERCY_TARGET_BRANCH`，后来删了（PR #3）。Percy 默认就会用 PR 的目标分支，不需要手动设。
- 本地跑出来的 build 也会进 Percy 项目。布局还没调好的时候在本地跑，就会产生"坏基准"，下一次 CI 的 build 会把"从坏变好"也算成 diff（Storybook 项目的 build #1、#2 → #3）。

## 4. Review 和 CI 卡点

### Percy 自己不会让 CI 失败
`percy exec` 只负责上传。即使有 diff，这个 job 也是绿的。CI 里的 `percy` job 失败，只会是因为 Playwright 的断言失败了。

### 真正卡住 PR 的是 GitHub 集成的状态检查
1. 在 Percy 项目设置里，把 **approval required** 的分支设成 `main`。
2. 安装 **Percy GitHub integration**。之后每个 PR 上会多一个状态检查，名字是 `percy/<项目名>`，比如 `percy/vivian-test-1-b4de68b3`。
3. 在 GitHub 的 branch protection 里，把这个检查设成 required。我们 main 上 required 的是 `percy/vivian-test-1-b4de68b3`、`percy`、`a11y`，并且打开了 enforce_admins。
   - 免费账号下私有 repo 不能开 branch protection（API 返回 403），所以这个 repo 改成了 public。

这样一来，PR 有未 review 的 diff 时，这个检查是黄的，PR 合不了；在 Percy 上 approve 之后检查变绿，才能合并。

### 哪些情况会卡住 PR
| 情况 | Percy 上显示 | 例子 |
|---|---|---|
| 已有截图有变化 | "N visual changes need review" | PR #4 改了错误文字 |
| 新增一个 snapshot | 新截图没有基准，也算"需要 review" | PR #5 |
| 删掉一个 snapshot | "1 missing snapshot found" | PR #6 |
| 什么都没变 | 自动通过，0 diff | — |

### Percy 绿了，不代表 PR 能合
PR #8 把 "Maybe later" 按钮设成 `tabIndex={-1}`。页面看起来完全一样，Percy 显示 0 diff，但 a11y 和 percy 两个 job 都失败了，因为 Tab 顺序断言没通过。**看不出来的问题只有 Playwright 能抓到。**

## 5. hover 和 focus

Percy 重新渲染时没有鼠标和焦点，需要在 `percySnapshot` 里明确告诉它：

| 状态 | 写法 | 注意 |
|---|---|---|
| hover | `pseudoClassEnabledElements: { selectors: ['#primary-btn'] }` | 官方文档里的写法。它会把大约 400 个计算后的样式抄成 `!important` |
| focus | `enablePseudoClassSerialization: true` | 需要 `@percy/cli` ≥ 1.32.8。`@percy/playwright` 1.1.2 的类型里还没有这个选项，所以要类型断言（`as Parameters<typeof percySnapshot>[2]`） |

- 不要用 `pseudoClassEnabledElements` 拍 focus：它会把 input 的 placeholder 拍成黑字，因为 `-webkit-text-fill-color` 被固定成了 `rgb(0,0,0)`。
- Percy 支持 `:hover`、`:focus`、`:focus-within`、`:active`，**不支持 `:focus-visible`**，所以这个 demo 的 CSS 用的是 `:focus`。
- 点击之后鼠标和焦点会停在按钮上。拍结果页（错误、成功）之前，先把鼠标移开、让元素失去焦点（`clearInteraction(page)`）。

## 6. Percy 看得出什么、看不出什么

### 细微颜色变化很容易漏掉
下面这些改动，Percy 都报了 0 diff 或者几乎没报：
- 背景 `#f5f6f8` → `#eef2ff`
- 细边框和小字的红色 `#dc2626` → `#9f1239`（PR #4 一开始只改颜色，被自动通过了）
- 主按钮蓝色 `#2563eb` → `#1d4ed8`
- 次按钮 hover 背景的变化，在 Safari 上是 0 diff

**关键颜色要用 Playwright 的 `toHaveCSS('background-color', 'rgb(...)')` 断言**，不要指望 Percy。

### 尺寸变化会让整张图都变红
比如副标题变长、多折了一行，卡片高度就变了。卡片是垂直居中的，整张卡片会一起移动，所有 snapshot 都会变红。review 时要分清楚：是真的很多地方变了，还是一处改动带着整个布局移了位。

### Percy 测不了无障碍语义
截图看不出 Tab 顺序、role、accessible name。这些用 Playwright 测（`tests/a11y.spec.ts`，打了 `@a11y` 标签）：
- `toBeFocused`：焦点顺序
- `getByRole`、`toHaveRole`、`toHaveAccessibleName`、`toHaveAccessibleDescription`
- `toMatchAriaSnapshot`：整块的无障碍树
- `@axe-core/playwright`：自动规则扫描

（以上在 Playwright 1.64 上都确认过可用。）

## 7. Storybook + Percy

### 基本用法
- 每个 story 自动变成一个 Percy snapshot，名字是 `Signup: <Story 名>`。**不需要写任何 snapshot 代码。**
- 先构建，再上传：`npm run build-storybook`，然后 `npx percy storybook ./storybook-static`。
- 状态直接写在 story 的 markup 里，例如 `defaultValue="hello@"` 加上 `className="invalid"`，不用像 Playwright 那样一步步点出来。
- 单个 story 的 Percy 选项写在 `parameters.percy` 里，比如 `skip`、`name`、`waitForSelector`、`additionalSnapshots`、`enableJavaScript`。

### Storybook 要用单独的 Percy 项目
如果和 Playwright 共用一个项目，每个 build 里另一边的 snapshot 都会被当成 "missing"。所以 Storybook 用了单独的项目，token 存在 GitHub secret `PERCY_TOKEN_STORYBOOK` 里。CI 里的 `storybook` job 目前不是 required check。

### hover 和 focus：storybook-addon-pseudo-states
- 在 story 里写 `parameters: { pseudo: { hover: ['#primary'] } }`，或者 `{ focus: ['#email'] }`。用选择器只影响一个元素；写 `true` 会影响整个 story。
- **坑**：这个 addon 只在浏览器内存里（CSSOM）改写 `:hover` 和 `:focus` 规则，CSS 文件本身没变。Percy 用的是原始 CSS 文件，所以状态全部丢了（Storybook 项目 build #4）。
- **解决**：给这几个 story 加上 `parameters.percy.enableJavaScript: true`，让 Percy 重新执行 story 的 JS（build #5 之后四个状态都正常，placeholder 也还是灰色）。

### 布局坑
- Storybook 默认的 root 会缩成内容宽度（299px），卡片的位置和真实页面不一样。
- 试过 `display: contents`（水平居中失效）、`layout: 'centered'`（卡片贴在 x=0）、`gridTemplateColumns: '100%'`（没效果）。
- 最后在 `.storybook/preview.tsx` 里加了一个装饰器，外面包一层 `width: 100vw; min-height: 100vh; display: grid; place-items: center` 的 div，才和真实页面一样。
- 改 `.storybook/main.ts`（比如加 addon）之后，要重启 `npm run storybook`。

### 改一处只红一处
build #8 只改了 Subscribed story 里的一句文字。结果只有 `Signup: Subscribed` 这一个 story 有 diff（8/8，最大 0.45%），其他 story 全部 "No changes"。这正好说明 story 拆得越细，diff 定位越准。

## 8. CI 配置要点

`.github/workflows/percy.yml` 里有三个 job：

| job | 做什么 | token |
|---|---|---|
| `percy` | `percy exec -- playwright test --grep-invert @a11y` | `PERCY_TOKEN` |
| `a11y` | `playwright test --grep @a11y`，不经过 Percy | 不需要 |
| `storybook` | 构建 Storybook，然后 `percy storybook` | `PERCY_TOKEN_STORYBOOK` |

- a11y 测试单独一个 job，失败的原因一眼就能看清，也不会产生 Percy snapshot。
- 不用 `container:`。GitHub 的 container job 是在同一台 VM 上再跑一个容器，实测 a11y job 从 34 秒变成了 41 秒，没有好处（PR #9，已关闭）。

## 9. PR 时间线

| PR | 学到了什么 |
|---|---|
| #2 | 基础搭建 |
| #3 | 删掉 `PERCY_TARGET_BRANCH`，默认就跟目标分支比 |
| #4 | 只改颜色会被 Percy 漏掉（0 diff，自动通过）；加了文字改动才被拦住 |
| #5 | 新增 snapshot 需要 review |
| #6 | 删掉 snapshot 会出现 "missing snapshot" |
| #7 | 加了 a11y job |
| #8 | Percy 0 diff，但 Tab 顺序断言失败，PR 被拦住 |
| #9 | container 实验，变慢了，已关闭 |
| #10 | Storybook + Percy、pseudo-states、`enableJavaScript` |
