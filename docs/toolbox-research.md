# MS-CODEX TOOLBOX 调研产出
**面向：用户 Review**

调研范围：高达模型拼装/涂装全流程所需工具的"亚类知识图谱"，参考淘宝热门店铺（一诺动漫、蓝天高达模型城、樱花日本动漫社商）+ 中文社区（知乎、虎扑模玩区、78dm、百度贴吧）+ 万代官方书籍《高达模型涂装指导手册》。

最终目的：作为 `/data/tool-subcategories.json` 种子数据，用于 TOOLBOX 模块 + 工坊视觉墙。

---

## 一、淘宝店铺与社区分类参考

我看了下高达圈主流分类方式，**和我之前给你的 6 大类骨架基本对得上**，但有几个调整建议：

### 主流社区分类法（参考"高达模型涂装指导手册"+ 78dm + 蓝天高达模型城）

```
1. 工具类（手动）           = 我们的「剪 + 打磨 + 修饰（笔涂）+ 辅助」
2. 涂装设备（电动）         = 我们的「涂装-喷涂相关」
3. 油漆 / 耗材              = 我们的「涂装-漆 + 修饰-渗线水贴消光」
4. 工作环境 / 安全          = 我们的「收纳 + 工作环境」
```

社区不严格区分"工具/耗材"，而是按**操作流程**分。流程是：
**剪件 → 削水口 → 打磨 → 洗件 → 渗线 → 贴贴纸 → 拼装 → 消光**

### 我的调整建议

基于这个流程视角，我把原来的 6 大类微调成 **6 大类（数量不变）+ 重新分配亚类**：

| 大类 | 中文 | 包含 |
|------|------|------|
| **CUTTING** | 剪 / 切割 | 单刃钳、双刃钳、流道钳、笔刀、刀片 |
| **SANDING** | 打磨 | 打磨棒、砂纸、海绵砂纸、锉刀、抛光膏 |
| **PAINTING** | 涂装 | 笔涂笔、笔涂漆、喷笔、气泵、喷漆台、喷涂漆、稀释剂、水补土 |
| **FINISHING** | 修饰 | 渗线液、渗线笔、水贴、软化剂、消光/光油、旧化粉 |
| **ASSIST** | 辅助 | 镊子、持件夹、调色皿、模型台、胶水、开模器 |
| **WORKSPACE** | 工作环境 | 切割垫、零件分装盒、照明、防毒面具、吹尘球 |

---

## 二、亚类完整数据表（21 个亚类）

下面是给 review 的核心。每个亚类我提供：what / why / when / vs alternatives / urgency / pitfalls / 适用 grade / 工坊分区。

---

### 大类 1：CUTTING（剪 / 切割）

#### 1.1 单刃水口钳（single-blade nipper）

- **what_it_is**：一刃锋利、一刃为平砧的剪钳。社区俗称"小红钳"或"神之手钳"
- **why_you_need_it**：剪水口（零件与板架的连接点）时**水口痕几乎不留白**——这是双刃钳无法做到的
- **when_to_use**：拼装任何 grade 的所有零件取件，是和模型接触最多的工具
- **vs_alternatives**：vs **双刃钳**——双刃挤断会留白；vs **指甲剪/手术剪**——压根没法用
- **urgency**：必备 ★★★
- **pitfalls**：
  - 单刃刃薄易崩，**绝对不要剪铜线/钢丝/流道根部**（流道根部用双刃钳）
  - 不用时套钳套，平时不要随手放桌上
  - 国产小蓝钳是社区公认的智商税，请避免
- **recommended_for_grades**：HG / RG / MG / PG / EG / SD / SDCS / RE100 / FM 全部
- **工坊分区**：洞洞板（小工具，挂钩展示）

#### 1.2 双刃普通钳（double-blade nipper）

- **what_it_is**：两刃都开锋的剪钳。代表是田宫薄刃钳（74035）
- **why_you_need_it**：作为副钳处理**粗剪流道、铜棒打桩、修剪不需要精度的废件**——保护单刃钳不崩刃
- **when_to_use**：剪流道根部的"第一刀"、剪铜棒、剪不需要不留白的废件
- **vs_alternatives**：vs **单刃钳**——双刃耐造但留白；vs **流道钳**——流道钳粗大不灵活
- **urgency**：建议 ★★（有单刃钳后期补也行）
- **pitfalls**：
  - 不要拿双刃钳去精剪水口——会发白
  - 田宫金牌剪是经典款但常断货，可考虑国产 DSPIAE 替代
- **recommended_for_grades**：HG / RG / MG / PG（PG 流道粗，强烈建议有副钳）
- **工坊分区**：洞洞板

#### 1.3 笔刀（hobby knife）

