# 卡比论坛（/community）页面设计文档（桌面优先）

## 1) Layout
- 栅格：以 **8px** 为基础单位（padding/margin/圆角/阴影位移均对齐 8 的倍数）。
- 布局方式：外层 `container + max-w-5xl` 居中；内部使用“像素窗口 PixelWindow”承载四种视图（列表/发帖/详情/个人资料）。
- 响应式：
  - Desktop：双列信息密度更高（例如列表项右侧 meta 行更完整、图片区更宽）。
  - Mobile：保持单列堆叠，不改变信息层级；按钮文案可缩短（现有逻辑已做）。

## 2) Meta Information
- Title：卡比论坛 | CARMEN
- Description：像素风社区讨论区：发帖、回帖、点赞与标签。
- OpenGraph：
  - og:title=卡比论坛
  - og:description=像素风社区讨论区
  - og:type=website

## 3) Global Styles（模块作用域：.kirby-pixel）
> 仅对论坛生效，避免影响全站现有粉色主题。

### 3.1 颜色（建议令牌）
- --k-bg: #FFF7FD（偏白粉底）
- --k-panel: #FFFFFF
- --k-ink: #1B1B1B（像素描边主色）
- --k-pink: #FF4FB8（主强调）
- --k-pink-2: #FF8AD8（次强调）
- --k-blue: #4FD6FF（提示/高亮）
- --k-warn: #FF5A5A（危险/举报/删除）

### 3.2 字体与排版
- 标题：DotGothic16（项目已配置），字号更“块状”。
- 正文：保持现有 sans，但在论坛内可将正文行高收敛到 1.5–1.7 提升像素密度。
- 文本抗锯齿：论坛容器内可用 `text-rendering: geometricPrecision;`（可选）。

### 3.3 像素形态规则
- 圆角：0/4/8px（避免 2xl/3xl 大圆角）。
- 边框：2–3px 实线（--k-ink）。
- 阴影：硬阴影（示例：`box-shadow: 6px 6px 0 var(--k-ink);`），不使用大面积 blur。
- 背景纹理：轻度棋盘格/点阵（opacity 3–6%），避免喧宾夺主。
- 动效：保留 framer-motion，但缓动尽量使用更“step”的节奏（时长 120–180ms），不改变进出场逻辑。

## 4) Page Structure
- 顶部：论坛标题区（图标 + “卡比论坛”）
- 主体：PixelWindow（固定最小高度，内部视图切换）
- 视图：
  1. 列表视图 ForumList
  2. 发帖视图 CreatePost
  3. 详情视图 PostDetail
  4. 个人资料视图 UserProfile

## 5) Sections & Components

### 5.1 列表视图（ForumList）
- Header Bar（同一行）：
  - 左：搜索框（保持现有输入，不新增搜索逻辑；仅视觉像素化）
  - 右：主按钮“New Post”、次按钮“My Profile”或未登录时“Login to Post”（行为不变）
- Tag Filter Strip：显示当前筛选标签与清除 X。
- Post List：
  - 列表项为 PostListItem（PixelCard）：
    - 左：头像 PixelAvatar（圆形可保留，但加 2px 描边与硬阴影）
    - 中：标题（1 行截断）、摘要（2 行截断）、图片预览条（最多 3 张 + 计数块）、标签 Chips
    - 下：Meta 行（作者/日期/分类/点赞按钮/回复数）
    - 右上：置顶 Pin（旋转徽标保留，仅像素化描边）

交互态：
- Hover：背景从 panel → 淡粉格子底；边框高亮（--k-pink）；阴影位移可轻微变化（不影响点击区域）。
- Like：已点赞态使用 --k-pink 填充；未点赞态仅描边。

### 5.2 发帖视图（CreatePost）
- 顶部：PixelHeaderBar（返回按钮 + 标题）。
- 表单区（两列在桌面可增强排版，但字段顺序与校验不变）：
  - Title：PixelInput（粗描边 + focus 高亮框）
  - Category：Segment 按钮组（现有 4 类不变）
  - Tags：Chip 列表 + 输入 + Add 按钮（行为不变）
  - Content：PixelTextarea
  - Images：
    - 缩略图网格（硬边框）
    - “Add Image” 虚线框改为像素虚线（2px dash 风格）
- 提交按钮：PixelButton Primary（禁用态降低饱和度 + 不改 disabled 逻辑）。

### 5.3 详情视图（PostDetail）
- Sticky 顶栏：返回 + 标题（保持 sticky 与 blur，不改结构；blur 可减弱以更像“掌机屏幕”）。
- 主帖卡：
  - 作者区：头像 + 昵称 + ADMIN Badge + 时间 + 分类 Pill
  - 正文：保持 whitespace-pre-wrap
  - 图片：全宽图加像素边框与硬阴影
  - 标签：PixelChip（不可点击，现逻辑如此）
  - 操作行：Report（danger 视觉）+ Like（primary/active 视觉）
  - 举报面板：ReportPanel（像素窗口内嵌，不改变提交流程）
- 回复区：ReplyItem 列表（左头像 + 右消息泡；泡泡改硬边框与“像素缺口”角）。
- 底部回复框：Sticky 输入 + 发送 IconButton（不改提交逻辑）。

### 5.4 个人资料视图（UserProfile）
- 顶部：返回 + 标题。
- 资料区：
  - 头像：可点击上传（保留现 input/label 方案），外圈改像素边框。
  - 字段：Email（只读展示）、Nickname（编辑态 PixelInput + Save/Cancel PixelButton）。
- 我的帖子：
  - 状态 Badge（approved/rejected/pending）保持颜色语义，但统一像素描边。
  - 删除按钮：danger 文案按钮（保留 confirm 行为）。

## 6) 可复用组件（落地到代码的命名建议）
- `PixelWindow` / `PixelHeaderBar` / `PixelCard`
- `PixelButton` / `PixelIconButton`
- `PixelInput` / `PixelTextarea`
- `PixelChip` / `PixelBadge`
- `PixelEmptyState` / `PixelLoadingState`
- `PostListItem` / `ReplyItem` / `ReportPanel` / `ImagePreviewStrip`
