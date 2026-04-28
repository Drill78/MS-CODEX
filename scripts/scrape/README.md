# MS-CODEX Scraper

抓取 Fandom (Real_Grade) + B站 wiki (RG模型) 两个数据源的 RG 规格线 kit
信息，merge 后输出到 `/data/kits.json`，盒绘下载到 `/public/images/kits/`。

## 使用

```bash
pnpm scrape           # 默认从 /data/raw/ 缓存读，无缓存才发请求
pnpm scrape:refresh   # 强制重新抓取所有源（图片 + HTML）
```

## 输出

- `/data/kits.json` —— 主输出，所有 RG kit
- `/data/works.json` —— Work 字典（来源于 works-mapping.ts）
- `/data/raw/fandom/real-grade.html` —— Fandom HTML 缓存
- `/data/raw/biligame/rg-mokei.html` —— B站 HTML 缓存
- `/data/reports/last-build.json` —— 上次跑的统计 + 错误清单
- `/public/images/kits/{kit.id}.jpg` —— 盒绘

## 失败排查

1. 看 `/data/reports/last-build.json`：
   - `source.*.errors` —— 抓取层错误
   - `errors.fandom_parse` / `errors.biligame_parse` —— 解析层错误
   - `merge.unmatched_biligame_list` —— B站有但 Fandom 没的，可能是 P-Bandai
   - `works.unmapped_list` —— 需要补到 `works-mapping.ts`
   - `images.failed_list` —— 图片下载失败的 kit id
2. 重跑 `pnpm scrape:refresh` 拿最新 HTML 再重试。

## 手动修正

编辑 `/data/manual-overrides.json`，结构：

```json
{
  "rg-rx-78-2": {
    "name_jp": "ガンダム",
    "build_time_estimate_hours": [4, 6]
  }
}
```

每个 key 是 kit.id，value 是要 patch 进对应 Kit 的字段（浅合并）。下次
`pnpm scrape` 会自动应用。

## 礼貌爬虫

- User-Agent 标识自己是 educational scraper
- 真实网络请求之间最少间隔 500ms
- 失败重试 3 次（指数退避 1/2/4s）
- 默认走本地缓存，避免重复打源站