- **what_it_is**：可换刃的精密小刀，像手术刀
- **why_you_need_it**：剪钳剪完留下的残留水口需要笔刀**贴肉削平**；切水贴；切胶带做遮盖
- **when_to_use**：每次剪件后的"第二步处理"
- **vs_alternatives**：vs **美工刀**——美工刀刃片有晃动、控制不精；vs **直接打磨**——笔刀比砂纸快十倍
- **urgency**：必备 ★★★
- **pitfalls**：
  - **会割手**！强烈建议配指套 / 切割垫
  - 刀片钝了立刻换，钝刀比利刀更危险（容易打滑）
  - OLFA 笔刀是社区公认顶级，田宫笔刀实际是 OLFA 代工
- **recommended_for_grades**：所有 grade
- **工坊分区**：洞洞板

#### 1.4 流道钳 / 大力钳（sprue cutter）

- **what_it_is**：粗壮的剪钳，专门剪粗流道
- **why_you_need_it**：PG 级别流道很粗，拿薄刃钳硬剪会崩
- **when_to_use**：仅 PG / PG-Unleashed / 大型 MG 改造时
- **vs_alternatives**：vs **双刃钳**——双刃钳剪粗流道也会崩
- **urgency**：进阶 ★（只有打 PG 才需要）
- **pitfalls**：留白严重，不能拿来剪零件
- **recommended_for_grades**：PG / PG-Unleashed
- **工坊分区**：洞洞板（如果有，否则收纳进抽屉）

---

### 大类 2：SANDING（打磨）

#### 2.1 打磨棒 / 打磨板（sanding stick / board）

- **what_it_is**：一块硬底板，配砂纸贴上去使用
- **why_you_need_it**：直接拿砂纸打磨会把零件打**磨成圆弧**——失去原本的锐利棱角；硬底板能保平整
- **when_to_use**：素组党可选；想做细节的"洗件"前必备
- **vs_alternatives**：vs **海绵砂纸**——海绵适合曲面、硬板适合平面
- **urgency**：建议 ★★
- **pitfalls**：
  - 不要买软底打磨棒（美甲那种），会把零件磨肉
  - 硬底优先：碳纤维、金属、塑料板。RAY 模师傅的打磨板是社区共识首选
- **recommended_for_grades**：HG / RG / MG / PG / RE100 / FM（SD/EG 可省）
- **工坊分区**：洞洞板（薄板可挂）

#### 2.2 砂纸（sandpaper）

- **what_it_is**：研磨纸，按"目数"区分粗细。数字越大越细
- **why_you_need_it**：磨除水口痕、合模线、表面瑕疵
- **when_to_use**：素组细节党；涂装前必做
- **vs_alternatives**：vs **海绵砂纸**——硬砂纸平面、海绵砂纸曲面
- **urgency**：建议 ★★
- **pitfalls**：
  - **必须从小目数到大目数渐进**：通常 600 → 800 → 1000 → 1500 → 2000
  - 推荐**水砂纸**（沾水使用），可以减少粉尘和砂纸损耗
  - 打磨后**戴口罩或用湿海绵收尘**——粉尘有害健康
- **recommended_for_grades**：所有需要做细节的 grade
- **工坊分区**：洞洞板（成卷或贴在板上挂）

#### 2.3 海绵砂纸（sponge file）

- **what_it_is**：软底海绵 + 砂面
- **why_you_need_it**：曲面、圆角、内凹——硬砂纸打不到的地方
- **when_to_use**：处理零件曲面、抛光阶段
- **vs_alternatives**：vs **砂纸**——硬平面用砂纸，曲面/抛光用海绵
- **urgency**：进阶 ★★
- **pitfalls**：海绵砂纸不要用来打平面，会把平面打圆
- **recommended_for_grades**：MG / PG / RG（精细打磨）
- **工坊分区**：洞洞板

#### 2.4 锉刀（file）

- **what_it_is**：金属磨锉条
- **why_you_need_it**：重度修整（合模线、改件、补件）
- **when_to_use**：改造党 / 整改老模型
- **vs_alternatives**：vs **砂纸**——锉刀力度大但容易过头；砂纸细但慢
- **urgency**：进阶 ★（素组完全不用）
- **pitfalls**：手抖直接磨穿零件
- **recommended_for_grades**：改造场景，不分 grade
- **工坊分区**：工作台（一组通常 4-5 把，放笔筒）

#### 2.5 抛光膏（polishing compound）

- **what_it_is**：膏状研磨剂，配棉布抛光
- **why_you_need_it**：做镜面效果（透明件、金属漆面）
- **when_to_use**：完成细节阶段，做高光泽收尾
- **urgency**：进阶 ★（顶配玩家才用）
- **recommended_for_grades**：MG / PG（追求展示级品质）
- **工坊分区**：工作台

