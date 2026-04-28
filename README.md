# MS-CODEX

> **GUNPLA BEGINNER CODEX** — 高达模型拼装入门导航网站

面向 Gunpla 新手的两件事：
- **TOOLBOX** — 工具库 checklist（按场景/阶段 tag + 三档价位 + 品牌渠道）
- **HANGAR** — 机体库（万代官方主流 plastic kit，含详细元数据）

两者通过 **CODEX**（个人收藏图鉴页）+ 机体→工具联动 串起来。

视觉风格：**UC blueprint**（深蓝技术档案感）× **Y2K**（荧光强调色 + 等宽字 + 轻量 CRT 扫线）混搭。

---

## 本地启动

```bash
pnpm install
pnpm dev
```

打开 http://localhost:3000 。

## 构建 / 部署

```bash
pnpm build
pnpm start
```

直接连接 Vercel 即可（零配置部署）。

## 路由表

| 路径                       | 用途                       |
| -------------------------- | -------------------------- |
| `/`                        | 着陆页                     |
| `/toolbox`                 | 工具库列表                 |
| `/toolbox/[slug]`          | 工具详情                   |
| `/hangar`                  | 机体库列表                 |
| `/hangar/[slug]`           | 机体详情                   |
| `/codex`                   | 个人收藏图鉴               |
| `/codex/import`            | 导入收藏数据               |
| `/codex/share`             | 分享收藏页                 |
| `/loadouts`                | 配置档案列表               |
| `/loadouts/[slug]`         | 配置档案详情               |
| `/about`                   | 关于                       |

## 技术栈

- Next.js 15（App Router）+ TypeScript（strict）
- Tailwind CSS v4
- shadcn/ui（按需添加组件）
- Framer Motion · Zustand（持久化）· nuqs
- ESLint + Prettier
- Node 20+

## 目录结构

```
app/                  路由与页面
  (routes)/           分组路由
components/
  atoms/              原子组件
  layout/             TopNav、Footer
lib/
  types/              领域类型
  constants/          枚举常量
data/                 静态数据（待填）
scripts/scrape/       数据抓取脚本（待实现）
```

## 状态

`v0.0.1` — 脚手架阶段，无业务逻辑、无数据。