#### 2.6 刻线推刀（panel scriber）

- **what_it_is**：带钩刃的精密推拉式工具，能在塑料件表面刻出精细凹槽线条。和笔刀切割不同，刻线推刀是"推刮"出沟槽，留下整齐的 V 形或 U 形凹线
- **why_you_need_it**：万代很多模型刻线偏浅或缺失，刻线推刀能让你**自行加深或新增刻线**，让渗线效果更立体；也是改件党的核心工具——重新规划装甲分割线
- **when_to_use**：想加深默认刻线、添加新刻线增加细节、改件后重新设计装甲走线时
- **vs_alternatives**：vs **笔刀**——笔刀是切割，刻线推刀是推刮，刻线效果更整齐、深度可控；vs **刻线针**——刻线针只能划痕，无法形成真凹槽
- **urgency**：进阶 ★
- **pitfalls**：
  - 推刀刃极易跑偏，必须配合刻线胶带"沿胶带边引导"
  - 初学者容易用力过猛刻穿装甲——力度由刀本身重量决定，不需要按压
  - BMC 黑魔等品牌 0.1 / 0.15 / 0.2mm 三档常用，新手 0.15 最易上手
- **recommended_for_grades**：MG / MG-VerKa / PG / PG-Unleashed / RE100
- **工坊分区**：洞洞板

#### 2.7 刻线胶带 / 引导胶带（scribing guide tape）

- **what_it_is**：极细（0.4–1mm）的高粘性胶带，专门用作刻线推刀的"引导轨道"。贴在零件表面，沿胶带边缘推刀，确保刻线笔直不跑偏
- **why_you_need_it**：徒手用刻线推刀几乎必跑偏。胶带本身就是"轨道"——不需要稳定手腕，只要刀刃贴着胶带边缘走即可
- **when_to_use**：使用刻线推刀时配套使用，几乎不单独使用
- **vs_alternatives**：vs **田宫遮盖带**——遮盖带太宽（6mm 起），且边缘没那么锋利。专用刻线胶带边缘更利、宽度更细
- **urgency**：进阶 ★
- **pitfalls**：
  - 常用宽度 0.4 / 0.7 / 1mm，配套刻线推刀不同力度
  - 日本 HIQ Parts、田宫"刻线导引胶带"是常见品牌
  - 贴的时候避免气泡，否则刻线会随气泡偏移
- **recommended_for_grades**：MG / MG-VerKa / PG / PG-Unleashed / RE100
- **工坊分区**：洞洞板

---

### 大类 3：PAINTING（涂装）

#### 3.1 笔涂笔 / 面相笔（detail brush）

- **what_it_is**：细毛笔。"面相笔"特指最细的一档（5/0、10/0 号）
- **why_you_need_it**：补色、点缀、写字、笔涂细节
- **when_to_use**：HG 的局部补色（动力管、传感器）；任何 grade 的眼睛细节
- **vs_alternatives**：vs **马克笔**——笔涂可控、马克笔粗但快
- **urgency**：建议 ★★
- **pitfalls**：
  - 用完立刻洗，硝基/珐琅漆干硬就毁笔
  - 田宫 HF 系列、郡士 PRO 系列、温莎牛顿都是社区共识好货
- **recommended_for_grades**：所有 grade
- **工坊分区**：工作台（笔筒里）

#### 3.2 笔涂漆（brush-on paint）

- **what_it_is**：用刷子能上的漆。社区主流是**水性漆**（郡士 AQUEOUS、田宫水性）和**珐琅漆**（田宫 X / XF 系列）
- **why_you_need_it**：补色 / 笔涂的颜料源头
- **when_to_use**：所有需要上色的场景
- **vs_alternatives**：水性 vs 油性硝基 vs 珐琅
  - **水性漆**：笔涂友好、味道小、覆盖力一般
  - **硝基漆**：覆盖力强、味道大、不适合笔涂（干太快）
  - **珐琅漆**：缓干、笔涂神器、但溶剂可能伤塑料
- **urgency**：建议 ★★（只看素组可不买）
- **pitfalls**：
  - 不要混用不同体系的漆（水/油/珐琅会互相反应）
  - 珐琅漆稀释剂不要直接接触塑料件
- **recommended_for_grades**：所有
- **工坊分区**：左/右柜子（多瓶展示，玻璃柜风）

#### 3.3 喷笔（airbrush）

- **what_it_is**：精密喷涂工具，靠气压把漆雾化
- **why_you_need_it**：大面积均匀上色、阴影、渐变、金属漆
- **when_to_use**：进入正式喷涂阶段后
- **vs_alternatives**：
  - **双动喷笔**（push 出气、pull 出漆）—— 主流，灵活
  - **单动喷笔**——气漆联动，简单但不灵活
- **urgency**：进阶 ★★（不喷涂完全可以不要）
- **pitfalls**：
  - **必备配套**：气泵 + 喷漆台 + 防毒面具（缺一不可）
  - 用完必须清洗，硝基漆不洗笔会报废
  - 0.3mm 口径是新手最佳——0.2mm 太细易堵、0.5mm 太粗
  - 入门款：HD-130（百元国产）、郡士 PS-289（六百左右）
  - 顶级：岩田 HP-CS、汉莎 H-Plus
- **recommended_for_grades**：MG / PG / RG（涂装党）
- **工坊分区**：右柜子（电动设备区）

#### 3.4 气泵（compressor）

- **what_it_is**：给喷笔提供稳定气压的电动泵
- **why_you_need_it**：喷笔的命根子，没气泵喷笔就是装饰
- **when_to_use**：和喷笔一套
- **vs_alternatives**：
  - **模型泵**（优速达 601G、浩盛 AF18-2）：静音小巧，价 300-700
  - **工业泵**（奥突斯 8L 双缸）：声音大但便宜耐用，价 280-500
  - **便携泵**：户外用，气压不太稳
- **urgency**：进阶 ★★（绑定喷笔）
- **pitfalls**：
  - 楼房住户优先模型泵——工业泵噪音扰邻
  - **必须有储气罐**，否则气压抖动严重
  - 长时间使用气泵会发热，间歇休息或加风扇
- **recommended_for_grades**：MG / PG（涂装党）
- **工坊分区**：右柜子（设备区，柜子下层）

#### 3.5 喷漆台 / 喷漆箱（spray booth）

- **what_it_is**：带排风扇的小箱子，把油漆雾气抽出室外
- **why_you_need_it**：**安全！** 油漆雾化吸入肺会要命；同时减少落灰
- **when_to_use**：所有喷涂作业
- **vs_alternatives**：vs **直接在阳台喷**——阳台无法挡灰，邻居投诉
- **urgency**：进阶 ★★★（一旦喷涂就必备）
- **pitfalls**：
  - 排风必须接到室外或开窗，**不能内循环**
  - 入门款：迪斯派 / 模研能者（300-1000）
  - 高端：模研能者水帘款（带水雾过滤，2000+）
- **recommended_for_grades**：MG / PG（涂装党）
- **工坊分区**：左柜子（独立设备）

#### 3.6 喷涂漆（spray-grade paint）

- **what_it_is**：硝基漆为主，主流品牌：郡士 Mr.Color、盖亚 GaiaNotes、田宫硝基、狐火御调漆、喵匠预调漆
- **why_you_need_it**：喷笔用漆的源头
- **when_to_use**：喷涂阶段
- **vs_alternatives**：硝基/水性/珐琅 见 3.2
- **urgency**：进阶 ★★
- **pitfalls**：
  - 必须用**对应的稀释剂**——硝基用硝基溶剂、水性用水性溶剂
  - 金属漆要用专用溶剂稀释
  - 油漆有毒，**必须搭配防毒面具**
- **recommended_for_grades**：涂装场景
- **工坊分区**：左/右柜子

#### 3.7 水补土（surfacer / primer）

- **what_it_is**：底漆，喷在塑料件表面给后续漆面"打底"
- **why_you_need_it**：让面漆附着力更强、颜色更准、暴露细节问题
- **when_to_use**：喷涂前；改件后填缝
- **vs_alternatives**：水补土 vs 普通底漆——水补土兼具底漆和填补功能
- **urgency**：进阶 ★★
- **pitfalls**：
  - 灰色（500/1000/1200）最常用，黑色用于深色面漆
  - 喷得太厚会糊住细节
- **recommended_for_grades**：涂装场景
- **工坊分区**：左柜子

---

### 大类 4：FINISHING（修饰）

#### 4.1 渗线液（panel liner）

- **what_it_is**：低粘度颜料，能自动渗入零件凹槽
- **why_you_need_it**：让模型刻线/缝隙变得**立体感强烈**——这是素组到"看着像样"的最大单一变量
- **when_to_use**：拼装前或拼装后均可
- **vs_alternatives**：vs **勾线笔**——勾线笔需要手稳画线；渗线液点一下自动流
- **urgency**：建议 ★★★（强烈推荐，新手友好）
- **pitfalls**：
  - **饼干化风险**：田宫珐琅漆基底的渗线液有概率让塑料变脆。不放心可先喷一层光油保护
  - 颜色：**黑色（最常用）**、灰色（白色机体）、棕色（暖色机体）
  - 田宫 87131-87133、郡士 GM02-04 是社区主流
- **recommended_for_grades**：所有 grade
- **工坊分区**：洞洞板（小瓶能挂或放搁板）

#### 4.2 渗线笔（panel liner pen）

- **what_it_is**：渗线液的笔形版本，按压自动出墨
- **why_you_need_it**：比液体渗线液**更可控**，新手更友好
- **when_to_use**：替代或补充渗线液
- **vs_alternatives**：vs **渗线液**——笔形便携、液体覆盖更好
- **urgency**：建议 ★★（和液体二选一即可）
- **pitfalls**：用前充分摇晃，否则颜色不均
- **recommended_for_grades**：所有 grade
- **工坊分区**：洞洞板

#### 4.3 水贴 / 干贴 / 水贴软化剂（decals & setter）

- **what_it_is**：印有图案的薄膜贴纸（**水贴**沾水后揭下贴；**胶贴**直接撕贴；**干贴/刮贴**摩擦转印）
- **why_you_need_it**：模型自带细节贴纸，万代有的给水贴有的给胶贴
- **when_to_use**：模型完成度的"最后一公里"
- **vs_alternatives**：水贴最薄但难贴；胶贴最厚但简单；刮贴中庸
- **urgency**：必备 ★★★（拼装一定会用）
- **pitfalls**：
  - 水贴需要**软化剂**配合，否则贴不平、不服帖曲面
  - 田宫 87193 / 郡士 Mr.Mark Setter 是经典软化剂
- **recommended_for_grades**：所有 grade
- **工坊分区**：洞洞板（小瓶 + 镊子配套）

#### 4.4 消光 / 光油 / 半消光（topcoat）

- **what_it_is**：透明保护漆，喷或涂在最外层
- **why_you_need_it**：
  - **消光**：去掉塑料光泽，模型瞬间从"玩具"变"模型"
  - **光油**：增加光泽，适合金属漆面
  - **半消光**：折中
- **when_to_use**：所有完成步骤之后的最后一道
- **vs_alternatives**：消光 vs 光油 见上
- **urgency**：建议 ★★★
- **pitfalls**：
  - **罐装喷漆**新手友好（无需喷笔），但味道大需通风
  - 喷消光后**不能再贴水贴**——表面会变粗糙
  - 水性消光（如郡士新水性）味道较小，适合家用
- **recommended_for_grades**：所有 grade
- **工坊分区**：左柜子（喷罐）

#### 4.5 旧化粉 / 旧化液（weathering pigment / wash）

- **what_it_is**：模拟战损、生锈、灰尘的颜料
- **why_you_need_it**：增加机体真实感（高达圈称为"做铁血风"或"军模化"）
- **when_to_use**：进阶完成后的风格化处理
- **urgency**：进阶 ★（不做完全 ok）
- **pitfalls**：很容易做过头变难看，少量多次
- **recommended_for_grades**：铁血风 / IBO 类机体
- **工坊分区**：左柜子

---

### 大类 5：ASSIST（辅助）

#### 5.1 镊子（tweezers）

- **what_it_is**：精密夹取工具
- **why_you_need_it**：贴水贴/胶贴的唯一选择——手指太粗
- **when_to_use**：贴贴纸、夹小零件
- **vs_alternatives**：vs **手指**——手指会留指纹和油渍
- **urgency**：必备 ★★
- **pitfalls**：
  - **直头**适合大部分场景；**弯头**适合特殊角度
  - 防静电款（黑色）更安全，不易弹飞贴纸
- **recommended_for_grades**：所有
- **工坊分区**：洞洞板

#### 5.2 持件夹 / 鳄鱼夹（alligator clips on stick）

- **what_it_is**：竹签 + 夹子，用来夹住零件喷涂
- **why_you_need_it**：喷涂时不能手拿零件——会留指纹/挡漆
- **when_to_use**：所有喷涂场景
- **urgency**：建议 ★★（绑定喷涂）
- **pitfalls**：
  - 数量要够多（一台 MG 喷涂同时需要 30+ 个夹）
  - 夹子有粗细，搭配使用
- **recommended_for_grades**：涂装场景
- **工坊分区**：工作台（一筒筒插着）

#### 5.3 调色皿 / 调色盘（palette）

- **what_it_is**：装漆调色用的小皿
- **why_you_need_it**：调色 / 漆从瓶里倒出来用更可控
- **urgency**：建议 ★（笔涂喷涂都需要）
- **pitfalls**：硝基漆会腐蚀塑料调色盘——优先用陶瓷或不锈钢
- **recommended_for_grades**：涂装场景
- **工坊分区**：工作台

#### 5.4 模型台 / 转台（display stand / turntable）

- **what_it_is**：旋转底座，放零件方便观察
- **why_you_need_it**：喷涂时旋转看死角；展示时 360 度看
- **urgency**：进阶 ★
- **recommended_for_grades**：MG / PG / 大型机体
- **工坊分区**：工作台（中央偏，配合高达模型剪影）

#### 5.5 胶水（model cement / glue）

- **what_it_is**：粘接剂。**田宫绿盖溜缝胶**最常用
- **why_you_need_it**：万代模型理论上不需要胶（snap-fit），但改件、固定关节需要
- **when_to_use**：改件 / 旧零件松动 / 修补
- **vs_alternatives**：
  - **502 / 瞬间胶**：通用、强力但留白
  - **田宫绿盖溜缝胶**：流动性强、用于无缝处理
  - **田宫白盖**：粘稠、固定零件
  - **郡士透明接着剂**：粘透明件不留雾
- **urgency**：进阶 ★（万代正常拼装可不要）
- **pitfalls**：502 在塑料表面**会留白雾**，谨慎用
- **recommended_for_grades**：改件场景
- **工坊分区**：洞洞板（多种小瓶集中挂）

#### 5.6 开模器 / 分件器（part separator）

- **what_it_is**：薄片金属/塑料，撬开拼错的零件
- **why_you_need_it**：万代零件一旦扣紧，徒手拆容易断
- **when_to_use**：拼错时救急
- **vs_alternatives**：vs **笔刀**——熟练后笔刀可代替，但新手安全起见用专用工具
- **urgency**：建议 ★★（保险起见）
- **pitfalls**：金属开模器力度大易刮伤；塑料款易断
- **recommended_for_grades**：所有
- **工坊分区**：洞洞板

---

### 大类 6：WORKSPACE（工作环境）

#### 6.1 切割垫（cutting mat）

- **what_it_is**：自愈合塑料垫板
- **why_you_need_it**：保护桌面 + 保护笔刀刀刃 + 标尺辅助
- **when_to_use**：所有工作时铺桌面上
- **urgency**：必备 ★★
- **pitfalls**：A4 太小、A2 太大，**A3 是黄金尺寸**
- **recommended_for_grades**：所有
- **工坊分区**：工作台（铺桌面，作为整个工作台的视觉基底）

#### 6.2 零件分装盒（parts organizer）

- **what_it_is**：多格塑料盒
- **why_you_need_it**：板件剪下后按部位分类，避免找件浪费时间
- **when_to_use**：MG/PG 这种零件多的场景
- **urgency**：建议 ★★（HG 可省）
- **recommended_for_grades**：MG / PG
- **工坊分区**：左/右柜子（堆叠展示）

#### 6.3 桌面照明（desk light）

- **what_it_is**：可调亮度色温的台灯
- **why_you_need_it**：暗光下做模型 = 自残
- **urgency**：建议 ★★（很容易被低估）
- **pitfalls**：
  - 优先**显色指数 Ra > 90** 的灯（颜色判断准）
  - 5000K 中性光是模型环境黄金色温
- **recommended_for_grades**：所有
- **工坊分区**：工作台（夹在桌沿，挑高）

#### 6.4 防毒面具（respirator）

- **what_it_is**：带活性炭滤芯的口罩
- **why_you_need_it**：硝基漆有强毒性，吸入伤肝肾
- **when_to_use**：所有喷涂作业
- **urgency**：必备 ★★★（涂装场景一旦做就必须有）
- **pitfalls**：
  - 普通医用口罩**没用**——挡飞沫不挡有机蒸汽
  - 推荐 3M 6200 或 7502 半面罩 + 6001 有机滤芯
- **recommended_for_grades**：涂装场景
- **工坊分区**：右柜子（设备区，挂壁挂或放置顶层）

#### 6.5 吹尘球 / 静电刷（dust blower / brush）

- **what_it_is**：吹气球或抗静电毛刷
- **why_you_need_it**：喷涂前除尘——零件上一粒灰会让漆面毁了
- **when_to_use**：喷涂前；展示前
- **urgency**：进阶 ★（喷涂党必备）
- **recommended_for_grades**：涂装场景
- **工坊分区**：工作台

#### 6.6 工具收纳盒（tool organizer）

- **what_it_is**：专门收纳模型工具的多格盒子或工具架，区别于零件分装盒——这个是装钳子、笔刀、镊子等"工具"本体
- **why_you_need_it**：工具乱堆桌面会被刻线推刀刺到、笔刀划到。专用收纳盒让每件工具有"家"，桌面干净也找件快
- **when_to_use**：工具数量超过 10 件时强烈建议——前期可省略，但收藏满满一墙工具后必备
- **vs_alternatives**：vs **零件分装盒**——分装盒装小零件（板件剪下来后分类），收纳盒装工具本体。两者都需要
- **urgency**：进阶 ★
- **pitfalls**：
  - 推荐分隔深浅不同的多格盒——长笔刀和短镊子需要的格子尺寸不同
  - 部分工具（如刻线推刀刃片）需要专用刀架，普通收纳盒装不下
  - 推荐品牌：田宫工具收纳箱、国产 RAY 模师傅木质工具架
- **recommended_for_grades**：所有 grade
- **工坊分区**：右柜子

---

## 三、工坊视觉布局规划（16:9）

### 整体三分区图

```
┌──────────────────────────────────────────────────────────────────────┐
│  我的工坊 // MY WORKSHOP                       17 / 27 已点亮  ⚙ ⚒ ⚙   │
├─────────────┬──────────────────────────────────────┬─────────────────┤
│             │                                      │                 │
│   左柜子     │         上方洞洞板 (PEGBOARD)          │     右柜子       │
│             │                                      │                 │
│ ┌─────────┐ │  ⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪    │ ┌─────────┐    │
│ │ 喷漆台   │ │  ⚪[钳]⚪[刀]⚪[镊]⚪[砂]⚪[渗]⚪    │ │ 喷笔     │    │
│ │ (大件)   │ │  ⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪    │ │          │    │
│ └─────────┘ │  ⚪[贴]⚪[胶]⚪[镊]⚪[棒]⚪[笔]⚪    │ └─────────┘    │
│             │  ⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪    │                 │
│ ┌─────────┐ ├──────────────────────────────────────┤ ┌─────────┐    │
│ │ 漆瓶柜   │ │      工作台 (WORKBENCH)              │ │ 气泵     │    │
│ │ (展示    │ │                                      │ │          │    │
│ │  漆瓶)   │ │  [切割垫 = 工作台底面/地图]            │ └─────────┘    │
│ └─────────┘ │                                      │                 │
│             │  [面相笔筒][调色皿]  ┌──────┐ [转台]  │ ┌─────────┐    │
│ ┌─────────┐ │                    │ 高达 │         │ │ 防毒面具 │    │
│ │ 消光罐   │ │  [持件夹筒]         │ 剪影 │ [锉刀]  │ │ (挂壁)   │    │
│ │ 喷罐组   │ │                    │ RX   │         │ └─────────┘    │
│ └─────────┘ │                    │  78-2│         │                 │
│             │                    └──────┘         │ ┌─────────┐    │
│             │                                      │ │ 分装盒   │    │
│             │   [开模器] [灯]                       │ │  堆叠    │    │
│             │                                      │ └─────────┘    │
└─────────────┴──────────────────────────────────────┴─────────────────┘
```

### 三分区分配（27 个亚类位置）

**洞洞板（小工具，挂钩展示，14 个）**：
1. 单刃水口钳
2. 双刃普通钳
3. 笔刀
4. 流道钳
5. 打磨棒
6. 砂纸
7. 海绵砂纸
8. 渗线液
9. 渗线笔
10. 水贴 + 软化剂（合并视觉）
11. 镊子
12. 胶水（多种小瓶集中一个钩）
13. 开模器
14. 笔涂笔（如果空间够）

**工作台（中央桌面，9 个）**：
- 切割垫（作为整个工作台的"地面"，铺底）
- 中央 RX-78-2 高达剪影（视觉锚点，不是工具）
- 面相笔筒
- 调色皿
- 持件夹筒
- 锉刀（笔筒里）
- 抛光膏
- 转台 / 模型台
- 吹尘球 / 静电刷
- 桌面照明（夹桌沿，向中央照）

**左柜子（大件 + 漆瓶展示，4 个）**：
- 喷漆台（顶层，最大）
- 漆瓶柜（笔涂漆 + 喷涂漆 + 水补土，玻璃柜风）
- 消光 / 光油喷罐
- 旧化粉 / 旧化液

**右柜子（电动设备 + 防护，4 个）**：
- 喷笔（顶层）
- 气泵（中层）
- 防毒面具（挂壁或顶层挂钩）
- 零件分装盒（堆叠展示，底层）

### 视觉风格

- **背景**：深蓝 blueprint 底 + 等距小圆孔（CSS radial-gradient）模拟洞洞板表面
- **柜子**：木纹 + blueprint 边框（外形偏工业风）
- **工作台**：浅灰桌面 + 切割垫纹理（淡淡的方格 / 标尺）
- **未拥有工具**：SVG 轮廓线 muted 色（`text-muted/30`），opacity 0.3
- **已拥有工具**：SVG 轮廓线 magenta 或 cyan，opacity 1.0，**轻微外发光**（box-shadow blur）
- **悬停**：tooltip 显示工具名 + 已购的具体型号（点击进详情页）

---

## 四、SVG 图标方案

### 调研结论

调研下来，用 **Lucide / Tabler / Heroicons + 自绘补漏** 是最稳的方案。具体匹配：

| 亚类 | 图标方案 | 备选库 |
|------|---------|--------|
| 单刃钳 / 双刃钳 / 流道钳 | Lucide `scissors` 改造 | Tabler `tool` |
| 笔刀 | Lucide `slice` 或自绘 | — |
| 打磨棒 / 砂纸 / 锉刀 | 自绘（社区图标库无） | — |
| 海绵砂纸 | 自绘（同上） | — |
| 抛光膏 | Lucide `circle-dot` 或自绘 | — |
| 笔涂笔 | Lucide `paintbrush` | Tabler `brush` |
| 笔涂漆 / 喷涂漆 | Lucide `palette` 或瓶子图标 | Heroicons `beaker` |
| 喷笔 | 自绘（必须，复杂形态） | — |
| 气泵 | 自绘 | Tabler `air-conditioning` 改 |
| 喷漆台 | 自绘 | — |
| 水补土 | Lucide `spray-can` | — |
| 渗线液 / 渗线笔 | Lucide `pen-line` | — |
| 水贴 + 软化剂 | Lucide `sticker` | — |
| 消光 / 光油 | Lucide `spray-can` | — |
| 旧化粉 / 旧化液 | Lucide `droplet` 或自绘 | — |
| 镊子 | 自绘（必须） | — |
| 持件夹 | 自绘 | — |
| 调色皿 | Lucide `circle` 或 `palette` | — |
| 模型台 / 转台 | Lucide `disc` | — |
| 胶水 | Lucide `flask-conical` | — |
| 开模器 | 自绘 | — |
| 切割垫 | 不需要单独图标（作为工作台底面纹理） | — |
| 零件分装盒 | Lucide `package` 或 `archive` | — |
| 桌面照明 | Lucide `lamp` | — |
| 防毒面具 | 自绘（必须，社区图标无） | — |
| 吹尘球 / 静电刷 | Lucide `wind` | Tabler `feather` |

**自绘工作量**：约 8-10 个亚类需要自绘 SVG。这部分让 Code 来画——给定参考描述（"剪钳轮廓：两个长柄 + 短刃，张开 30 度"）让它生成 SVG path。质量未必完美但风格统一。

**RX-78-2 高达剪影**：社区有不少 free SVG 资源。我建议用 Bandai 官方 RX-78-2 logo 或 Wikipedia 上的官方剪影线稿——直立姿态，正视图。这部分让 Code 找一个 free use 的 SVG 资源放进 `/public/icons/gundam-silhouette.svg`。

---

## 五、数据 schema 建议（JSON 落地）

```typescript
type ToolSubcategory = {
  id: string                       // 'single-blade-nipper'
  category: ToolCategory           // 'cutting' | 'sanding' | ...
  
  name_zh: string
  name_en: string
  
  // 知识图谱核心（让用户理解"为什么需要它"）
  what_it_is: string               // 1-2 句话
  why_you_need_it: string          // 1-2 句话
  when_to_use: string              // 1 句话
  vs_alternatives?: string         // 1-2 句话，对比同类
  
  // 决策辅助
  urgency: 'essential' | 'recommended' | 'advanced'  // 必备/建议/进阶
  pitfalls: string[]               // 1-3 条新手坑
  
  // 联动 HANGAR
  recommended_for_grades: Grade[]
  
  // 工坊视觉
  workshop_zone: 'pegboard' | 'workbench' | 'cabinet-left' | 'cabinet-right'
  workshop_position: { x: number; y: number }   // 工坊画布上的位置（0-100 百分比）
  icon: string                     // SVG 文件名 或 lucide-react 名称
  
  // 第二阶段才填的字段（暂时空）
  popular_products?: ToolProduct[] // 留空，下一轮调研填
}

type ToolCategory = 'cutting' | 'sanding' | 'painting' | 'finishing' | 'assist' | 'workspace'
type Urgency = 'essential' | 'recommended' | 'advanced'
type WorkshopZone = 'pegboard' | 'workbench' | 'cabinet-left' | 'cabinet-right'
```

---

## 六、给你 review 的清单

请确认以下事项：

1. **27 个亚类**是否齐全？要加 / 减 / 合并的告诉我
2. **三分区分配**有没有想调的（比如把某个工具从洞洞板挪到工作台）
3. **urgency 三档**（必备 / 建议 / 进阶）的判定有没有想改的
4. **schema 字段**够不够，要不要加 `difficulty_to_learn`（学习曲线）这种字段
5. **图标方案**——同意 lucide + 自绘混合？还是想要纯自绘统一风格？

review 完之后我写 Prompt 05A，让 Code 落地这份数据 + 实装工坊页（先实装"亚类层级"，"具体型号"留 05B）。
